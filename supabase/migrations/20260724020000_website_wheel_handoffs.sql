create table public.website_wheel_handoffs (
  token_hash text primary key,
  visitor_id text not null,
  product_id uuid references public.products(id) on delete set null,
  source_path text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz,
  constraint website_wheel_handoffs_visitor_id_check
    check (nullif(trim(visitor_id), '') is not null),
  constraint website_wheel_handoffs_source_path_check
    check (source_path is null or length(source_path) <= 500),
  constraint website_wheel_handoffs_expiry_check
    check (expires_at > created_at)
);

alter table public.website_wheel_handoffs enable row level security;
revoke all on table public.website_wheel_handoffs from public, anon, authenticated;
grant all on table public.website_wheel_handoffs to service_role;

-- Historical imports can contain more than one player row for an identity.
-- Preserve every player and its related history, but retain a single canonical
-- identity link. Prefer the row with the most activity and latest update.
with ranked_players as (
  select
    id,
    row_number() over (
      partition by identity_id
      order by
        coalesce(spins_remaining, 0) desc,
        coalesce(wallet_balance, 0) desc,
        coalesce(total_cash_won, 0) desc,
        coalesce(updated_at, created_at) desc nulls last,
        id
    ) as identity_rank
  from public.spin_players
  where identity_id is not null
)
update public.spin_players as player
set identity_id = null,
    updated_at = now()
from ranked_players
where player.id = ranked_players.id
  and ranked_players.identity_rank > 1;

create unique index spin_players_one_per_identity_idx
  on public.spin_players (identity_id)
  where identity_id is not null;

create or replace function public.create_website_wheel_handoff(
  p_visitor_id text,
  p_product_id uuid default null,
  p_source_path text default null
) returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_token text;
begin
  if nullif(trim(p_visitor_id), '') is null then
    raise exception 'visitor_id is required' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.visitor_sessions where visitor_id = trim(p_visitor_id)
  ) then
    raise exception 'Visitor session is not registered' using errcode = '23503';
  end if;

  if p_product_id is not null and not exists (
    select 1 from public.products where id = p_product_id and status = 'active'
  ) then
    raise exception 'Product is not available' using errcode = '23503';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.website_wheel_handoffs (
    token_hash, visitor_id, product_id, source_path
  ) values (
    encode(extensions.digest(v_token, 'sha256'), 'hex'),
    trim(p_visitor_id),
    p_product_id,
    left(nullif(trim(p_source_path), ''), 500)
  );

  return v_token;
end;
$$;

create or replace function public.consume_website_wheel_handoff(
  p_handoff_token text
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_handoff public.website_wheel_handoffs%rowtype;
  v_identity_id uuid;
  v_player public.spin_players%rowtype;
  v_cash_off_balance numeric(14,2);
begin
  if nullif(trim(p_handoff_token), '') is null
     or length(trim(p_handoff_token)) <> 64
     or trim(p_handoff_token) !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Invalid handoff token' using errcode = '22023';
  end if;

  select * into v_handoff
  from public.website_wheel_handoffs
  where token_hash = encode(extensions.digest(trim(p_handoff_token), 'sha256'), 'hex')
  for update;

  if not found then
    raise exception 'Invalid handoff token' using errcode = '22023';
  end if;

  if v_handoff.consumed_at is not null then
    raise exception 'Handoff token has already been consumed' using errcode = '55000';
  end if;

  if v_handoff.expires_at <= now() then
    raise exception 'Handoff token has expired' using errcode = '22023';
  end if;

  update public.website_wheel_handoffs
  set consumed_at = now()
  where token_hash = v_handoff.token_hash;

  select identity_id into v_identity_id
  from public.identity_signals
  where signal_type = 'visitor_id'
    and lower(trim(signal_value)) = lower(trim(v_handoff.visitor_id))
  order by verified desc, confidence_weight desc, first_seen_at
  limit 1;

  if v_identity_id is null then
    v_identity_id := public.upsert_identity_from_signals(
      jsonb_build_array(jsonb_build_object('type', 'visitor_id', 'value', v_handoff.visitor_id)),
      null, null, null, 'website_wheel_handoff'
    );
  end if;

  select * into v_player
  from public.spin_players
  where identity_id = v_identity_id
  limit 1;

  if not found then
    insert into public.spin_players (identity_id, referral_code)
    values (
      v_identity_id,
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
    )
    on conflict (identity_id) where identity_id is not null do nothing
    returning * into v_player;

    if not found then
      select * into strict v_player
      from public.spin_players
      where identity_id = v_identity_id;
    end if;
  end if;

  select balance into v_cash_off_balance
  from public.cash_off_accounts
  where identity_id = v_identity_id;

  return jsonb_build_object(
    'identity_id', v_identity_id,
    'spin_player', jsonb_build_object(
      'id', v_player.id,
      'identity_id', v_player.identity_id,
      'full_name', v_player.full_name,
      'phone_number', v_player.phone_number,
      'email', v_player.email,
      'referral_code', v_player.referral_code,
      'referred_by_identity_id', v_player.referred_by_identity_id,
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
    'cash_off_balance', coalesce(v_cash_off_balance, 0),
    'product_id', v_handoff.product_id
  );
end;
$$;

revoke all on function public.create_website_wheel_handoff(text, uuid, text) from public;
revoke all on function public.consume_website_wheel_handoff(text) from public;
grant execute on function public.create_website_wheel_handoff(text, uuid, text)
  to anon, authenticated, service_role;
grant execute on function public.consume_website_wheel_handoff(text)
  to anon, authenticated, service_role;
