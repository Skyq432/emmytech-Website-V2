import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const trackingSupabase = createClient(supabaseUrl, supabasePublishableKey);

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getVisitorId() {
  if (typeof window === 'undefined') return null;

  let visitorId = localStorage.getItem('emmy_visitor_id');

  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem('emmy_visitor_id', visitorId);
  }

  return visitorId;
}

export async function registerVisitor(referralCode?: string | null) {
  const visitorId = getVisitorId();
  if (!visitorId) return null;

  await trackingSupabase.rpc('register_visitor_session', {
    p_visitor_id: visitorId,
    p_referral_code: referralCode || null,
    p_ip_address: null,
    p_user_agent: navigator.userAgent,
  });

  return visitorId;
}

export async function trackProductView(productId: string) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  await trackingSupabase.rpc('track_product_event', {
    p_visitor_id: visitorId,
    p_product_id: productId,
    p_event_type: 'view',
    p_quantity: 1,
    p_source_page: window.location.pathname,
  });
}

export async function trackAddToCart(productId: string, quantity = 1) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  await trackingSupabase.rpc('track_product_event', {
    p_visitor_id: visitorId,
    p_product_id: productId,
    p_event_type: 'add_to_cart',
    p_quantity: quantity,
    p_source_page: window.location.pathname,
  });
}

export async function createQuoteLead({
  productId,
  fullName,
  phone,
  email,
  notes,
}: {
  productId: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}) {
  const visitorId = getVisitorId();
  if (!visitorId) return null;

  const { data, error } = await trackingSupabase.rpc('create_quote_lead', {
    p_visitor_id: visitorId,
    p_product_id: productId,
    p_full_name: fullName,
    p_phone: phone,
    p_email: email || null,
    p_notes: notes || null,
    p_source_page: window.location.pathname,
  });

  if (error) throw error;

  return data;
}
