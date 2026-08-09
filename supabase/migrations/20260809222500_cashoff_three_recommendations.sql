-- ============================================================
-- CASH-OFF RECOMMENDATIONS: THREE PRODUCT SLOTS
-- ============================================================

alter table public.cashoff_recommendation_settings
  add column if not exists product_3_id uuid
    references public.products(id)
    on delete set null;

alter table public.cashoff_recommendation_settings
  drop constraint if exists cashoff_recommendation_products_distinct;

alter table public.cashoff_recommendation_settings
  add constraint cashoff_recommendation_products_distinct check (
    (product_1_id is null or product_2_id is null or product_1_id <> product_2_id)
    and
    (product_1_id is null or product_3_id is null or product_1_id <> product_3_id)
    and
    (product_2_id is null or product_3_id is null or product_2_id <> product_3_id)
  );

update public.cashoff_recommendation_settings settings
set
  product_3_id = (
    select p.id
    from public.products p
    where p.status = 'active'
      and coalesce(p.stock, 0) > 0
      and p.id is distinct from settings.product_1_id
      and p.id is distinct from settings.product_2_id
    order by
      coalesce(p.featured, false) desc,
      p.created_at desc nulls last,
      p.id
    limit 1
  ),
  updated_at = now()
where settings.id = 1
  and settings.product_3_id is null;

create or replace function public.get_cashoff_recommendations()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_settings public.cashoff_recommendation_settings%rowtype;
  v_products jsonb;
begin
  select *
  into v_settings
  from public.cashoff_recommendation_settings
  where id = 1;

  if not found or not v_settings.enabled then
    return jsonb_build_object(
      'enabled', false,
      'products', '[]'::jsonb
    );
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', product_row.id,
        'name', product_row.name,
        'description', product_row.description,
        'price', product_row.price,
        'sale_price', product_row.sale_price,
        'original_price', product_row.original_price,
        'discount_percentage', product_row.discount_percentage,
        'image_url', product_row.image_url,
        'category', product_row.category,
        'stock', product_row.stock,
        'featured', product_row.featured,
        'product_tag', product_row.product_tag,
        'created_at', product_row.created_at
      )
      order by product_row.slot
    ),
    '[]'::jsonb
  )
  into v_products
  from (
    select 1 as slot, p.*
    from public.products p
    where p.id = v_settings.product_1_id
      and p.status = 'active'
      and coalesce(p.stock, 0) > 0

    union all

    select 2 as slot, p.*
    from public.products p
    where p.id = v_settings.product_2_id
      and p.status = 'active'
      and coalesce(p.stock, 0) > 0

    union all

    select 3 as slot, p.*
    from public.products p
    where p.id = v_settings.product_3_id
      and p.status = 'active'
      and coalesce(p.stock, 0) > 0
  ) product_row;

  return jsonb_build_object(
    'enabled', true,
    'eyebrow', v_settings.eyebrow,
    'headline', v_settings.headline,
    'body_text', v_settings.body_text,
    'updated_at', v_settings.updated_at,
    'products', v_products
  );
end;
$$;

revoke all
on function public.get_cashoff_recommendations()
from public;

grant execute
on function public.get_cashoff_recommendations()
to anon, authenticated;
