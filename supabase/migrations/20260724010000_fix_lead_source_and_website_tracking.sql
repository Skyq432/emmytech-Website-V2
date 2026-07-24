-- Keep lead source validation aligned with the existing website cart RPC.
alter table public.leads drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
  check (source = any (array['whatsapp', 'referral', 'social', 'direct', 'website_cart']::text[]));

-- A single protected event ledger supports both product and page-level website events.
create table if not exists public.website_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  product_id uuid references public.products(id) on delete set null,
  ambassador_id uuid references public.ambassadors(id) on delete set null,
  event_type text not null check (event_type = any (array[
    'website_visited',
    'page_viewed',
    'product_viewed',
    'product_quick_viewed',
    'product_shared',
    'add_to_cart',
    'remove_from_cart',
    'whatsapp_purchase_clicked',
    'spin_opened_from_product',
    'reward_viewed',
    'reward_applied'
  ]::text[])),
  quantity integer not null default 1 check (quantity > 0),
  source_page text,
  created_at timestamptz not null default now()
);

create index if not exists website_events_visitor_created_idx
  on public.website_events (visitor_id, created_at desc);

create index if not exists website_events_product_created_idx
  on public.website_events (product_id, created_at desc);

alter table public.website_events enable row level security;
revoke all on table public.website_events from public, anon, authenticated;
grant all on table public.website_events to service_role;

create or replace function public.track_product_event(
  p_visitor_id text,
  p_product_id uuid,
  p_event_type text,
  p_quantity integer default 1,
  p_source_page text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_session record;
  v_lead_id uuid;
  v_event_type text;
begin
  if nullif(trim(p_visitor_id), '') is null then
    raise exception 'visitor_id is required' using errcode = '22023';
  end if;

  v_event_type := case p_event_type
    when 'view' then 'product_viewed'
    else p_event_type
  end;

  if v_event_type not in (
    'website_visited', 'page_viewed', 'product_viewed', 'product_quick_viewed',
    'product_shared', 'add_to_cart', 'remove_from_cart',
    'whatsapp_purchase_clicked', 'spin_opened_from_product', 'reward_viewed',
    'reward_applied'
  ) then
    raise exception 'Unsupported website event type: %', v_event_type using errcode = '22023';
  end if;

  if v_event_type in (
    'product_viewed', 'product_quick_viewed', 'product_shared', 'add_to_cart',
    'remove_from_cart', 'whatsapp_purchase_clicked', 'spin_opened_from_product'
  ) and p_product_id is null then
    raise exception 'product_id is required for %', v_event_type using errcode = '22023';
  end if;

  select * into v_session
  from public.visitor_sessions
  where visitor_id = p_visitor_id
  limit 1;

  if not found then
    raise exception 'Visitor session is not registered' using errcode = '23503';
  end if;

  insert into public.website_events (
    visitor_id, product_id, ambassador_id, event_type, quantity, source_page
  ) values (
    p_visitor_id, p_product_id, v_session.ambassador_id, v_event_type,
    greatest(coalesce(p_quantity, 1), 1), left(p_source_page, 500)
  );

  if v_event_type in ('product_viewed', 'product_quick_viewed') then
    insert into public.product_views (visitor_id, product_id, ambassador_id)
    values (p_visitor_id, p_product_id, v_session.ambassador_id);
  end if;

  if v_event_type = 'add_to_cart' then
    insert into public.cart_events (visitor_id, product_id, ambassador_id, quantity)
    values (p_visitor_id, p_product_id, v_session.ambassador_id, greatest(coalesce(p_quantity, 1), 1));

    insert into public.leads (
      ambassador_id, visitor_id, product_id, source, customer_name, customer_phone,
      customer_email, referral_code_used, status, lead_type, source_page, notes,
      created_at, updated_at
    ) values (
      v_session.ambassador_id, p_visitor_id, p_product_id, 'website_cart',
      'Anonymous Cart Lead', 'Pending - Website', null, v_session.referral_code,
      'new', 'add_to_cart', p_source_page,
      'Lead created automatically when visitor added product to cart.', now(), now()
    ) returning id into v_lead_id;
  end if;

  update public.visitor_sessions set last_seen = now() where visitor_id = p_visitor_id;

  return jsonb_build_object('success', true, 'event_type', v_event_type, 'lead_id', v_lead_id);
end;
$$;

revoke all on function public.track_product_event(text, uuid, text, integer, text) from public;
grant execute on function public.track_product_event(text, uuid, text, integer, text)
  to anon, authenticated, service_role;
