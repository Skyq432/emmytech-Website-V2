alter table public.website_events drop constraint if exists website_events_event_type_check;
alter table public.website_events add constraint website_events_event_type_check check (event_type = any (array[
  'website_visited','page_viewed','product_viewed','product_quick_viewed','product_shared',
  'add_to_cart','remove_from_cart','whatsapp_purchase_clicked','spin_opened_from_product',
  'reward_viewed','reward_applied','cash_off_product_selected','cash_off_product_changed',
  'cash_off_product_removed','full_wheel_opened_from_overlay','full_wheel_opened_from_cart',
  'returned_from_full_wheel'
]::text[]));

alter function public.track_product_event(text, uuid, text, integer, text)
  rename to track_product_event_legacy;

create function public.track_product_event(
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
declare v_session record;
begin
  if p_event_type not in (
    'cash_off_product_selected','cash_off_product_changed','cash_off_product_removed',
    'full_wheel_opened_from_overlay','full_wheel_opened_from_cart','returned_from_full_wheel'
  ) then
    return public.track_product_event_legacy(p_visitor_id, p_product_id, p_event_type, p_quantity, p_source_page);
  end if;
  if nullif(trim(p_visitor_id), '') is null then raise exception 'visitor_id is required' using errcode = '22023'; end if;
  if p_event_type like 'cash_off_product_%' and p_product_id is null then raise exception 'product_id is required' using errcode = '22023'; end if;
  select * into v_session from public.visitor_sessions where visitor_id = trim(p_visitor_id) limit 1;
  if not found then raise exception 'Visitor session is not registered' using errcode = '23503'; end if;
  insert into public.website_events(visitor_id, product_id, ambassador_id, event_type, quantity, source_page)
  values (trim(p_visitor_id), p_product_id, v_session.ambassador_id, p_event_type, greatest(coalesce(p_quantity, 1), 1), left(p_source_page, 500));
  update public.visitor_sessions set last_seen = now() where visitor_id = trim(p_visitor_id);
  return jsonb_build_object('success', true, 'event_type', p_event_type);
end;
$$;

revoke all on function public.track_product_event(text, uuid, text, integer, text) from public;
grant execute on function public.track_product_event(text, uuid, text, integer, text) to anon, authenticated, service_role;
revoke all on function public.track_product_event_legacy(text, uuid, text, integer, text) from public, anon, authenticated;
grant execute on function public.track_product_event_legacy(text, uuid, text, integer, text) to service_role;
