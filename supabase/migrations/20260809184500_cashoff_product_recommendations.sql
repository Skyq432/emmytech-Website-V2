create table if not exists public.cashoff_recommendation_settings (
  id smallint primary key default 1,
  enabled boolean not null default true,
  eyebrow text not null default 'For your Cash-Off',
  headline text not null default 'Two products worth a look',
  body_text text not null default 'Here are two options you can explore with your saved Cash-Off. Take your time - your balance stays available while you browse.',
  product_1_id uuid references public.products(id) on delete set null,
  product_2_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cashoff_recommendation_settings_singleton check (id = 1),
  constraint cashoff_recommendation_products_distinct check (
    product_1_id is null
    or product_2_id is null
    or product_1_id <> product_2_id
  )
);

alter table public.cashoff_recommendation_settings
  enable row level security;

revoke all
on table public.cashoff_recommendation_settings
from anon, authenticated;


with chosen as (
  select array_agg(id order by slot) as ids
  from (
    select
      p.id,
      row_number() over (
        order by
          coalesce(p.featured, false) desc,
          p.created_at desc nulls last,
          p.id
      ) as slot
    from public.products p
    where p.status = 'active'
      and coalesce(p.stock, 0) > 0
    order by
      coalesce(p.featured, false) desc,
      p.created_at desc nulls last,
      p.id
    limit 2
  ) ranked
)
insert into public.cashoff_recommendation_settings (
  id,
  enabled,
  eyebrow,
  headline,
  body_text,
  product_1_id,
  product_2_id
)
select
  1,
  true,
  'For your Cash-Off',
  'Two products worth a look',
  'Here are two options you can explore with your saved Cash-Off. Take your time - your balance stays available while you browse.',
  ids[1],
  ids[2]
from chosen
where coalesce(array_length(ids, 1), 0) >= 2
on conflict (id) do nothing;


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
    select
      1 as slot,
      p.*
    from public.products p
    where p.id = v_settings.product_1_id
      and p.status = 'active'
      and coalesce(p.stock, 0) > 0

    union all

    select
      2 as slot,
      p.*
    from public.products p
    where p.id = v_settings.product_2_id
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
