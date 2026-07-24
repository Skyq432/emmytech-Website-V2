-- Local-only deterministic synthetic data. No production records or credentials.

insert into public.product_categories (id, name, slug) values
  ('10000000-0000-4000-8000-000000000001', 'Laptops', 'laptops'),
  ('10000000-0000-4000-8000-000000000002', 'Phones', 'phones'),
  ('10000000-0000-4000-8000-000000000003', 'Solar & Power', 'solar'),
  ('10000000-0000-4000-8000-000000000004', 'Accessories', 'accessories')
on conflict (slug) do update set name = excluded.name;

insert into public.products (
  id, name, slug, description, price, image_url, category, category_id, stock,
  status, featured, original_price, discount_percentage, sale_price, product_tag, created_at
) values
  ('20000000-0000-4000-8000-000000000001','Demo Atlas 14 Laptop','demo-atlas-14','Fictional everyday laptop for local testing.',425000,'/demo-products/laptop.svg','laptops','10000000-0000-4000-8000-000000000001',12,'active',true,450000,6,425000,'Demo',now() - interval '1 day'),
  ('20000000-0000-4000-8000-000000000002','Test NovaBook Pro','test-novabook-pro','Fictional performance laptop for local testing.',785000,'/demo-products/laptop.svg','laptops','10000000-0000-4000-8000-000000000001',8,'active',true,820000,4,785000,'Test',now() - interval '2 days'),
  ('20000000-0000-4000-8000-000000000003','Demo Cedar Mini Laptop','demo-cedar-mini','Fictional compact laptop for local testing.',310000,'/demo-products/laptop.svg','laptops','10000000-0000-4000-8000-000000000001',15,'active',false,330000,6,310000,'Demo',now() - interval '3 days'),
  ('20000000-0000-4000-8000-000000000004','Test Orbit Phone X','test-orbit-phone-x','Fictional Android phone for local testing.',245000,'/demo-products/phone.svg','phones','10000000-0000-4000-8000-000000000002',20,'active',true,260000,6,245000,'Test',now() - interval '4 days'),
  ('20000000-0000-4000-8000-000000000005','Demo Lagoon Phone 5G','demo-lagoon-phone-5g','Fictional 5G phone for local testing.',198000,'/demo-products/phone.svg','phones','10000000-0000-4000-8000-000000000002',18,'active',true,215000,8,198000,'Demo',now() - interval '5 days'),
  ('20000000-0000-4000-8000-000000000006','Test Palm Phone Lite','test-palm-phone-lite','Fictional entry phone for local testing.',98000,'/demo-products/phone.svg','phones','10000000-0000-4000-8000-000000000002',30,'active',false,105000,7,98000,'Test',now() - interval '6 days'),
  ('20000000-0000-4000-8000-000000000007','Demo SunGrid 1kVA Kit','demo-sungrid-1kva','Fictional solar starter kit for local testing.',535000,'/demo-products/solar-power.svg','solar','10000000-0000-4000-8000-000000000003',7,'active',true,565000,5,535000,'Demo',now() - interval '7 days'),
  ('20000000-0000-4000-8000-000000000008','Test RayVault Power Station','test-rayvault-power-station','Fictional portable power station.',285000,'/demo-products/solar-power.svg','solar','10000000-0000-4000-8000-000000000003',10,'active',true,300000,5,285000,'Test',now() - interval '8 days'),
  ('20000000-0000-4000-8000-000000000009','Demo BrightCell Panel','demo-brightcell-panel','Fictional 400W solar panel.',142000,'/demo-products/solar-power.svg','solar','10000000-0000-4000-8000-000000000003',24,'active',false,150000,5,142000,'Demo',now() - interval '9 days'),
  ('20000000-0000-4000-8000-000000000010','Test Echo Wireless Buds','test-echo-wireless-buds','Fictional wireless earbuds.',38000,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',40,'active',true,42000,10,38000,'Test',now() - interval '10 days'),
  ('20000000-0000-4000-8000-000000000011','Demo SwiftCharge 65W','demo-swiftcharge-65w','Fictional USB-C charger.',26500,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',50,'active',false,30000,12,26500,'Demo',now() - interval '11 days'),
  ('20000000-0000-4000-8000-000000000012','Test Glide Wireless Mouse','test-glide-mouse','Fictional wireless mouse.',18500,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',35,'active',false,20000,8,18500,'Test',now() - interval '12 days'),
  ('20000000-0000-4000-8000-000000000013','Demo CloudKey Keyboard','demo-cloudkey-keyboard','Fictional compact keyboard.',32000,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',28,'active',false,35000,9,32000,'Demo',now() - interval '13 days'),
  ('20000000-0000-4000-8000-000000000014','Test Harbor USB Hub','test-harbor-usb-hub','Fictional seven-port USB hub.',22500,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',32,'active',false,25000,10,22500,'Test',now() - interval '14 days'),
  ('20000000-0000-4000-8000-000000000015','Demo Shield Laptop Sleeve','demo-shield-sleeve','Fictional padded laptop sleeve.',16000,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',45,'active',false,18000,11,16000,'Demo',now() - interval '15 days'),
  ('20000000-0000-4000-8000-000000000016','Test Beacon Smart Watch','test-beacon-watch','Fictional smart watch.',74000,'/demo-products/accessories.svg','accessories','10000000-0000-4000-8000-000000000004',16,'active',false,80000,8,74000,'Test',now() - interval '16 days')
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, price=excluded.price,
  image_url=excluded.image_url, category=excluded.category, category_id=excluded.category_id,
  stock=excluded.stock, status=excluded.status, featured=excluded.featured,
  original_price=excluded.original_price, discount_percentage=excluded.discount_percentage,
  sale_price=excluded.sale_price, product_tag=excluded.product_tag;

insert into public.identities (id, identity_code, primary_name, primary_phone, primary_email, status, confidence_score) values
  ('30000000-0000-4000-8000-000000000001','IDN-TEST0001','Test Ada Customer','+2340000000101','test.ada@example.com','active',100),
  ('30000000-0000-4000-8000-000000000002','IDN-DEMO0002','Demo Bayo Referral','+2340000000102','demo.bayo@example.com','active',100)
on conflict (identity_code) do update set
  primary_name=excluded.primary_name, primary_phone=excluded.primary_phone,
  primary_email=excluded.primary_email, status=excluded.status, confidence_score=excluded.confidence_score;

insert into public.identity_signals (id, identity_id, signal_type, signal_value, confidence_weight, verified, source) values
  ('31000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','visitor_id','00000000-0000-4000-8000-000000000101',80,true,'local_seed'),
  ('31000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','phone','+2340000000101',100,true,'local_seed'),
  ('31000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','email','test.ada@example.com',90,true,'local_seed')
on conflict (identity_id, signal_type, signal_value) do update set verified=true, source=excluded.source;

insert into public.visitor_sessions (id, visitor_id, referral_code, ip_address, user_agent) values
  ('32000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000100',null,null,'Test Anonymous Browser'),
  ('32000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000101',null,null,'Test Recognised Browser')
on conflict (visitor_id) do update set user_agent=excluded.user_agent, last_seen=now();

insert into public.spin_players (
  id, identity_id, phone_number, full_name, email, referral_code,
  referred_by_identity_id, spins_remaining, wallet_balance, total_referrals_count,
  total_cash_won, cashout_target, spin_sequence_step, total_cash_off_won
) values
  ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','+2340000000101','Test Ada Customer','test.ada@example.com','TESTADA01',null,7,750,1,750,1000,2,750),
  ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','+2340000000102','Demo Bayo Referral','demo.bayo@example.com','DEMOBAYO2','30000000-0000-4000-8000-000000000001',5,0,0,0,1000,0,0)
on conflict (id) do update set identity_id=excluded.identity_id, spins_remaining=excluded.spins_remaining, wallet_balance=excluded.wallet_balance;

insert into public.spin_prizes (id, old_prize_id, label, prize_type, gravity, stock, monetary_value, is_active, on_wheel) values
  ('41000000-0000-4000-8000-000000000001',900001,'Demo ₦100 Cash Off','cash',10,100,100,true,true),
  ('41000000-0000-4000-8000-000000000002',900002,'Test Bonus Spin','bonus_spin',5,100,0,true,true),
  ('41000000-0000-4000-8000-000000000003',900003,'Demo Letter E','letter',4,100,0,true,true)
on conflict (old_prize_id) do update set label=excluded.label, prize_type=excluded.prize_type, is_active=true;

insert into public.spin_rule_groups (id, old_group_id, group_key, group_name, group_type, start_spin, end_spin, priority, is_active, description) values
  ('42000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000101','demo-opening','Demo Opening Spins','sequence',1,5,10,true,'Synthetic local opening rules'),
  ('42000000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000102','demo-standard','Demo Standard Spins','weighted',6,null,20,true,'Synthetic local standard rules')
on conflict (old_group_id) do update set group_key=excluded.group_key, group_name=excluded.group_name, is_active=true;

insert into public.spin_rule_items (
  id, old_item_id, group_id, item_key, result_label, result_type, cash_amount,
  letter_code, bonus_spins, gravity, item_order, max_uses_per_user, is_active
) values
  ('43000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000101','42000000-0000-4000-8000-000000000001','demo-cash-100','Demo ₦100 Cash Off','cash',100,null,0,10,1,2,true),
  ('43000000-0000-4000-8000-000000000002','43000000-0000-4000-8000-000000000102','42000000-0000-4000-8000-000000000001','demo-bonus-spin','Test Bonus Spin','bonus_spin',0,null,1,5,2,1,true),
  ('43000000-0000-4000-8000-000000000003','43000000-0000-4000-8000-000000000103','42000000-0000-4000-8000-000000000002','demo-letter-e','Demo Letter E','letter',0,'E',0,4,1,1,true)
on conflict (old_item_id) do update set group_id=excluded.group_id, result_label=excluded.result_label, is_active=true;

insert into public.cash_off_accounts (identity_id, balance, total_credited, total_debited, total_redeemed, total_refunded, status) values
  ('30000000-0000-4000-8000-000000000001',600,750,150,150,0,'active')
on conflict (identity_id) do update set balance=excluded.balance, total_credited=excluded.total_credited, total_debited=excluded.total_debited, total_redeemed=excluded.total_redeemed, status=excluded.status;

insert into public.cash_off_transactions (
  id, identity_id, direction, transaction_type, amount, balance_before, balance_after,
  source_system, source_reference, reason, metadata, idempotency_key, created_at
) values
  ('44000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','credit','spin_reward',750,0,750,'local_seed','demo-spin-credit','Synthetic spin reward','{}','local-seed-credit',now() - interval '2 days'),
  ('44000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','debit','order_redemption',150,750,600,'local_seed','demo-order-debit','Synthetic order redemption','{}','local-seed-debit',now() - interval '1 day')
on conflict (idempotency_key) do update set amount=excluded.amount, balance_before=excluded.balance_before, balance_after=excluded.balance_after;

insert into public.spin_referrals (
  id, old_referral_id, referrer_spin_player_id, referred_spin_player_id,
  referrer_identity_id, referred_identity_id, invitee_phone, invitee_email,
  status, reward_granted, reward_spin_amount, rewarded_at
) values (
  '45000000-0000-4000-8000-000000000001','45000000-0000-4000-8000-000000000101',
  '40000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002',
  '+2340000000102','demo.bayo@example.com','completed',true,1,now()
)
on conflict (old_referral_id) do update set status=excluded.status, reward_granted=excluded.reward_granted;

insert into public.leads (
  id, source, customer_name, customer_phone, customer_email, status, notes,
  visitor_id, product_id, lead_type, source_page, identity_id, funnel_stage
) values (
  '46000000-0000-4000-8000-000000000001','direct','Test Ada Customer',
  '+2340000000101','test.ada@example.com','new','Synthetic local lead',
  '00000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000001',
  'product_interest','/products','30000000-0000-4000-8000-000000000001','new_lead'
)
on conflict (id) do update set identity_id=excluded.identity_id, visitor_id=excluded.visitor_id, product_id=excluded.product_id;
