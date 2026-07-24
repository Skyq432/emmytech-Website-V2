create table public.canonical_wheel_sessions (
  token_hash text primary key,
  visitor_id text not null,
  identity_id uuid not null references public.identities(id) on delete cascade,
  spin_player_id uuid not null references public.spin_players(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  last_seen_at timestamptz not null default now(),
  constraint canonical_wheel_sessions_visitor_check check (nullif(trim(visitor_id), '') is not null),
  constraint canonical_wheel_sessions_expiry_check check (expires_at > created_at)
);

alter table public.canonical_wheel_sessions enable row level security;
revoke all on table public.canonical_wheel_sessions from public, anon, authenticated;
grant all on table public.canonical_wheel_sessions to service_role;

create or replace function public.issue_canonical_wheel_session(
  p_visitor_id text,
  p_identity_id uuid,
  p_spin_player_id uuid
) returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_token text;
begin
  if nullif(trim(p_visitor_id), '') is null or p_identity_id is null or p_spin_player_id is null then
    raise exception 'A visitor, identity and spin player are required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.spin_players
    where id = p_spin_player_id and identity_id = p_identity_id
  ) then
    raise exception 'Spin player does not belong to identity' using errcode = '22023';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.canonical_wheel_sessions(token_hash, visitor_id, identity_id, spin_player_id)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), trim(p_visitor_id), p_identity_id, p_spin_player_id);
  return v_token;
end;
$$;

revoke all on function public.issue_canonical_wheel_session(text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.issue_canonical_wheel_session(text, uuid, uuid) to service_role;

create or replace function public.canonical_wheel_session_player(p_session_token text)
returns table(visitor_id text, identity_id uuid, spin_player_id uuid)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if nullif(trim(p_session_token), '') is null
     or length(trim(p_session_token)) <> 64
     or trim(p_session_token) !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Invalid wheel session' using errcode = '22023';
  end if;

  return query
  update public.canonical_wheel_sessions s
  set last_seen_at = now()
  where s.token_hash = encode(extensions.digest(trim(p_session_token), 'sha256'), 'hex')
    and s.expires_at > now()
  returning s.visitor_id, s.identity_id, s.spin_player_id;

  if not found then
    raise exception 'Wheel session is invalid or expired' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.canonical_wheel_session_player(text) from public, anon, authenticated;
grant execute on function public.canonical_wheel_session_player(text) to service_role;

alter function public.consume_website_wheel_handoff(text)
  rename to consume_website_wheel_handoff_once;
revoke all on function public.consume_website_wheel_handoff_once(text) from public, anon, authenticated;
grant execute on function public.consume_website_wheel_handoff_once(text) to service_role;

create or replace function public.consume_website_wheel_handoff(p_handoff_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_result jsonb;
  v_visitor_id text;
  v_session_token text;
begin
  select visitor_id into v_visitor_id
  from public.website_wheel_handoffs
  where token_hash = encode(extensions.digest(trim(p_handoff_token), 'sha256'), 'hex');

  v_result := public.consume_website_wheel_handoff_once(p_handoff_token);
  v_session_token := public.issue_canonical_wheel_session(
    v_visitor_id,
    (v_result->>'identity_id')::uuid,
    (v_result#>>'{spin_player,id}')::uuid
  );

  return v_result || jsonb_build_object('wheel_session_token', v_session_token);
end;
$$;

revoke all on function public.consume_website_wheel_handoff(text) from public;
grant execute on function public.consume_website_wheel_handoff(text) to anon, authenticated, service_role;

create or replace function public.get_canonical_wheel_state(p_session_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_session record;
  v_player public.spin_players%rowtype;
  v_cash_balance numeric(14,2);
begin
  select * into strict v_session from public.canonical_wheel_session_player(p_session_token);
  select * into strict v_player from public.spin_players where id = v_session.spin_player_id;
  select coalesce(balance, 0) into v_cash_balance
  from public.cash_off_accounts where identity_id = v_session.identity_id;

  return jsonb_build_object(
    'identity_id', v_session.identity_id,
    'spin_player', jsonb_build_object(
      'id', v_player.id,
      'identity_id', v_player.identity_id,
      'full_name', v_player.full_name,
      'referral_code', v_player.referral_code,
      'spins_remaining', v_player.spins_remaining,
      'wallet_balance', v_player.wallet_balance,
      'total_referrals_count', v_player.total_referrals_count,
      'total_cash_won', v_player.total_cash_won,
      'cashout_target', v_player.cashout_target,
      'spin_sequence_step', v_player.spin_sequence_step,
      'dm_bonus_claimed', v_player.dm_bonus_claimed,
      'letters_unlocked', v_player.letters_unlocked,
      'letter_challenge_completed', v_player.letter_challenge_completed,
      'chosen_letter_reward', v_player.chosen_letter_reward,
      'last_prize_won', v_player.last_prize_won,
      'last_prize_type', v_player.last_prize_type,
      'cashout_eligible', v_player.cashout_eligible,
      'total_cash_off_won', v_player.total_cash_off_won
    ),
    'cash_off_balance', coalesce(v_cash_balance, 0),
    'active_prizes', coalesce((
      select jsonb_agg(to_jsonb(p) order by p.created_at)
      from public.spin_prizes p where p.is_active and p.on_wheel
    ), '[]'::jsonb),
    'rule_groups', coalesce((
      select jsonb_agg(to_jsonb(g) || jsonb_build_object('items', coalesce((
        select jsonb_agg(to_jsonb(i) order by i.item_order)
        from public.spin_rule_items i where i.group_id = g.id and i.is_active
      ), '[]'::jsonb)) order by g.priority)
      from public.spin_rule_groups g where g.is_active
    ), '[]'::jsonb),
    'awarded_prizes', coalesce((
      select jsonb_agg(to_jsonb(up) order by up.created_at desc)
      from public.spin_user_prizes up where up.spin_player_id = v_player.id
    ), '[]'::jsonb),
    'referral_count', (
      select count(*) from public.spin_referrals r
      where r.referrer_spin_player_id = v_player.id and r.status = 'converted'
    )
  );
end;
$$;

revoke all on function public.get_canonical_wheel_state(text) from public;
grant execute on function public.get_canonical_wheel_state(text) to anon, authenticated, service_role;

create or replace function public.bootstrap_canonical_wheel_visitor(
  p_visitor_id text,
  p_full_name text default null,
  p_phone text default null,
  p_email text default null,
  p_referral_code text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_identity_id uuid;
  v_player public.spin_players%rowtype;
  v_signals jsonb := '[]'::jsonb;
  v_session_token text;
begin
  if nullif(trim(p_visitor_id), '') is null or length(trim(p_visitor_id)) > 200 then
    raise exception 'A valid visitor_id is required' using errcode = '22023';
  end if;
  if p_full_name is not null and length(trim(p_full_name)) > 200 then raise exception 'Name is too long'; end if;
  if p_phone is not null and length(trim(p_phone)) > 40 then raise exception 'Phone is too long'; end if;
  if p_email is not null and length(trim(p_email)) > 320 then raise exception 'Email is too long'; end if;

  perform public.register_visitor_session(trim(p_visitor_id), p_referral_code, null, null);

  select s.identity_id into v_identity_id
  from public.identity_signals s
  where (s.signal_type = 'visitor_id' and lower(trim(s.signal_value)) = lower(trim(p_visitor_id)))
     or (nullif(trim(p_phone), '') is not null and s.signal_type = 'phone' and lower(trim(s.signal_value)) = lower(trim(p_phone)))
     or (nullif(trim(p_email), '') is not null and s.signal_type = 'email' and lower(trim(s.signal_value)) = lower(trim(p_email)))
  order by s.verified desc, s.confidence_weight desc, s.first_seen_at
  limit 1;

  if v_identity_id is null then
    v_signals := jsonb_build_array(jsonb_build_object('type', 'visitor_id', 'value', trim(p_visitor_id)));
    if nullif(trim(p_phone), '') is not null then v_signals := v_signals || jsonb_build_array(jsonb_build_object('type', 'phone', 'value', trim(p_phone))); end if;
    if nullif(trim(p_email), '') is not null then v_signals := v_signals || jsonb_build_array(jsonb_build_object('type', 'email', 'value', lower(trim(p_email)))); end if;
    v_identity_id := public.upsert_identity_from_signals(v_signals, nullif(trim(p_full_name), ''), nullif(trim(p_phone), ''), nullif(lower(trim(p_email)), ''), 'canonical_wheel_direct');
  end if;

  insert into public.identity_signals(identity_id, signal_type, signal_value, confidence_weight, verified, source)
  values (v_identity_id, 'visitor_id', lower(trim(p_visitor_id)), 80, true, 'canonical_wheel_direct')
  on conflict (identity_id, signal_type, signal_value) do update set last_seen_at = now(), seen_count = public.identity_signals.seen_count + 1;

  select * into v_player from public.spin_players where identity_id = v_identity_id limit 1;
  if not found then
    insert into public.spin_players(identity_id, full_name, phone_number, email, referral_code, referred_by_referral_code)
    values (v_identity_id, nullif(trim(p_full_name), ''), nullif(trim(p_phone), ''), nullif(lower(trim(p_email)), ''), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), nullif(trim(p_referral_code), ''))
    on conflict (identity_id) where identity_id is not null do nothing
    returning * into v_player;
    if not found then select * into strict v_player from public.spin_players where identity_id = v_identity_id; end if;
  else
    update public.spin_players set
      full_name = coalesce(full_name, nullif(trim(p_full_name), '')),
      phone_number = coalesce(phone_number, nullif(trim(p_phone), '')),
      email = coalesce(email, nullif(lower(trim(p_email)), '')),
      referred_by_referral_code = coalesce(referred_by_referral_code, nullif(trim(p_referral_code), '')),
      updated_at = now()
    where id = v_player.id returning * into v_player;
  end if;

  v_session_token := public.issue_canonical_wheel_session(trim(p_visitor_id), v_identity_id, v_player.id);
  return jsonb_build_object('wheel_session_token', v_session_token, 'state', public.get_canonical_wheel_state(v_session_token));
end;
$$;

revoke all on function public.bootstrap_canonical_wheel_visitor(text, text, text, text, text) from public;
grant execute on function public.bootstrap_canonical_wheel_visitor(text, text, text, text, text) to anon, authenticated, service_role;

create or replace function public.complete_canonical_wheel_spin(p_session_token text, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_session record;
  v_player public.spin_players%rowtype;
  v_group record;
  v_item_id uuid;
  v_next_spin integer;
  v_result jsonb;
begin
  if p_request_id is null then raise exception 'request_id is required' using errcode = '22023'; end if;
  select * into strict v_session from public.canonical_wheel_session_player(p_session_token);

  if exists (select 1 from public.spin_logs where request_id = p_request_id and spin_player_id = v_session.spin_player_id) then
    return public.complete_cash_off_spin(v_session.spin_player_id, null, null, p_request_id);
  end if;

  select * into strict v_player from public.spin_players where id = v_session.spin_player_id for update;
  v_next_spin := coalesce(v_player.spin_sequence_step, 0) + 1;

  for v_group in
    select * from public.spin_rule_groups g
    where g.is_active and v_next_spin >= g.start_spin and (g.end_spin is null or v_next_spin <= g.end_spin)
    order by g.priority, g.start_spin
  loop
    if v_group.group_type in ('fixed', 'checkpoint') then
      select i.id into v_item_id from public.spin_rule_items i
      where i.group_id = v_group.id and i.is_active
        and (i.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (select count(*) from public.spin_user_rule_usage u where u.spin_player_id = v_player.id and u.spin_rule_item_id = i.id) < coalesce(i.max_uses_per_user, 999)
      order by i.item_order limit 1;
    elsif v_group.group_type in ('sequence', 'shuffle_bag') then
      select i.id into v_item_id from public.spin_rule_items i
      where i.group_id = v_group.id and i.is_active
        and (i.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (select count(*) from public.spin_user_rule_usage u where u.spin_player_id = v_player.id and u.spin_rule_item_id = i.id) < coalesce(i.max_uses_per_user, 999)
      order by case when v_group.group_type = 'sequence' then i.item_order end,
               case when v_group.group_type = 'shuffle_bag' then random() end
      limit 1;
    else
      select weighted.id into v_item_id
      from public.spin_rule_items weighted
      cross join lateral generate_series(1, greatest(coalesce(weighted.gravity, 1), 1)) weight
      where weighted.group_id = v_group.id and weighted.is_active
        and (weighted.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (select count(*) from public.spin_user_rule_usage u where u.spin_player_id = v_player.id and u.spin_rule_item_id = weighted.id) < coalesce(weighted.max_uses_per_user, 999)
      order by random() limit 1;
    end if;
    exit when v_item_id is not null;
  end loop;

  if v_item_id is null then raise exception 'No eligible spin result is configured' using errcode = 'P0001'; end if;
  v_result := public.complete_cash_off_spin(v_player.id, v_item_id, v_next_spin, p_request_id);
  return v_result || jsonb_build_object('state', public.get_canonical_wheel_state(p_session_token));
end;
$$;

revoke all on function public.complete_canonical_wheel_spin(text, uuid) from public;
grant execute on function public.complete_canonical_wheel_spin(text, uuid) to anon, authenticated, service_role;
