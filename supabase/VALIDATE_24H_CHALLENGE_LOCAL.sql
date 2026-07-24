\set ON_ERROR_STOP on
begin;

-- ₦1–₦699 converts to the same Cash-Off amount.
savepoint case_same_amount;
update public.spin_cash_challenges
set status='active', cash_balance=600, converted_cash_off_amount=0,
    started_at=now()-interval '25 hours', expires_at=now()-interval '1 hour',
    processed_at=null, updated_at=now()
where id='47000000-0000-4000-8000-000000000001';
update public.spin_players set wallet_balance=600, cashout_eligible=false
where id='40000000-0000-4000-8000-000000000001';
select public.process_spin_cash_challenge('40000000-0000-4000-8000-000000000001');
do $$
declare v_status text; v_converted numeric; v_cash_off numeric;
begin
  select status, converted_cash_off_amount into v_status, v_converted
  from public.spin_cash_challenges where id='47000000-0000-4000-8000-000000000001';
  select balance into v_cash_off from public.cash_off_accounts
  where identity_id='30000000-0000-4000-8000-000000000001';
  if v_status <> 'converted_to_cash_off' or v_converted <> 600 or v_cash_off <> 1200 then
    raise exception '₦600 conversion failed: status %, converted %, Cash-Off %', v_status, v_converted, v_cash_off;
  end if;
end $$;
rollback to savepoint case_same_amount;

-- ₦700–₦999 converts to ₦1,000 Cash-Off.
savepoint case_floor_bonus;
update public.spin_cash_challenges
set status='active', cash_balance=750, converted_cash_off_amount=0,
    started_at=now()-interval '25 hours', expires_at=now()-interval '1 hour',
    processed_at=null, updated_at=now()
where id='47000000-0000-4000-8000-000000000001';
update public.spin_players set wallet_balance=750, cashout_eligible=false
where id='40000000-0000-4000-8000-000000000001';
select public.process_spin_cash_challenge('40000000-0000-4000-8000-000000000001');
do $$
declare v_status text; v_converted numeric; v_cash_off numeric;
begin
  select status, converted_cash_off_amount into v_status, v_converted
  from public.spin_cash_challenges where id='47000000-0000-4000-8000-000000000001';
  select balance into v_cash_off from public.cash_off_accounts
  where identity_id='30000000-0000-4000-8000-000000000001';
  if v_status <> 'converted_to_cash_off' or v_converted <> 1000 or v_cash_off <> 1600 then
    raise exception '₦750 conversion failed: status %, converted %, Cash-Off %', v_status, v_converted, v_cash_off;
  end if;
end $$;
rollback to savepoint case_floor_bonus;

-- ₦1,000–₦3,000 becomes cash eligible and does not become Cash-Off.
savepoint case_cash_eligible;
update public.spin_cash_challenges
set status='active', cash_balance=1200, converted_cash_off_amount=0,
    started_at=now()-interval '25 hours', expires_at=now()-interval '1 hour',
    processed_at=null, updated_at=now()
where id='47000000-0000-4000-8000-000000000001';
update public.spin_players set wallet_balance=1200, cashout_eligible=false
where id='40000000-0000-4000-8000-000000000001';
select public.process_spin_cash_challenge('40000000-0000-4000-8000-000000000001');
do $$
declare v_status text; v_cash_off numeric; v_eligible boolean; v_wallet numeric;
begin
  select status into v_status from public.spin_cash_challenges
  where id='47000000-0000-4000-8000-000000000001';
  select balance into v_cash_off from public.cash_off_accounts
  where identity_id='30000000-0000-4000-8000-000000000001';
  select cashout_eligible, wallet_balance into v_eligible, v_wallet
  from public.spin_players where id='40000000-0000-4000-8000-000000000001';
  if v_status <> 'cash_eligible' or not v_eligible or v_wallet <> 1200 or v_cash_off <> 600 then
    raise exception '₦1,200 eligibility failed: status %, eligible %, wallet %, Cash-Off %', v_status, v_eligible, v_wallet, v_cash_off;
  end if;
end $$;
rollback to savepoint case_cash_eligible;

-- Cash accumulation is capped at ₦3,000.
savepoint case_cap;
update public.spin_cash_challenges
set status='active', cash_balance=2900, converted_cash_off_amount=0,
    started_at=now(), expires_at=now()+interval '24 hours',
    processed_at=null, updated_at=now()
where id='47000000-0000-4000-8000-000000000001';
update public.spin_players set wallet_balance=2900, cashout_eligible=false
where id='40000000-0000-4000-8000-000000000001';
select public.add_spin_cash_challenge_win(
  '40000000-0000-4000-8000-000000000001', 500, null,
  '47000000-0000-4000-8000-000000000099'
);
do $$
declare v_balance numeric; v_credit numeric;
begin
  select cash_balance into v_balance from public.spin_cash_challenges
  where id='47000000-0000-4000-8000-000000000001';
  select amount_credited into v_credit from public.spin_cash_challenge_credits
  where request_id='47000000-0000-4000-8000-000000000099';
  if v_balance <> 3000 or v_credit <> 100 then
    raise exception '₦3,000 cap failed: balance %, credited %', v_balance, v_credit;
  end if;
end $$;
rollback to savepoint case_cap;

rollback;
\echo 'All 24-hour cash challenge database tests passed.'
