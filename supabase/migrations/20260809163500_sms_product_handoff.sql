-- ============================================================
-- EMMYTECH SMS -> PRODUCT WEBSITE HANDOFF
-- ============================================================
-- A short SMS tracking token is exchanged for a short-lived,
-- one-time handoff token.
--
-- The customer's phone/name are NEVER placed in the URL.
-- When the website consumes the handoff it connects that
-- browser to the customer's existing EmmyTech identity,
-- Spin player and Cash-Off account.
-- ============================================================

create table if not exists public.sms_product_handoffs (
  id uuid primary key default gen_random_uuid(),

  token_hash text not null unique,

  recipient_id uuid not null
    references public.sms_campaign_recipients(id)
    on delete cascade,

  campaign_id uuid not null
    references public.sms_campaigns(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  expires_at timestamptz not null
    default (now() + interval '20 minutes'),

  consumed_at timestamptz,

  visitor_id text,

  identity_id uuid
    references public.identities(id)
    on delete set null,

  spin_player_id uuid
    references public.spin_players(id)
    on delete set null
);


create index if not exists
  sms_product_handoffs_recipient_idx
on public.sms_product_handoffs(recipient_id);


create index if not exists
  sms_product_handoffs_expires_idx
on public.sms_product_handoffs(expires_at);


alter table public.sms_product_handoffs
enable row level security;


revoke all
on public.sms_product_handoffs
from anon, authenticated;



-- ============================================================
-- ATTRIBUTION
-- Lets tomorrow's Admin answer:
-- "This visitor came back from this SMS campaign."
-- ============================================================

create table if not exists public.website_visitor_attributions (
  id uuid primary key default gen_random_uuid(),

  visitor_id text not null,

  identity_id uuid
    references public.identities(id)
    on delete set null,

  source_type text not null,

  sms_campaign_id uuid
    references public.sms_campaigns(id)
    on delete set null,

  sms_recipient_id uuid
    references public.sms_campaign_recipients(id)
    on delete set null,

  first_seen_at timestamptz not null default now(),

  last_seen_at timestamptz not null default now(),

  unique (
    visitor_id,
    source_type,
    sms_campaign_id,
    sms_recipient_id
  )
);


create index if not exists
  website_visitor_attributions_visitor_idx
on public.website_visitor_attributions(visitor_id);


create index if not exists
  website_visitor_attributions_identity_idx
on public.website_visitor_attributions(identity_id);


alter table public.website_visitor_attributions
enable row level security;


revoke all
on public.website_visitor_attributions
from anon, authenticated;



-- ============================================================
-- STEP A
-- Customer clicks go.emmytechnology.com/TOKEN
--
-- Records the click and returns a NEW one-time handoff token.
-- ============================================================

create or replace function public.create_sms_product_handoff(
  p_tracking_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_recipient public.sms_campaign_recipients%rowtype;
  v_lead public.sms_leads%rowtype;
  v_campaign public.sms_campaigns%rowtype;

  v_handoff_token text;
begin

  if nullif(trim(p_tracking_token), '') is null
     or length(trim(p_tracking_token)) > 120 then
    raise exception 'Invalid SMS link'
      using errcode = '22023';
  end if;


  select *
  into v_recipient
  from public.sms_campaign_recipients
  where tracking_token = trim(p_tracking_token)
  for update;


  if not found then
    raise exception 'This SMS link is not valid.'
      using errcode = '22023';
  end if;


  select *
  into strict v_lead
  from public.sms_leads
  where id = v_recipient.lead_id;


  select *
  into strict v_campaign
  from public.sms_campaigns
  where id = v_recipient.campaign_id;


  -- A click proves the SMS reached this customer.
  update public.sms_campaign_recipients
  set
    clicked_at = coalesce(clicked_at, now()),
    sent_at = coalesce(sent_at, now()),
    click_count = click_count + 1,
    sms_status = 'clicked'
  where id = v_recipient.id;


  update public.sms_leads
  set
    whatsapp_outreach_status = 'messaged',
    outreach_status_source =
      case
        when outreach_status_source = 'kudisms_sent'
          then outreach_status_source
        else 'sms_link_clicked'
      end
  where id = v_lead.id;


  v_handoff_token :=
    encode(extensions.gen_random_bytes(32), 'hex');


  insert into public.sms_product_handoffs (
    token_hash,
    recipient_id,
    campaign_id
  )
  values (
    encode(
      extensions.digest(
        v_handoff_token,
        'sha256'
      ),
      'hex'
    ),
    v_recipient.id,
    v_campaign.id
  );


  return jsonb_build_object(
    'handoff_token',
    v_handoff_token,
    'campaign_id',
    v_campaign.id,
    'campaign_name',
    v_campaign.name
  );
end;
$$;



-- ============================================================
-- STEP B
-- Product website consumes the one-time handoff.
--
-- The supplied visitor ID belongs to the PRODUCT WEBSITE
-- browser, not the SMS domain.
--
-- bootstrap_canonical_wheel_visitor() matches the existing
-- person by phone and restores the canonical wheel session.
-- ============================================================

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


  -- Existing EmmyTech identity / Spin account is matched
  -- by the phone number already attached to this SMS lead.
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
      v_recipient.id
    );

end;
$$;



revoke all
on function public.create_sms_product_handoff(text)
from public;


revoke all
on function public.consume_sms_product_handoff(text, text)
from public;


grant execute
on function public.create_sms_product_handoff(text)
to anon, authenticated;


grant execute
on function public.consume_sms_product_handoff(text, text)
to anon, authenticated;

