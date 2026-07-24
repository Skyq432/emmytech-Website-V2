-- Unify the product site and major wheel around one identity and Cash-Off ledger.

-- Import legacy wheel wallets into Cash-Off using the existing idempotent ledger sync.
do $$
declare v_player record;
begin
  for v_player in
    select id from public.spin_players
    where identity_id is not null and coalesce(wallet_balance, 0) > 0
  loop
    perform public.sync_spin_player_wallet_to_cash_off(v_player.id, 'legacy_spin_wallet');
  end loop;
end;
$$;

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
  v_signals jsonb;
  v_session_token text;
  v_phone_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if nullif(trim(p_visitor_id), '') is null or length(trim(p_visitor_id)) > 200 then
    raise exception 'A valid visitor_id is required' using errcode = '22023';
  end if;
  if p_full_name is not null and length(trim(p_full_name)) > 200 then raise exception 'Name is too long'; end if;
  if p_phone is not null and length(trim(p_phone)) > 40 then raise exception 'Phone is too long'; end if;
  if p_email is not null and length(trim(p_email)) > 320 then raise exception 'Email is too long'; end if;

  perform public.register_visitor_session(trim(p_visitor_id), p_referral_code, null, null);

  -- A supplied email or phone is stronger than a device/browser visitor id.
  if nullif(lower(trim(p_email)), '') is not null then
    select id into v_identity_id from public.identities
    where lower(trim(primary_email)) = lower(trim(p_email))
    order by updated_at desc nulls last limit 1;
  end if;
  if v_identity_id is null and length(v_phone_digits) >= 7 then
    select id into v_identity_id from public.identities
    where right(regexp_replace(coalesce(primary_phone, ''), '\D', '', 'g'), 10) = right(v_phone_digits, 10)
    order by updated_at desc nulls last limit 1;
  end if;
  if v_identity_id is null and nullif(lower(trim(p_email)), '') is not null then
    select identity_id into v_identity_id from public.identity_signals
    where signal_type = 'email' and lower(trim(signal_value)) = lower(trim(p_email))
    order by verified desc, confidence_weight desc, last_seen_at desc limit 1;
  end if;
  if v_identity_id is null and length(v_phone_digits) >= 7 then
    select identity_id into v_identity_id from public.identity_signals
    where signal_type = 'phone'
      and right(regexp_replace(signal_value, '\D', '', 'g'), 10) = right(v_phone_digits, 10)
    order by verified desc, confidence_weight desc, last_seen_at desc limit 1;
  end if;
  if v_identity_id is null then
    select identity_id into v_identity_id from public.identity_signals
    where signal_type = 'visitor_id' and lower(trim(signal_value)) = lower(trim(p_visitor_id))
    order by last_seen_at desc limit 1;
  end if;

  v_signals := jsonb_build_array(jsonb_build_object('type', 'visitor_id', 'value', trim(p_visitor_id)));
  if nullif(trim(p_phone), '') is not null then
    v_signals := v_signals || jsonb_build_array(jsonb_build_object('type', 'phone', 'value', trim(p_phone)));
  end if;
  if nullif(trim(p_email), '') is not null then
    v_signals := v_signals || jsonb_build_array(jsonb_build_object('type', 'email', 'value', lower(trim(p_email))));
  end if;

  if v_identity_id is null then
    v_identity_id := public.upsert_identity_from_signals(
      v_signals, nullif(trim(p_full_name), ''), nullif(trim(p_phone), ''),
      nullif(lower(trim(p_email)), ''), 'website_and_major_wheel'
    );
  else
    update public.identities set
      primary_name = coalesce(primary_name, nullif(trim(p_full_name), '')),
      primary_phone = coalesce(primary_phone, nullif(trim(p_phone), '')),
      primary_email = coalesce(primary_email, nullif(lower(trim(p_email)), '')),
      updated_at = now()
    where id = v_identity_id;
  end if;

  -- A browser belongs to only the contact identity it just confirmed.
  delete from public.identity_signals
  where signal_type = 'visitor_id'
    and lower(trim(signal_value)) = lower(trim(p_visitor_id))
    and identity_id <> v_identity_id;

  insert into public.identity_signals(identity_id, signal_type, signal_value, confidence_weight, verified, source)
  values (v_identity_id, 'visitor_id', lower(trim(p_visitor_id)), 80, true, 'website_and_major_wheel')
  on conflict (identity_id, signal_type, signal_value)
  do update set last_seen_at = now(), seen_count = public.identity_signals.seen_count + 1;

  if nullif(trim(p_phone), '') is not null then
    insert into public.identity_signals(identity_id, signal_type, signal_value, confidence_weight, verified, source)
    values (v_identity_id, 'phone', lower(trim(p_phone)), 100, true, 'website_and_major_wheel')
    on conflict (identity_id, signal_type, signal_value)
    do update set last_seen_at = now(), seen_count = public.identity_signals.seen_count + 1;
  end if;
  if nullif(trim(p_email), '') is not null then
    insert into public.identity_signals(identity_id, signal_type, signal_value, confidence_weight, verified, source)
    values (v_identity_id, 'email', lower(trim(p_email)), 100, true, 'website_and_major_wheel')
    on conflict (identity_id, signal_type, signal_value)
    do update set last_seen_at = now(), seen_count = public.identity_signals.seen_count + 1;
  end if;

  select * into v_player from public.spin_players where identity_id = v_identity_id limit 1;
  if not found then
    insert into public.spin_players(identity_id, full_name, phone_number, email, referral_code, referred_by_referral_code)
    values (v_identity_id, nullif(trim(p_full_name), ''), nullif(trim(p_phone), ''), nullif(lower(trim(p_email)), ''),
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), nullif(trim(p_referral_code), ''))
    returning * into v_player;
  else
    update public.spin_players set
      full_name = coalesce(full_name, nullif(trim(p_full_name), '')),
      phone_number = coalesce(phone_number, nullif(trim(p_phone), '')),
      email = coalesce(email, nullif(lower(trim(p_email)), '')),
      updated_at = now()
    where id = v_player.id returning * into v_player;
  end if;

  perform public.sync_spin_player_wallet_to_cash_off(v_player.id, 'legacy_spin_wallet');
  v_session_token := public.issue_canonical_wheel_session(trim(p_visitor_id), v_identity_id, v_player.id);
  return jsonb_build_object('wheel_session_token', v_session_token, 'state', public.get_canonical_wheel_state(v_session_token));
end;
$$;

revoke all on function public.bootstrap_canonical_wheel_visitor(text, text, text, text, text) from public;
grant execute on function public.bootstrap_canonical_wheel_visitor(text, text, text, text, text) to anon, authenticated, service_role;

-- The product overlay now uses the same immediate Cash-Off engine as the major wheel.
create or replace function public.complete_canonical_wheel_spin(p_session_token text, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_session record; v_player public.spin_players%rowtype; v_group record;
  v_item_id uuid; v_next_spin integer; v_result jsonb;
begin
  if p_request_id is null then raise exception 'request_id is required' using errcode = '22023'; end if;
  select * into strict v_session from public.canonical_wheel_session_player(p_session_token);
  if exists (select 1 from public.spin_logs where request_id = p_request_id and spin_player_id = v_session.spin_player_id) then
    return public.complete_cash_off_spin(v_session.spin_player_id, null, null, p_request_id)
      || jsonb_build_object('state', public.get_canonical_wheel_state(p_session_token));
  end if;
  select * into strict v_player from public.spin_players where id = v_session.spin_player_id for update;
  v_next_spin := coalesce(v_player.spin_sequence_step, 0) + 1;
  for v_group in select * from public.spin_rule_groups g
    where g.is_active and v_next_spin >= g.start_spin and (g.end_spin is null or v_next_spin <= g.end_spin)
    order by g.priority, g.start_spin
  loop
    select i.id into v_item_id from public.spin_rule_items i
    where i.group_id = v_group.id and i.is_active
      and (i.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
      and (select count(*) from public.spin_user_rule_usage u where u.spin_player_id = v_player.id and u.spin_rule_item_id = i.id) < coalesce(i.max_uses_per_user, 999)
    order by
      case when v_group.group_type in ('fixed','checkpoint','sequence') then i.item_order end,
      case when v_group.group_type not in ('fixed','checkpoint','sequence') then random() end
    limit 1;
    exit when v_item_id is not null;
  end loop;
  if v_item_id is null then raise exception 'No eligible spin result is configured' using errcode = 'P0001'; end if;
  v_result := public.complete_cash_off_spin(v_player.id, v_item_id, v_next_spin, p_request_id);
  return v_result || jsonb_build_object('state', public.get_canonical_wheel_state(p_session_token));
end;
$$;

revoke all on function public.complete_canonical_wheel_spin(text, uuid) from public;
grant execute on function public.complete_canonical_wheel_spin(text, uuid) to anon, authenticated, service_role;
