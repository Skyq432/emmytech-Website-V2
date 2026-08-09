create or replace function public.consume_sms_product_handoff(
  p_handoff_token text,
  p_visitor_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_handoff public.sms_product_handoffs%rowtype;

  v_recipient public.sms_campaign_recipients%rowtype;
  v_lead public.sms_leads%rowtype;
  v_campaign public.sms_campaigns%rowtype;

  v_bootstrap jsonb;

  v_identity_id uuid;
  v_spin_player_id uuid;
  v_last_spin_at timestamptz;
begin

  if nullif(trim(p_visitor_id), '') is null
     or length(trim(p_visitor_id)) > 200 then
    raise exception 'A valid visitor is required.'
      using errcode = '22023';
  end if;


  if nullif(trim(p_handoff_token), '') is null
     or length(trim(p_handoff_token)) <> 64
     or trim(p_handoff_token) !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Invalid handoff token.'
      using errcode = '22023';
  end if;


  select *
  into v_handoff
  from public.sms_product_handoffs
  where token_hash =
    encode(
      extensions.digest(
        trim(p_handoff_token),
        'sha256'
      ),
      'hex'
    )
  for update;


  if not found then
    raise exception 'This handoff link is not valid.'
      using errcode = '22023';
  end if;


  if v_handoff.consumed_at is not null then
    raise exception 'This handoff link has already been used.'
      using errcode = '55000';
  end if;


  if v_handoff.expires_at <= now() then
    raise exception 'This handoff link has expired.'
      using errcode = '22023';
  end if;


  select *
  into strict v_recipient
  from public.sms_campaign_recipients
  where id = v_handoff.recipient_id;


  select *
  into strict v_lead
  from public.sms_leads
  where id = v_recipient.lead_id;


  select *
  into strict v_campaign
  from public.sms_campaigns
  where id = v_handoff.campaign_id;


  v_bootstrap :=
    public.bootstrap_canonical_wheel_visitor(
      trim(p_visitor_id),
      nullif(trim(v_lead.full_name), ''),
      nullif(trim(v_lead.phone_normalized), ''),
      null,
      null
    );


  select signal.identity_id
  into v_identity_id
  from public.identity_signals signal
  where signal.signal_type = 'visitor_id'
    and lower(trim(signal.signal_value)) =
        lower(trim(p_visitor_id))
  order by
    signal.verified desc,
    signal.confidence_weight desc,
    signal.last_seen_at desc
  limit 1;


  if v_identity_id is null then
    raise exception 'Customer identity could not be connected.'
      using errcode = '55000';
  end if;


  select player.id
  into v_spin_player_id
  from public.spin_players player
  where player.identity_id = v_identity_id
  limit 1;


  -- Most recent actual Spin & Save activity.
  select max(log.created_at)
  into v_last_spin_at
  from public.spin_logs log
  where log.spin_player_id = v_spin_player_id;


  update public.sms_product_handoffs
  set
    consumed_at = now(),
    visitor_id = trim(p_visitor_id),
    identity_id = v_identity_id,
    spin_player_id = v_spin_player_id
  where id = v_handoff.id;


  insert into public.website_visitor_attributions (
    visitor_id,
    identity_id,
    source_type,
    sms_campaign_id,
    sms_recipient_id
  )
  values (
    trim(p_visitor_id),
    v_identity_id,
    'sms_cashoff',
    v_campaign.id,
    v_recipient.id
  )
  on conflict (
    visitor_id,
    source_type,
    sms_campaign_id,
    sms_recipient_id
  )
  do update set
    identity_id = excluded.identity_id,
    last_seen_at = now();


  return
    v_bootstrap
    ||
    jsonb_build_object(
      'first_name',
      coalesce(
        nullif(trim(v_lead.first_name), ''),
        'there'
      ),
      'campaign_id',
      v_campaign.id,
      'campaign_name',
      v_campaign.name,
      'sms_recipient_id',
      v_recipient.id,
      'last_spin_at',
      v_last_spin_at
    );

end;
$$;


revoke all
on function public.consume_sms_product_handoff(text, text)
from public;


grant execute
on function public.consume_sms_product_handoff(text, text)
to anon, authenticated;
