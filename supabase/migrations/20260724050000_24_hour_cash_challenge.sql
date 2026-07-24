-- EmmyTech 24-hour cash challenge.
-- Cash wins accumulate in a timed cash wallet. They are not credited to
-- Cash-Off until the challenge expires and the conversion rules are applied.

create table if not exists public.spin_cash_challenges (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.identities(id) on delete cascade,
  spin_player_id uuid not null references public.spin_players(id) on delete cascade,
  cycle_number integer not null default 1,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  cash_balance numeric(14,2) not null default 0,
  cash_cap numeric(14,2) not null default 3000,
  cash_target numeric(14,2) not null default 1000,
  conversion_floor numeric(14,2) not null default 700,
  converted_cash_off_amount numeric(14,2) not null default 0,
  processed_at timestamptz,
  last_credit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spin_cash_challenges_cycle_unique unique (spin_player_id, cycle_number),
  constraint spin_cash_challenges_status_check check (
    status in ('active', 'converted_to_cash_off', 'cash_eligible', 'closed')
  ),
  constraint spin_cash_challenges_balance_check check (
    cash_balance >= 0 and cash_balance <= cash_cap
  ),
  constraint spin_cash_challenges_cap_check check (cash_cap = 3000),
  constraint spin_cash_challenges_target_check check (cash_target = 1000),
  constraint spin_cash_challenges_floor_check check (conversion_floor = 700),
  constraint spin_cash_challenges_expiry_check check (expires_at > started_at),
  constraint spin_cash_challenges_conversion_check check (converted_cash_off_amount >= 0)
);

create unique index if not exists spin_cash_challenges_one_active_idx
  on public.spin_cash_challenges(spin_player_id)
  where status = 'active';

create index if not exists spin_cash_challenges_identity_idx
  on public.spin_cash_challenges(identity_id, created_at desc);

create index if not exists spin_cash_challenges_expiry_idx
  on public.spin_cash_challenges(status, expires_at)
  where status = 'active';

create table if not exists public.spin_cash_challenge_credits (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.spin_cash_challenges(id) on delete cascade,
  identity_id uuid not null references public.identities(id) on delete cascade,
  spin_player_id uuid not null references public.spin_players(id) on delete cascade,
  spin_log_id uuid references public.spin_logs(id) on delete set null,
  request_id uuid not null unique,
  amount_won numeric(14,2) not null,
  amount_credited numeric(14,2) not null,
  balance_before numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  created_at timestamptz not null default now(),
  constraint spin_cash_challenge_credits_won_check check (amount_won > 0),
  constraint spin_cash_challenge_credits_credited_check check (amount_credited >= 0),
  constraint spin_cash_challenge_credits_balances_check check (
    balance_before >= 0 and balance_after >= balance_before and balance_after <= 3000
  )
);

create index if not exists spin_cash_challenge_credits_player_idx
  on public.spin_cash_challenge_credits(spin_player_id, created_at desc);

alter table public.spin_cash_challenges enable row level security;
alter table public.spin_cash_challenge_credits enable row level security;
revoke all on table public.spin_cash_challenges from public, anon, authenticated;
revoke all on table public.spin_cash_challenge_credits from public, anon, authenticated;
grant all on table public.spin_cash_challenges to service_role;
grant all on table public.spin_cash_challenge_credits to service_role;

alter table public.spin_logs
  add column if not exists cash_challenge_id uuid references public.spin_cash_challenges(id) on delete set null,
  add column if not exists cash_challenge_credit numeric(14,2),
  add column if not exists cash_challenge_balance_after numeric(14,2),
  add column if not exists cash_challenge_expires_at timestamptz;

create or replace function public.spin_cash_challenge_payload(p_spin_player_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_challenge public.spin_cash_challenges%rowtype;
  v_seconds bigint := 0;
begin
  select * into v_challenge
  from public.spin_cash_challenges c
  where c.spin_player_id = p_spin_player_id
  order by
    case c.status when 'active' then 0 when 'cash_eligible' then 1 else 2 end,
    c.created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'status', 'not_started',
      'cash_balance', 0,
      'cash_target', 1000,
      'cash_cap', 3000,
      'conversion_floor', 700,
      'seconds_remaining', 0,
      'active', false,
      'expired', false,
      'cash_eligible', false,
      'converted_to_cash_off', false,
      'converted_cash_off_amount', 0
    );
  end if;

  if v_challenge.status = 'active' then
    v_seconds := greatest(
      0,
      floor(extract(epoch from (v_challenge.expires_at - now())))::bigint
    );
  end if;

  return jsonb_build_object(
    'id', v_challenge.id,
    'cycle_number', v_challenge.cycle_number,
    'status', v_challenge.status,
    'started_at', v_challenge.started_at,
    'expires_at', v_challenge.expires_at,
    'processed_at', v_challenge.processed_at,
    'cash_balance', v_challenge.cash_balance,
    'cash_target', v_challenge.cash_target,
    'cash_cap', v_challenge.cash_cap,
    'conversion_floor', v_challenge.conversion_floor,
    'seconds_remaining', v_seconds,
    'active', v_challenge.status = 'active',
    'expired', v_challenge.status <> 'active' or v_challenge.expires_at <= now(),
    'cash_eligible', v_challenge.status = 'cash_eligible',
    'converted_to_cash_off', v_challenge.status = 'converted_to_cash_off',
    'converted_cash_off_amount', v_challenge.converted_cash_off_amount,
    'progress_percent', least(
      100,
      round((v_challenge.cash_balance / nullif(v_challenge.cash_target, 0)) * 100)
    ),
    'amount_to_cash_target', greatest(0, v_challenge.cash_target - v_challenge.cash_balance),
    'amount_to_cap', greatest(0, v_challenge.cash_cap - v_challenge.cash_balance)
  );
end;
$$;

revoke all on function public.spin_cash_challenge_payload(uuid) from public, anon, authenticated;
grant execute on function public.spin_cash_challenge_payload(uuid) to service_role;

create or replace function public.process_spin_cash_challenge(p_spin_player_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_player public.spin_players%rowtype;
  v_challenge public.spin_cash_challenges%rowtype;
  v_conversion numeric(14,2) := 0;
  v_cash_result jsonb;
begin
  select * into v_player
  from public.spin_players
  where id = p_spin_player_id
  for update;

  if not found then
    raise exception 'Spin player not found' using errcode = 'P0002';
  end if;

  select * into v_challenge
  from public.spin_cash_challenges c
  where c.spin_player_id = p_spin_player_id
    and c.status = 'active'
  order by c.created_at desc
  limit 1
  for update;

  if not found or v_challenge.expires_at > now() then
    return public.spin_cash_challenge_payload(p_spin_player_id);
  end if;

  if v_challenge.cash_balance >= v_challenge.cash_target then
    update public.spin_cash_challenges
    set status = 'cash_eligible',
        processed_at = now(),
        updated_at = now()
    where id = v_challenge.id;

    update public.spin_players
    set wallet_balance = v_challenge.cash_balance,
        cashout_eligible = true,
        updated_at = now()
    where id = p_spin_player_id;

    insert into public.identity_events (
      identity_id, event_type, title, description, metadata, created_at
    ) values (
      v_player.identity_id,
      'cash_challenge_cash_eligible',
      '24-hour cash challenge completed',
      format('Cash withdrawal eligibility unlocked at %s.', v_challenge.cash_balance),
      jsonb_build_object(
        'challenge_id', v_challenge.id,
        'cash_balance', v_challenge.cash_balance,
        'cash_target', v_challenge.cash_target,
        'cash_cap', v_challenge.cash_cap
      ),
      now()
    );
  else
    v_conversion := case
      when v_challenge.cash_balance <= 0 then 0
      when v_challenge.cash_balance < v_challenge.conversion_floor
        then v_challenge.cash_balance
      when v_challenge.cash_balance < v_challenge.cash_target
        then v_challenge.cash_target
      else 0
    end;

    if v_conversion > 0 then
      v_cash_result := public.credit_cash_off(
        p_identity_id => v_player.identity_id,
        p_amount => v_conversion,
        p_transaction_type => 'promotion',
        p_source_system => 'spin_cash_challenge',
        p_source_reference => v_challenge.id::text,
        p_reason => format(
          '24-hour cash challenge converted %s cash into %s Cash-Off.',
          trim(to_char(v_challenge.cash_balance, 'FM999999999990.00')),
          trim(to_char(v_conversion, 'FM999999999990.00'))
        ),
        p_metadata => jsonb_build_object(
          'challenge_id', v_challenge.id,
          'cash_balance', v_challenge.cash_balance,
          'conversion_floor', v_challenge.conversion_floor,
          'cash_target', v_challenge.cash_target
        ),
        p_idempotency_key => 'cash-challenge-expiry:' || v_challenge.id::text
      );
    end if;

    update public.spin_cash_challenges
    set status = 'converted_to_cash_off',
        converted_cash_off_amount = v_conversion,
        processed_at = now(),
        updated_at = now()
    where id = v_challenge.id;

    update public.spin_players
    set wallet_balance = 0,
        cashout_eligible = false,
        total_cash_off_won = coalesce(total_cash_off_won, 0) + v_conversion,
        updated_at = now()
    where id = p_spin_player_id;

    insert into public.identity_events (
      identity_id, event_type, title, description, metadata, created_at
    ) values (
      v_player.identity_id,
      'cash_challenge_converted_to_cash_off',
      '24-hour cash challenge converted',
      format('%s cash converted to %s Cash-Off.', v_challenge.cash_balance, v_conversion),
      jsonb_build_object(
        'challenge_id', v_challenge.id,
        'cash_balance', v_challenge.cash_balance,
        'cash_off_amount', v_conversion,
        'cash_off_transaction_id', v_cash_result->>'transaction_id'
      ),
      now()
    );
  end if;

  return public.spin_cash_challenge_payload(p_spin_player_id);
end;
$$;

revoke all on function public.process_spin_cash_challenge(uuid) from public, anon, authenticated;
grant execute on function public.process_spin_cash_challenge(uuid) to service_role;

create or replace function public.add_spin_cash_challenge_win(
  p_spin_player_id uuid,
  p_amount numeric,
  p_spin_log_id uuid,
  p_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_player public.spin_players%rowtype;
  v_challenge public.spin_cash_challenges%rowtype;
  v_existing public.spin_cash_challenge_credits%rowtype;
  v_cycle integer;
  v_before numeric(14,2);
  v_after numeric(14,2);
  v_credited numeric(14,2);
  v_payload jsonb;
begin
  if p_request_id is null or p_amount is null or p_amount <= 0 then
    raise exception 'A positive cash amount and request_id are required' using errcode = '22023';
  end if;

  select * into v_existing
  from public.spin_cash_challenge_credits
  where request_id = p_request_id;

  if found then
    if v_existing.spin_player_id <> p_spin_player_id then
      raise exception 'request_id belongs to another player' using errcode = '22023';
    end if;
    return public.spin_cash_challenge_payload(p_spin_player_id) || jsonb_build_object(
      'amount_won', v_existing.amount_won,
      'amount_credited', v_existing.amount_credited,
      'balance_before', v_existing.balance_before,
      'balance_after', v_existing.balance_after,
      'capped_amount', greatest(0, v_existing.amount_won - v_existing.amount_credited),
      'idempotent_replay', true
    );
  end if;

  perform public.process_spin_cash_challenge(p_spin_player_id);

  select * into v_player
  from public.spin_players
  where id = p_spin_player_id
  for update;

  if not found or v_player.identity_id is null then
    raise exception 'Spin player or identity not found' using errcode = 'P0002';
  end if;

  select * into v_challenge
  from public.spin_cash_challenges c
  where c.spin_player_id = p_spin_player_id
    and c.status in ('active', 'cash_eligible')
  order by case c.status when 'active' then 0 else 1 end, c.created_at desc
  limit 1
  for update;

  if not found then
    select coalesce(max(cycle_number), 0) + 1
    into v_cycle
    from public.spin_cash_challenges
    where spin_player_id = p_spin_player_id;

    insert into public.spin_cash_challenges (
      identity_id, spin_player_id, cycle_number, status,
      started_at, expires_at, cash_balance, last_credit_at
    ) values (
      v_player.identity_id, p_spin_player_id, v_cycle, 'active',
      now(), now() + interval '24 hours', 0, now()
    ) returning * into v_challenge;
  end if;

  v_before := v_challenge.cash_balance;
  v_after := least(v_challenge.cash_cap, v_before + round(p_amount::numeric, 2));
  v_credited := greatest(0, v_after - v_before);

  update public.spin_cash_challenges
  set cash_balance = v_after,
      last_credit_at = now(),
      updated_at = now()
  where id = v_challenge.id
  returning * into v_challenge;

  insert into public.spin_cash_challenge_credits (
    challenge_id, identity_id, spin_player_id, spin_log_id, request_id,
    amount_won, amount_credited, balance_before, balance_after
  ) values (
    v_challenge.id, v_player.identity_id, p_spin_player_id, p_spin_log_id,
    p_request_id, round(p_amount::numeric, 2), v_credited, v_before, v_after
  );

  update public.spin_players
  set wallet_balance = v_after,
      cashout_eligible = v_challenge.status = 'cash_eligible',
      updated_at = now()
  where id = p_spin_player_id;

  insert into public.identity_events (
    identity_id, event_type, title, description, metadata, created_at
  ) values (
    v_player.identity_id,
    'cash_challenge_win_added',
    'Cash added to 24-hour challenge',
    format('%s cash added to the challenge.', v_credited),
    jsonb_build_object(
      'challenge_id', v_challenge.id,
      'spin_log_id', p_spin_log_id,
      'amount_won', round(p_amount::numeric, 2),
      'amount_credited', v_credited,
      'balance_before', v_before,
      'balance_after', v_after,
      'cash_cap', v_challenge.cash_cap,
      'request_id', p_request_id
    ),
    now()
  );

  v_payload := public.spin_cash_challenge_payload(p_spin_player_id);
  return v_payload || jsonb_build_object(
    'amount_won', round(p_amount::numeric, 2),
    'amount_credited', v_credited,
    'balance_before', v_before,
    'balance_after', v_after,
    'capped_amount', greatest(0, round(p_amount::numeric, 2) - v_credited),
    'challenge_started', v_before = 0 and v_challenge.status = 'active',
    'idempotent_replay', false
  );
end;
$$;

revoke all on function public.add_spin_cash_challenge_win(uuid, numeric, uuid, uuid) from public, anon, authenticated;
grant execute on function public.add_spin_cash_challenge_win(uuid, numeric, uuid, uuid) to service_role;

create or replace function public.complete_cash_challenge_spin(
  p_spin_player_id uuid,
  p_rule_item_id uuid,
  p_expected_spin_number integer,
  p_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_player public.spin_players%rowtype;
  v_updated_player public.spin_players%rowtype;
  v_item record;
  v_existing_log public.spin_logs%rowtype;
  v_spin_log public.spin_logs%rowtype;
  v_challenge jsonb;
  v_cash_off_balance numeric(14,2) := 0;
  v_cash_amount numeric(14,2) := 0;
  v_cash_credited numeric(14,2) := 0;
  v_challenge_before numeric(14,2) := 0;
  v_challenge_after numeric(14,2) := 0;
  v_bonus_spins integer := 0;
  v_spin_number integer;
  v_new_spins_remaining integer;
  v_usage_count integer := 0;
  v_letters text[];
  v_next_letter text;
  v_letter_code text;
  v_result_label text;
  v_completed boolean := false;
begin
  if p_request_id is null then
    raise exception 'request_id is required' using errcode = '22023';
  end if;

  select * into v_existing_log
  from public.spin_logs
  where request_id = p_request_id;

  if found then
    if v_existing_log.spin_player_id <> p_spin_player_id then
      raise exception 'request_id belongs to another player' using errcode = '22023';
    end if;

    select * into v_updated_player from public.spin_players where id = p_spin_player_id;
    v_challenge := public.process_spin_cash_challenge(p_spin_player_id);

    return jsonb_build_object(
      'ok', true,
      'idempotent_replay', true,
      'result', jsonb_build_object(
        'label', v_existing_log.result_label,
        'result_type', v_existing_log.result_type,
        'cash_amount', coalesce(v_existing_log.cash_amount, 0),
        'cash_challenge_credit', coalesce(v_existing_log.cash_challenge_credit, 0),
        'cash_challenge_after', coalesce(v_existing_log.cash_challenge_balance_after, 0),
        'cash_challenge_expires_at', v_existing_log.cash_challenge_expires_at,
        'letter_code', v_existing_log.letter_code,
        'spin_log_id', v_existing_log.id,
        'request_id', p_request_id
      ),
      'cash_challenge', v_challenge,
      'spinPlayer', to_jsonb(v_updated_player)
    );
  end if;

  perform public.process_spin_cash_challenge(p_spin_player_id);

  select * into v_player
  from public.spin_players
  where id = p_spin_player_id
  for update;

  if not found then
    raise exception 'Spin player not found' using errcode = 'P0002';
  end if;

  if v_player.identity_id is null then
    raise exception 'Spin player has no CRM identity' using errcode = 'P0001';
  end if;

  select * into v_existing_log
  from public.spin_logs
  where request_id = p_request_id;

  if found then
    return public.complete_cash_challenge_spin(
      p_spin_player_id, null, null, p_request_id
    );
  end if;

  if coalesce(v_player.spins_remaining, 0) <= 0 then
    raise exception 'No spins left' using errcode = 'P0001';
  end if;

  v_spin_number := coalesce(v_player.spin_sequence_step, 0) + 1;

  if p_expected_spin_number is null or p_expected_spin_number <> v_spin_number then
    raise exception 'Spin sequence changed. Expected %, received %',
      v_spin_number, p_expected_spin_number using errcode = '40001';
  end if;

  select
    i.id, i.result_label, i.result_type, i.cash_amount, i.letter_code,
    i.bonus_spins, i.max_uses_per_user, i.is_active as item_active,
    g.id as group_id, g.group_type, g.start_spin, g.end_spin,
    g.priority, g.is_active as group_active
  into v_item
  from public.spin_rule_items i
  join public.spin_rule_groups g on g.id = i.group_id
  where i.id = p_rule_item_id;

  if not found or coalesce(v_item.item_active, false) = false
     or coalesce(v_item.group_active, false) = false then
    raise exception 'Spin rule item is not active' using errcode = 'P0001';
  end if;

  if v_spin_number < v_item.start_spin
     or (v_item.end_spin is not null and v_spin_number > v_item.end_spin) then
    raise exception 'Spin rule item does not apply to this spin number' using errcode = 'P0001';
  end if;

  if coalesce(v_item.max_uses_per_user, 999) < 999 then
    select count(*) into v_usage_count
    from public.spin_user_rule_usage u
    where u.spin_player_id = v_player.id
      and u.spin_rule_item_id = v_item.id;

    if v_usage_count >= v_item.max_uses_per_user then
      raise exception 'Maximum uses reached for this result' using errcode = 'P0001';
    end if;
  end if;

  v_result_label := v_item.result_label;
  v_letter_code := v_item.letter_code;
  v_cash_amount := round(greatest(coalesce(v_item.cash_amount, 0), 0)::numeric, 2);
  v_bonus_spins := greatest(coalesce(v_item.bonus_spins, 0), 0);
  v_letters := coalesce(v_player.letters_unlocked, '{}'::text[]);

  if v_item.result_type = 'letter' then
    select s.segment_code into v_next_letter
    from public.spin_letter_segments s
    where coalesce(s.is_active, true) = true
      and not (s.segment_code = any(v_letters))
    order by s.segment_order
    limit 1;

    if v_next_letter is not null then
      v_letter_code := v_next_letter;
      v_result_label := v_next_letter;
      if not (v_next_letter = any(v_letters)) then
        v_letters := array_append(v_letters, v_next_letter);
      end if;
    end if;

    select not exists (
      select 1 from public.spin_letter_segments s
      where coalesce(s.is_active, true) = true
        and not (s.segment_code = any(v_letters))
    ) into v_completed;
  else
    v_completed := coalesce(v_player.letter_challenge_completed, false);
  end if;

  v_new_spins_remaining := coalesce(v_player.spins_remaining, 0) - 1 + v_bonus_spins;

  select coalesce(balance, 0) into v_cash_off_balance
  from public.cash_off_accounts
  where identity_id = v_player.identity_id;
  v_cash_off_balance := coalesce(v_cash_off_balance, 0);

  insert into public.spin_logs (
    identity_id, spin_player_id, result_label, result_type, cash_amount,
    letter_code, wallet_before, wallet_after, reward_mode, request_id, created_at,
    cash_off_before, cash_off_after
  ) values (
    v_player.identity_id, v_player.id, v_result_label, v_item.result_type,
    v_cash_amount, v_letter_code, coalesce(v_player.wallet_balance, 0),
    coalesce(v_player.wallet_balance, 0),
    case when v_cash_amount > 0 then 'cash_challenge' else 'canonical_prize' end,
    p_request_id, now(), v_cash_off_balance, v_cash_off_balance
  ) returning * into v_spin_log;

  if v_cash_amount > 0 then
    v_challenge := public.add_spin_cash_challenge_win(
      v_player.id, v_cash_amount, v_spin_log.id, p_request_id
    );
    v_cash_credited := coalesce((v_challenge->>'amount_credited')::numeric, 0);
    v_challenge_before := coalesce((v_challenge->>'balance_before')::numeric, 0);
    v_challenge_after := coalesce((v_challenge->>'balance_after')::numeric, 0);
  else
    v_challenge := public.spin_cash_challenge_payload(v_player.id);
    v_challenge_before := coalesce(v_player.wallet_balance, 0);
    v_challenge_after := coalesce(v_player.wallet_balance, 0);
  end if;

  update public.spin_logs
  set wallet_before = v_challenge_before,
      wallet_after = v_challenge_after,
      cash_challenge_id = nullif(v_challenge->>'id', '')::uuid,
      cash_challenge_credit = v_cash_credited,
      cash_challenge_balance_after = v_challenge_after,
      cash_challenge_expires_at = nullif(v_challenge->>'expires_at', '')::timestamptz
  where id = v_spin_log.id
  returning * into v_spin_log;

  update public.spin_players
  set spins_remaining = v_new_spins_remaining,
      wallet_balance = case when v_cash_amount > 0 then v_challenge_after else wallet_balance end,
      total_cash_won = coalesce(total_cash_won, 0) + v_cash_amount,
      spin_sequence_step = v_spin_number,
      letters_unlocked = v_letters,
      letter_challenge_completed = v_completed,
      last_prize_won = v_result_label,
      last_prize_type = v_item.result_type,
      cashout_eligible = coalesce((v_challenge->>'cash_eligible')::boolean, false),
      updated_at = now()
  where id = v_player.id
  returning * into v_updated_player;

  insert into public.spin_user_rule_usage (
    identity_id, spin_player_id, spin_rule_item_id, spin_number, created_at
  ) values (
    v_player.identity_id, v_player.id, v_item.id, v_spin_number, now()
  );

  if v_item.result_type <> 'retry' then
    insert into public.spin_user_prizes (
      identity_id, spin_player_id, prize_label, status, result_type,
      cash_amount, letter_code, wallet_after, claim_message, reward_mode,
      cash_off_after, created_at
    ) values (
      v_player.identity_id, v_player.id, v_result_label, 'available',
      v_item.result_type, v_cash_amount, v_letter_code, v_challenge_after,
      case when v_cash_amount > 0 then
        format('%s was added to your 24-hour EmmyTech cash challenge.', v_result_label)
      else format('I just won %s on the EmmyTech Spin Wheel.', v_result_label) end,
      case when v_cash_amount > 0 then 'cash_challenge' else 'canonical_prize' end,
      v_cash_off_balance, now()
    );
  end if;

  insert into public.identity_events (
    identity_id, event_type, title, description, metadata, created_at
  ) values (
    v_player.identity_id,
    'cash_challenge_spin_completed',
    'Spin completed',
    format('Spin result: %s', v_result_label),
    jsonb_build_object(
      'spin_player_id', v_player.id,
      'spin_log_id', v_spin_log.id,
      'spin_number', v_spin_number,
      'rule_item_id', v_item.id,
      'result_label', v_result_label,
      'result_type', v_item.result_type,
      'cash_amount_won', v_cash_amount,
      'cash_amount_credited', v_cash_credited,
      'cash_challenge_balance', v_challenge_after,
      'cash_challenge_id', v_challenge->>'id',
      'request_id', p_request_id
    ),
    now()
  );

  if v_spin_number = 1 and v_player.referred_by_referral_code is not null then
    perform public.award_spin_referral(
      v_player.referred_by_referral_code,
      v_player.id,
      v_player.identity_id
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'idempotent_replay', false,
    'result', jsonb_build_object(
      'label', v_result_label,
      'result_type', v_item.result_type,
      'cash_amount', v_cash_amount,
      'cash_challenge_credit', v_cash_credited,
      'cash_challenge_before', v_challenge_before,
      'cash_challenge_after', v_challenge_after,
      'cash_challenge_expires_at', v_challenge->>'expires_at',
      'cash_challenge_started', coalesce((v_challenge->>'challenge_started')::boolean, false),
      'cash_challenge_capped_amount', coalesce((v_challenge->>'capped_amount')::numeric, 0),
      'letter_code', v_letter_code,
      'bonus_spins', v_bonus_spins,
      'letter_challenge_completed', v_completed,
      'spin_log_id', v_spin_log.id,
      'request_id', p_request_id
    ),
    'cash_challenge', v_challenge,
    'spinPlayer', to_jsonb(v_updated_player)
  );
end;
$$;

revoke all on function public.complete_cash_challenge_spin(uuid, uuid, integer, uuid) from public, anon, authenticated;
grant execute on function public.complete_cash_challenge_spin(uuid, uuid, integer, uuid) to service_role;

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
  v_challenge jsonb;
begin
  select * into strict v_session from public.canonical_wheel_session_player(p_session_token);
  v_challenge := public.process_spin_cash_challenge(v_session.spin_player_id);
  select * into strict v_player from public.spin_players where id = v_session.spin_player_id;
  select coalesce(balance, 0) into v_cash_balance
  from public.cash_off_accounts where identity_id = v_session.identity_id;

  return jsonb_build_object(
    'server_now', now(),
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
    'cash_challenge', v_challenge,
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

create or replace function public.complete_canonical_wheel_spin(
  p_session_token text,
  p_request_id uuid
) returns jsonb
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
  if p_request_id is null then
    raise exception 'request_id is required' using errcode = '22023';
  end if;

  select * into strict v_session
  from public.canonical_wheel_session_player(p_session_token);

  if exists (
    select 1 from public.spin_logs
    where request_id = p_request_id
      and spin_player_id = v_session.spin_player_id
  ) then
    v_result := public.complete_cash_challenge_spin(
      v_session.spin_player_id, null, null, p_request_id
    );
    return v_result || jsonb_build_object(
      'state', public.get_canonical_wheel_state(p_session_token)
    );
  end if;

  select * into strict v_player
  from public.spin_players
  where id = v_session.spin_player_id
  for update;

  v_next_spin := coalesce(v_player.spin_sequence_step, 0) + 1;

  for v_group in
    select * from public.spin_rule_groups g
    where g.is_active
      and v_next_spin >= g.start_spin
      and (g.end_spin is null or v_next_spin <= g.end_spin)
    order by g.priority, g.start_spin
  loop
    if v_group.group_type in ('fixed', 'checkpoint') then
      select i.id into v_item_id
      from public.spin_rule_items i
      where i.group_id = v_group.id and i.is_active
        and (i.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (
          select count(*) from public.spin_user_rule_usage u
          where u.spin_player_id = v_player.id and u.spin_rule_item_id = i.id
        ) < coalesce(i.max_uses_per_user, 999)
      order by i.item_order
      limit 1;
    elsif v_group.group_type in ('sequence', 'shuffle_bag') then
      select i.id into v_item_id
      from public.spin_rule_items i
      where i.group_id = v_group.id and i.is_active
        and (i.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (
          select count(*) from public.spin_user_rule_usage u
          where u.spin_player_id = v_player.id and u.spin_rule_item_id = i.id
        ) < coalesce(i.max_uses_per_user, 999)
      order by
        case when v_group.group_type = 'sequence' then i.item_order end,
        case when v_group.group_type = 'shuffle_bag' then random() end
      limit 1;
    else
      select weighted.id into v_item_id
      from public.spin_rule_items weighted
      cross join lateral generate_series(
        1, greatest(coalesce(weighted.gravity, 1), 1)
      ) weight
      where weighted.group_id = v_group.id and weighted.is_active
        and (weighted.result_type <> 'letter' or not coalesce(v_player.letter_challenge_completed, false))
        and (
          select count(*) from public.spin_user_rule_usage u
          where u.spin_player_id = v_player.id
            and u.spin_rule_item_id = weighted.id
        ) < coalesce(weighted.max_uses_per_user, 999)
      order by random()
      limit 1;
    end if;
    exit when v_item_id is not null;
  end loop;

  if v_item_id is null then
    raise exception 'No eligible spin result is configured' using errcode = 'P0001';
  end if;

  v_result := public.complete_cash_challenge_spin(
    v_player.id, v_item_id, v_next_spin, p_request_id
  );

  return v_result || jsonb_build_object(
    'state', public.get_canonical_wheel_state(p_session_token)
  );
end;
$$;

revoke all on function public.complete_canonical_wheel_spin(text, uuid) from public;
grant execute on function public.complete_canonical_wheel_spin(text, uuid) to anon, authenticated, service_role;
