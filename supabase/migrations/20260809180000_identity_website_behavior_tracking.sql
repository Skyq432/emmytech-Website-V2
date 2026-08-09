-- ============================================================
-- EMMYTECH WEBSITE BEHAVIOUR TRACKING
--
-- Goals:
-- 1. Every meaningful website action can be stored.
-- 2. Known SMS customers are attached directly to Identity.
-- 3. Anonymous visitors remain traceable by visitor_id.
-- 4. Rich metadata is available for the future Identity timeline.
-- 5. Avoid creating a new Lead every time the same person
--    adds another product to cart.
-- ============================================================


alter table public.website_events
  add column if not exists identity_id uuid
    references public.identities(id)
    on delete set null;

alter table public.website_events
  add column if not exists lead_id uuid
    references public.leads(id)
    on delete set null;

alter table public.website_events
  add column if not exists page_url text;

alter table public.website_events
  add column if not exists search_query text;

alter table public.website_events
  add column if not exists results_count integer;

alter table public.website_events
  add column if not exists metadata jsonb
    not null
    default '{}'::jsonb;


create index if not exists
  website_events_identity_created_idx
on public.website_events(
  identity_id,
  created_at desc
);


create index if not exists
  website_events_visitor_created_idx
on public.website_events(
  visitor_id,
  created_at desc
);


create index if not exists
  website_events_type_created_idx
on public.website_events(
  event_type,
  created_at desc
);



create or replace function public.track_website_behavior(
  p_visitor_id text,
  p_event_type text,
  p_product_id uuid default null,
  p_quantity integer default 1,
  p_source_page text default null,
  p_page_url text default null,
  p_search_query text default null,
  p_results_count integer default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.visitor_sessions%rowtype;

  v_identity_id uuid;
  v_lead_id uuid;
  v_event_id uuid;

  v_event_type text;
  v_quantity integer;
begin

  -- ----------------------------------------------------------
  -- BASIC INPUT SAFETY
  -- ----------------------------------------------------------

  if nullif(trim(p_visitor_id), '') is null then
    raise exception 'visitor_id is required'
      using errcode = '22023';
  end if;


  v_event_type :=
    lower(
      trim(
        coalesce(
          p_event_type,
          ''
        )
      )
    );


  if v_event_type not in (

    -- Session / source
    'website_visited',
    'page_viewed',
    'sms_returned',

    -- Welcome experience
    'welcome_modal_shown',
    'welcome_modal_dismissed',
    'welcome_explore_products',
    'welcome_use_spins',

    -- Catalogue behaviour
    'search_performed',
    'category_selected',
    'sort_changed',
    'price_filter_changed',

    -- Products
    'product_viewed',
    'product_quick_viewed',
    'product_shared',

    -- Cart
    'add_to_cart',
    'remove_from_cart',
    'cart_quantity_changed',
    'cart_opened',
    'checkout_started',
    'whatsapp_purchase_clicked',

    -- Spin & Save
    'spin_opened_from_product',
    'spin_save_opened',
    'spin_completed',
    'cash_off_viewed',

    -- Cash-Off product choice
    'cash_off_product_selected',
    'cash_off_product_changed',
    'cash_off_product_removed',

    -- Full wheel
    'full_wheel_opened_from_overlay',
    'full_wheel_opened_from_cart',
    'returned_from_full_wheel',

    -- Existing reward events
    'reward_viewed',
    'reward_applied',

    -- Reserved for next phase
    'recommendation_shown',
    'recommendation_clicked',
    'recommendation_dismissed'

  ) then

    raise exception
      'Unsupported website event type: %',
      v_event_type
      using errcode = '22023';

  end if;


  v_quantity :=
    greatest(
      coalesce(
        p_quantity,
        1
      ),
      1
    );


  -- ----------------------------------------------------------
  -- PRODUCT-SPECIFIC ACTIONS REQUIRE A PRODUCT
  -- ----------------------------------------------------------

  if v_event_type in (
    'product_viewed',
    'product_quick_viewed',
    'product_shared',
    'add_to_cart',
    'remove_from_cart',
    'cart_quantity_changed',
    'whatsapp_purchase_clicked',
    'spin_opened_from_product',
    'cash_off_product_selected',
    'cash_off_product_changed',
    'cash_off_product_removed',
    'recommendation_clicked'
  )
  and p_product_id is null then

    raise exception
      'product_id is required for %',
      v_event_type
      using errcode = '22023';

  end if;


  -- ----------------------------------------------------------
  -- VISITOR SESSION
  -- ----------------------------------------------------------

  select *
  into v_session
  from public.visitor_sessions
  where visitor_id =
    trim(p_visitor_id)
  limit 1;


  if not found then
    raise exception
      'Visitor session is not registered'
      using errcode = '23503';
  end if;


  -- ----------------------------------------------------------
  -- RESOLVE IDENTITY
  --
  -- SMS handoff attribution is strongest because it was
  -- securely connected from a known customer.
  -- ----------------------------------------------------------

  select attribution.identity_id
  into v_identity_id
  from public.website_visitor_attributions attribution
  where attribution.visitor_id =
    trim(p_visitor_id)
    and attribution.identity_id is not null
  order by
    attribution.last_seen_at desc,
    attribution.first_seen_at desc
  limit 1;


  -- Fall back to the general Identity signal system.
  if v_identity_id is null then

    select signal.identity_id
    into v_identity_id
    from public.identity_signals signal
    where signal.signal_type =
      'visitor_id'
      and lower(
        trim(signal.signal_value)
      ) =
      lower(
        trim(p_visitor_id)
      )
    order by
      signal.verified desc,
      signal.confidence_weight desc,
      signal.last_seen_at desc
    limit 1;

  end if;


  -- ----------------------------------------------------------
  -- RESOLVE EXISTING LEAD
  --
  -- Prefer a Lead already attached to this Identity.
  -- Otherwise use the visitor's existing Lead.
  -- ----------------------------------------------------------

  if v_identity_id is not null then

    select lead.id
    into v_lead_id
    from public.leads lead
    where lead.identity_id =
      v_identity_id
      and lead.merged_into_lead_id is null
    order by
      lead.updated_at desc,
      lead.created_at desc
    limit 1;

  end if;


  if v_lead_id is null then

    select lead.id
    into v_lead_id
    from public.leads lead
    where lead.visitor_id =
      trim(p_visitor_id)
      and lead.merged_into_lead_id is null
    order by
      lead.updated_at desc,
      lead.created_at desc
    limit 1;

  end if;


  -- ----------------------------------------------------------
  -- CART ACTION CAN CREATE A LEAD,
  -- BUT ONLY WHEN ONE DOES NOT ALREADY EXIST.
  -- ----------------------------------------------------------

  if v_event_type =
    'add_to_cart'
    and v_lead_id is null then

    insert into public.leads (
      ambassador_id,
      visitor_id,
      identity_id,
      product_id,
      source,
      source_detail,
      customer_name,
      customer_phone,
      customer_email,
      referral_code_used,
      status,
      lead_type,
      source_page,
      notes,
      created_at,
      updated_at
    )
    values (
      v_session.ambassador_id,
      trim(p_visitor_id),
      v_identity_id,
      p_product_id,
      'website_cart',
      jsonb_build_object(
        'created_from',
        'website_behavior_tracking'
      ),
      case
        when v_identity_id is null
          then 'Anonymous Cart Lead'
        else 'Known Website Customer'
      end,
      'Pending - Website',
      null,
      v_session.referral_code,
      'new',
      'add_to_cart',
      left(
        p_source_page,
        500
      ),
      'Lead created after the visitor showed purchase intent by adding a product to cart.',
      now(),
      now()
    )
    returning id
    into v_lead_id;

  end if;


  -- Keep an existing Lead current when another product
  -- is added to the cart.
  if v_event_type =
    'add_to_cart'
    and v_lead_id is not null then

    update public.leads
    set
      identity_id =
        coalesce(
          identity_id,
          v_identity_id
        ),

      visitor_id =
        coalesce(
          visitor_id,
          trim(p_visitor_id)
        ),

      product_id =
        coalesce(
          product_id,
          p_product_id
        ),

      updated_at =
        now(),

      source_detail =
        coalesce(
          source_detail,
          '{}'::jsonb
        )
        ||
        jsonb_build_object(
          'last_cart_product_id',
          p_product_id,
          'last_cart_activity_at',
          now()
        )

    where id =
      v_lead_id;

  end if;


  -- ----------------------------------------------------------
  -- MAIN EVENT
  -- ----------------------------------------------------------

  insert into public.website_events (
    visitor_id,
    identity_id,
    lead_id,
    product_id,
    ambassador_id,
    event_type,
    quantity,
    source_page,
    page_url,
    search_query,
    results_count,
    metadata,
    created_at
  )
  values (
    trim(p_visitor_id),
    v_identity_id,
    v_lead_id,
    p_product_id,
    v_session.ambassador_id,
    v_event_type,
    v_quantity,

    left(
      p_source_page,
      500
    ),

    left(
      p_page_url,
      1000
    ),

    left(
      p_search_query,
      300
    ),

    p_results_count,

    coalesce(
      p_metadata,
      '{}'::jsonb
    ),

    now()
  )
  returning id
  into v_event_id;


  -- ----------------------------------------------------------
  -- KEEP EXISTING PRODUCT ANALYTICS TABLES WORKING
  -- ----------------------------------------------------------

  if v_event_type in (
    'product_viewed',
    'product_quick_viewed'
  ) then

    insert into public.product_views (
      visitor_id,
      product_id,
      ambassador_id
    )
    values (
      trim(p_visitor_id),
      p_product_id,
      v_session.ambassador_id
    );

  end if;


  if v_event_type =
    'add_to_cart' then

    insert into public.cart_events (
      visitor_id,
      product_id,
      ambassador_id,
      quantity
    )
    values (
      trim(p_visitor_id),
      p_product_id,
      v_session.ambassador_id,
      v_quantity
    );

  end if;


  update public.visitor_sessions
  set
    last_seen =
      now()
  where visitor_id =
    trim(p_visitor_id);


  return jsonb_build_object(
    'success',
    true,
    'event_id',
    v_event_id,
    'event_type',
    v_event_type,
    'identity_id',
    v_identity_id,
    'lead_id',
    v_lead_id
  );

end;
$$;


revoke all
on function public.track_website_behavior(
  text,
  text,
  uuid,
  integer,
  text,
  text,
  text,
  integer,
  jsonb
)
from public;


grant execute
on function public.track_website_behavior(
  text,
  text,
  uuid,
  integer,
  text,
  text,
  text,
  integer,
  jsonb
)
to anon, authenticated;

