import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const trackingSupabase = createClient(supabaseUrl, supabasePublishableKey);

const VISITOR_ID_KEY = 'emmy_visitor_id';
let registration: { key: string; promise: Promise<string | null> } | null = null;

export type WebsiteEventType =
  | 'website_visited'
  | 'page_viewed'
  | 'product_viewed'
  | 'product_quick_viewed'
  | 'product_shared'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'whatsapp_purchase_clicked'
  | 'spin_opened_from_product'
  | 'reward_viewed'
  | 'reward_applied';

export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;

    const visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch (error) {
    console.warn('Visitor ID storage is unavailable; tracking was skipped.', error);
    return null;
  }
}

export function registerVisitor(referralCode?: string | null): Promise<string | null> {
  const visitorId = getVisitorId();
  if (!visitorId || typeof window === 'undefined') return Promise.resolve(null);

  const key = visitorId;
  if (registration?.key === key) return registration.promise;

  const promise = (async () => {
    try {
      const { error } = await trackingSupabase.rpc('register_visitor_session', {
        p_visitor_id: visitorId,
        p_referral_code: referralCode || null,
        p_ip_address: null,
        p_user_agent: window.navigator.userAgent,
      });
      if (error) throw error;
      return visitorId;
    } catch (error) {
      console.warn('Visitor registration failed; the website will continue normally.', error);
      return null;
    }
  })();

  registration = { key, promise };
  return promise;
}

export async function trackWebsiteEvent(
  eventType: WebsiteEventType,
  options: { productId?: string | null; quantity?: number; sourcePage?: string } = {},
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const visitorId = await registerVisitor();
    if (!visitorId) return;

    const { error } = await trackingSupabase.rpc('track_product_event', {
      p_visitor_id: visitorId,
      p_product_id: options.productId || null,
      p_event_type: eventType,
      p_quantity: Math.max(1, options.quantity ?? 1),
      p_source_page: options.sourcePage ?? window.location.pathname,
    });
    if (error) throw error;
  } catch (error) {
    console.warn(`Tracking event "${eventType}" failed; the website will continue normally.`, error);
  }
}

export const trackWebsiteVisited = () => trackWebsiteEvent('website_visited');
export const trackPageViewed = () => trackWebsiteEvent('page_viewed');
export const trackProductView = (productId: string) =>
  trackWebsiteEvent('product_viewed', { productId });
export const trackProductQuickView = (productId: string) =>
  trackWebsiteEvent('product_quick_viewed', { productId });
export const trackProductShared = (productId: string) =>
  trackWebsiteEvent('product_shared', { productId });
export const trackAddToCart = (productId: string, quantity = 1) =>
  trackWebsiteEvent('add_to_cart', { productId, quantity });
export const trackRemoveFromCart = (productId: string, quantity = 1) =>
  trackWebsiteEvent('remove_from_cart', { productId, quantity });
export const trackWhatsAppPurchaseClicked = (productId: string, quantity = 1) =>
  trackWebsiteEvent('whatsapp_purchase_clicked', { productId, quantity });

// Prepared for future UI integrations. These do not emit until explicitly called.
export const trackSpinOpenedFromProduct = (productId: string) =>
  trackWebsiteEvent('spin_opened_from_product', { productId });

export async function openSpinWheelFromProduct(productId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const wheelUrl = process.env.NEXT_PUBLIC_SPIN_WHEEL_URL;
  if (!wheelUrl) throw new Error('The Spin & Save wheel is not configured.');

  const visitorId = await registerVisitor();
  if (!visitorId) throw new Error('We could not prepare your wheel session.');

  await trackSpinOpenedFromProduct(productId);

  const { data: handoffToken, error } = await trackingSupabase.rpc(
    'create_website_wheel_handoff',
    {
      p_visitor_id: visitorId,
      p_product_id: productId,
      p_source_path: window.location.pathname,
    },
  );

  if (error || !handoffToken) {
    throw new Error('We could not securely connect your account to the wheel.');
  }

  const destination = new URL(wheelUrl);
  destination.searchParams.set('handoff', handoffToken);
  window.location.assign(destination.toString());
}
export const trackRewardViewed = () => trackWebsiteEvent('reward_viewed');
export const trackRewardApplied = () => trackWebsiteEvent('reward_applied');

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
    p_source_page: typeof window === 'undefined' ? null : window.location.pathname,
  });

  if (error) throw error;
  return data;
}
