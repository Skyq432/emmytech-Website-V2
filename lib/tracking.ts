import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export const trackingSupabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
  );


const VISITOR_ID_KEY =
  'emmy_visitor_id';


let registration: {
  key: string;
  promise: Promise<string | null>;
} | null = null;



export type WebsiteEventType =

  // Session / source
  | 'website_visited'
  | 'page_viewed'
  | 'sms_returned'

  // Welcome experience
  | 'welcome_modal_shown'
  | 'welcome_modal_dismissed'
  | 'welcome_explore_products'
  | 'welcome_use_spins'

  // Catalogue
  | 'search_performed'
  | 'category_selected'
  | 'sort_changed'
  | 'price_filter_changed'

  // Products
  | 'product_viewed'
  | 'product_quick_viewed'
  | 'product_shared'

  // Cart
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_quantity_changed'
  | 'cart_opened'
  | 'checkout_started'
  | 'whatsapp_purchase_clicked'

  // Spin & Save
  | 'spin_opened_from_product'
  | 'spin_save_opened'
  | 'spin_completed'
  | 'cash_off_viewed'

  // Cash-Off
  | 'cash_off_product_selected'
  | 'cash_off_product_changed'
  | 'cash_off_product_removed'

  // Full wheel
  | 'full_wheel_opened_from_overlay'
  | 'full_wheel_opened_from_cart'
  | 'returned_from_full_wheel'

  // Reward
  | 'reward_viewed'
  | 'reward_applied'

  // Recommendation system - next phase
  | 'recommendation_shown'
  | 'recommendation_clicked'
  | 'recommendation_dismissed';



export interface WebsiteEventOptions {
  productId?: string | null;
  quantity?: number;

  sourcePage?: string;

  searchQuery?: string | null;
  resultsCount?: number | null;

  metadata?: Record<
    string,
    unknown
  >;
}



export function getVisitorId():
  string | null {

  if (
    typeof window ===
    'undefined'
  ) {
    return null;
  }


  try {

    const existing =
      window.localStorage.getItem(
        VISITOR_ID_KEY,
      );


    if (existing) {
      return existing;
    }


    const visitorId =
      window.crypto.randomUUID();


    window.localStorage.setItem(
      VISITOR_ID_KEY,
      visitorId,
    );


    return visitorId;

  }

  catch (error) {

    console.warn(
      'Visitor ID storage is unavailable; tracking was skipped.',
      error,
    );


    return null;

  }
}



export function registerVisitor(
  referralCode?: string | null,
): Promise<string | null> {

  const visitorId =
    getVisitorId();


  if (
    !visitorId ||
    typeof window ===
      'undefined'
  ) {
    return Promise.resolve(
      null,
    );
  }


  const key =
    visitorId;


  if (
    registration?.key ===
    key
  ) {
    return registration.promise;
  }


  const promise =
    (async () => {

      try {

        const {
          error,
        } =
          await trackingSupabase.rpc(
            'register_visitor_session',
            {
              p_visitor_id:
                visitorId,

              p_referral_code:
                referralCode ||
                null,

              p_ip_address:
                null,

              p_user_agent:
                window.navigator
                  .userAgent,
            },
          );


        if (error) {
          throw error;
        }


        return visitorId;

      }

      catch (error) {

        console.warn(
          'Visitor registration failed; the website will continue normally.',
          error,
        );


        return null;

      }

    })();


  registration = {
    key,
    promise,
  };


  return promise;
}



export async function trackWebsiteEvent(
  eventType: WebsiteEventType,
  options: WebsiteEventOptions = {},
): Promise<void> {

  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }


  try {

    const visitorId =
      await registerVisitor();


    if (!visitorId) {
      return;
    }


    // Intentionally excludes query parameters.
    // This prevents one-time SMS handoff tokens
    // from being stored in analytics.
    const safePageUrl =
      `${window.location.origin}${window.location.pathname}`;


    const {
      error,
    } =
      await trackingSupabase.rpc(
        'track_website_behavior',
        {
          p_visitor_id:
            visitorId,

          p_event_type:
            eventType,

          p_product_id:
            options.productId ||
            null,

          p_quantity:
            Math.max(
              1,
              options.quantity ??
              1,
            ),

          p_source_page:
            options.sourcePage ??
            window.location.pathname,

          p_page_url:
            safePageUrl,

          p_search_query:
            options.searchQuery ??
            null,

          p_results_count:
            options.resultsCount ??
            null,

          p_metadata:
            options.metadata ??
            {},
        },
      );


    if (error) {
      throw error;
    }

  }

  catch (error) {

    console.warn(
      `Tracking event "${eventType}" failed; the website will continue normally.`,
      error,
    );

  }
}



// ============================================================
// EXISTING PRODUCT / CART EVENTS
// ============================================================

export const trackWebsiteVisited =
  () =>
    trackWebsiteEvent(
      'website_visited',
    );


export const trackPageViewed =
  () =>
    trackWebsiteEvent(
      'page_viewed',
    );


export const trackProductView =
  (productId: string) =>
    trackWebsiteEvent(
      'product_viewed',
      {
        productId,
      },
    );


export const trackProductQuickView =
  (productId: string) =>
    trackWebsiteEvent(
      'product_quick_viewed',
      {
        productId,
      },
    );


export const trackProductShared =
  (productId: string) =>
    trackWebsiteEvent(
      'product_shared',
      {
        productId,
      },
    );


export const trackAddToCart =
  (
    productId: string,
    quantity = 1,
  ) =>
    trackWebsiteEvent(
      'add_to_cart',
      {
        productId,
        quantity,
      },
    );


export const trackRemoveFromCart =
  (
    productId: string,
    quantity = 1,
  ) =>
    trackWebsiteEvent(
      'remove_from_cart',
      {
        productId,
        quantity,
      },
    );


export const trackWhatsAppPurchaseClicked =
  (
    productId: string,
    quantity = 1,
  ) =>
    trackWebsiteEvent(
      'whatsapp_purchase_clicked',
      {
        productId,
        quantity,
      },
    );



// ============================================================
// SMS RETURN / WELCOME
// ============================================================

export const trackSmsReturned =
  (
    metadata: Record<
      string,
      unknown
    > = {},
  ) =>
    trackWebsiteEvent(
      'sms_returned',
      {
        metadata,
      },
    );


export const trackWelcomeModalShown =
  (
    metadata: Record<
      string,
      unknown
    > = {},
  ) =>
    trackWebsiteEvent(
      'welcome_modal_shown',
      {
        metadata,
      },
    );


export const trackWelcomeModalDismissed =
  (
    metadata: Record<
      string,
      unknown
    > = {},
  ) =>
    trackWebsiteEvent(
      'welcome_modal_dismissed',
      {
        metadata,
      },
    );


export const trackWelcomeExploreProducts =
  () =>
    trackWebsiteEvent(
      'welcome_explore_products',
    );


export const trackWelcomeUseSpins =
  (
    spinsRemaining:
      number,
  ) =>
    trackWebsiteEvent(
      'welcome_use_spins',
      {
        metadata: {
          spins_remaining:
            spinsRemaining,
        },
      },
    );



// ============================================================
// CATALOGUE BEHAVIOUR
// ============================================================

export const trackSearchPerformed =
  (
    query: string,
    resultsCount: number,
  ) =>
    trackWebsiteEvent(
      'search_performed',
      {
        searchQuery:
          query,

        resultsCount,
      },
    );


export const trackCategorySelected =
  (
    categoryId: string,
    categoryName?: string,
  ) =>
    trackWebsiteEvent(
      'category_selected',
      {
        metadata: {
          category_id:
            categoryId,

          category_name:
            categoryName ??
            categoryId,
        },
      },
    );


export const trackSortChanged =
  (
    sortValue: string,
  ) =>
    trackWebsiteEvent(
      'sort_changed',
      {
        metadata: {
          sort:
            sortValue,
        },
      },
    );


export const trackPriceFilterChanged =
  (
    minimum: number,
    maximum: number,
  ) =>
    trackWebsiteEvent(
      'price_filter_changed',
      {
        metadata: {
          minimum,
          maximum,
        },
      },
    );



// ============================================================
// CART JOURNEY
// ============================================================

export const trackCartOpened =
  (
    source:
      string,
  ) =>
    trackWebsiteEvent(
      'cart_opened',
      {
        metadata: {
          source,
        },
      },
    );


export const trackCartQuantityChanged =
  (
    productId: string,
    quantity: number,
  ) =>
    trackWebsiteEvent(
      'cart_quantity_changed',
      {
        productId,

        quantity:
          Math.max(
            1,
            quantity,
          ),
      },
    );


export const trackCheckoutStarted =
  (
    totalUnits: number,
    productCount: number,
    cashOffApplied:
      boolean,
  ) =>
    trackWebsiteEvent(
      'checkout_started',
      {
        quantity:
          Math.max(
            1,
            totalUnits,
          ),

        metadata: {
          total_units:
            totalUnits,

          product_count:
            productCount,

          cash_off_applied:
            cashOffApplied,
        },
      },
    );



// ============================================================
// SPIN & SAVE
// ============================================================

export const trackSpinOpenedFromProduct =
  (
    productId: string,
  ) =>
    trackWebsiteEvent(
      'spin_opened_from_product',
      {
        productId,
      },
    );


export const trackSpinSaveOpened =
  (
    source:
      string,
    productId?:
      string | null,
  ) =>
    trackWebsiteEvent(
      'spin_save_opened',
      {
        productId:
          productId ??
          null,

        metadata: {
          source,
        },
      },
    );


export const trackSpinCompleted =
  (
    metadata: Record<
      string,
      unknown
    >,
  ) =>
    trackWebsiteEvent(
      'spin_completed',
      {
        metadata,
      },
    );


export const trackCashOffViewed =
  () =>
    trackWebsiteEvent(
      'cash_off_viewed',
    );



// ============================================================
// CASH-OFF PRODUCT SELECTION
// ============================================================

export const trackCashOffProductSelected =
  (
    productId: string,
  ) =>
    trackWebsiteEvent(
      'cash_off_product_selected',
      {
        productId,
      },
    );


export const trackCashOffProductChanged =
  (
    productId: string,
  ) =>
    trackWebsiteEvent(
      'cash_off_product_changed',
      {
        productId,
      },
    );


export const trackCashOffProductRemoved =
  (
    productId: string,
  ) =>
    trackWebsiteEvent(
      'cash_off_product_removed',
      {
        productId,
      },
    );



// ============================================================
// FULL WHEEL
// ============================================================

export const trackFullWheelOpened =
  (
    source:
      'overlay' |
      'cart',
  ) =>
    trackWebsiteEvent(
      source ===
        'overlay'
        ? 'full_wheel_opened_from_overlay'
        : 'full_wheel_opened_from_cart',
    );


export const trackReturnedFromFullWheel =
  () =>
    trackWebsiteEvent(
      'returned_from_full_wheel',
    );



// ============================================================
// REWARD
// ============================================================

export const trackRewardViewed =
  () =>
    trackWebsiteEvent(
      'reward_viewed',
    );


export const trackRewardApplied =
  () =>
    trackWebsiteEvent(
      'reward_applied',
    );



// ============================================================
// RECOMMENDATIONS
// Ready for the next step.
// ============================================================

export const trackRecommendationShown =
  (
    productIds:
      string[],
  ) =>
    trackWebsiteEvent(
      'recommendation_shown',
      {
        metadata: {
          product_ids:
            productIds,
        },
      },
    );


export const trackRecommendationClicked =
  (
    productId:
      string,
  ) =>
    trackWebsiteEvent(
      'recommendation_clicked',
      {
        productId,
      },
    );


export const trackRecommendationDismissed =
  (
    productIds:
      string[],
  ) =>
    trackWebsiteEvent(
      'recommendation_dismissed',
      {
        metadata: {
          product_ids:
            productIds,
        },
      },
    );



// ============================================================
// SECURE FULL-WHEEL HANDOFF
// ============================================================

export async function openSpinWheelFromProduct(
  productId:
    string,
): Promise<void> {

  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }


  const wheelUrl =
    process.env
      .NEXT_PUBLIC_SPIN_WHEEL_URL;


  if (!wheelUrl) {
    throw new Error(
      'The Spin & Save wheel is not configured.',
    );
  }


  const visitorId =
    await registerVisitor();


  if (!visitorId) {
    throw new Error(
      'We could not prepare your wheel session.',
    );
  }


  await trackSpinOpenedFromProduct(
    productId,
  );


  const {
    data: handoffToken,
    error,
  } =
    await trackingSupabase.rpc(
      'create_website_wheel_handoff',
      {
        p_visitor_id:
          visitorId,

        p_product_id:
          productId,

        p_source_path:
          window.location.pathname,
      },
    );


  if (
    error ||
    !handoffToken
  ) {
    throw new Error(
      'We could not securely connect your account to the wheel.',
    );
  }


  const destination =
    new URL(
      wheelUrl,
    );


  destination.searchParams.set(
    'handoff',
    handoffToken,
  );


  window.location.assign(
    destination.toString(),
  );
}



export async function createFullWheelUrl(
  productId?:
    string | null,
): Promise<string> {

  if (
    typeof window ===
    'undefined'
  ) {
    throw new Error(
      'The wheel is only available in your browser.',
    );
  }


  const wheelUrl =
    process.env
      .NEXT_PUBLIC_SPIN_WHEEL_URL;


  if (!wheelUrl) {
    throw new Error(
      'The full Spin & Save website is not configured.',
    );
  }


  const visitorId =
    await registerVisitor();


  if (!visitorId) {
    throw new Error(
      'We could not prepare your wheel session.',
    );
  }


  const {
    data,
    error,
  } =
    await trackingSupabase.rpc(
      'create_website_wheel_handoff',
      {
        p_visitor_id:
          visitorId,

        p_product_id:
          productId ||
          null,

        p_source_path:
          window.location.pathname,
      },
    );


  if (
    error ||
    !data
  ) {
    throw new Error(
      'We could not securely connect to the full wheel. Please retry.',
    );
  }


  const destination =
    new URL(
      wheelUrl,
    );


  destination.search =
    '';


  destination.searchParams.set(
    'handoff',
    String(data),
  );


  return destination.toString();
}



// ============================================================
// QUOTE LEAD
// ============================================================

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

  const visitorId =
    getVisitorId();


  if (!visitorId) {
    return null;
  }


  const {
    data,
    error,
  } =
    await trackingSupabase.rpc(
      'create_quote_lead',
      {
        p_visitor_id:
          visitorId,

        p_product_id:
          productId,

        p_full_name:
          fullName,

        p_phone:
          phone,

        p_email:
          email ||
          null,

        p_notes:
          notes ||
          null,

        p_source_page:
          typeof window ===
            'undefined'
            ? null
            : window.location.pathname,
      },
    );


  if (error) {
    throw error;
  }


  return data;
}
