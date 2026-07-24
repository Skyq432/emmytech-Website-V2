"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import "./products.css";
import "./cart-polish.css";
import "./wheel-overlay-polish.css";
import SpinSaveOverlay from "./SpinSaveOverlay";
import {
  ShoppingCart,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  Star,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Package,
  Zap,
  Laptop,
  Smartphone,
  Sun,
  Headphones,
  Cable,
  Gamepad2,
  Watch,
  Loader2,
  AlertCircle,
  Share2,
  ExternalLink,
} from "lucide-react";
import CTA from "@/components/CTA";
import { brand } from "@/lib/site-data";
import {
  trackingSupabase as supabase,
  registerVisitor,
  trackAddToCart,
  trackPageViewed,
  trackProductQuickView,
  trackProductShared,
  trackProductView,
  trackRemoveFromCart,
  trackWebsiteVisited,
  trackWhatsAppPurchaseClicked,
  createFullWheelUrl,
  getVisitorId,
  trackCashOffProductChanged,
  trackCashOffProductRemoved,
  trackCashOffProductSelected,
  trackFullWheelOpened,
  trackReturnedFromFullWheel,
} from "@/lib/tracking";

async function callWheelApi<T>(operation: "bootstrap" | "state" | "spin", params: Record<string, unknown>) {
  const response = await fetch("/api/wheel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, params }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "The wheel service is unavailable.");
  return payload.data as T;
}

interface ProductImage {
  id?: string;
  image_url: string;
  image_path?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  original_price?: number;
  discount?: number;
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  specs: Record<string, string>;
  description: string;
  tags: string[];
  featured: boolean;
  created_at?: string;
}

interface GalleryCacheEntry {
  images: string[];
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categoryConfig: Record<string, { name: string; icon: React.ReactNode }> = {
  all: { name: "All Products", icon: <Package size={16} /> },
  laptops: { name: "Laptops", icon: <Laptop size={16} /> },
  phones: { name: "Phones", icon: <Smartphone size={16} /> },
  solar: { name: "Solar", icon: <Sun size={16} /> },
  accessories: { name: "Accessories", icon: <Headphones size={16} /> },
  cables: { name: "Cables", icon: <Cable size={16} /> },
  gaming: { name: "Gaming", icon: <Gamepad2 size={16} /> },
  smartwatch: { name: "Smart Watch", icon: <Watch size={16} /> },
  cctv: { name: "CCTV", icon: <Package size={16} /> },
  networking: { name: "Networking", icon: <Cable size={16} /> },
  printers: { name: "Printers", icon: <Package size={16} /> },
  "biometric-devices": { name: "Biometric Devices", icon: <Package size={16} /> },
};

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "rating", label: "Highest Rated" },
];

const PLACEHOLDER_IMAGE = "";
const PAGE_SIZE = 12;
const CASH_OFF_SELECTION_KEY = "emmy_cash_off_product";
const WHEEL_SESSION_KEY = "emmy_wheel_session";
const REWARD_PROFILE_KEY = "emmy_reward_profile_connected";

interface CashChallengeState {
  id?: string;
  status?: "not_started" | "active" | "converted_to_cash_off" | "cash_eligible" | "closed";
  started_at?: string;
  expires_at?: string;
  cash_balance?: number;
  cash_target?: number;
  cash_cap?: number;
  conversion_floor?: number;
  seconds_remaining?: number;
  progress_percent?: number;
  amount_to_cash_target?: number;
  converted_cash_off_amount?: number;
  active?: boolean;
  cash_eligible?: boolean;
  converted_to_cash_off?: boolean;
}

interface WheelState {
  server_now?: string;
  cash_off_balance: number;
  cash_challenge?: CashChallengeState;
  spin_player?: { spins_remaining?: number; wallet_balance?: number; last_prize_won?: string; cashout_target?: number; spin_sequence_step?: number; cashout_eligible?: boolean };
  active_prizes?: Array<{ id?: string; label?: string; monetary_value?: number }>;
  awarded_prizes?: Array<{ id?: string; prize_label?: string; result_label?: string; status?: string; created_at?: string }>;
}

interface WheelSpinResult {
  label?: string;
  result_type?: string;
  cash_amount?: number;
  cash_challenge_credit?: number;
  cash_challenge_before?: number;
  cash_challenge_after?: number;
  cash_challenge_expires_at?: string;
  cash_challenge_started?: boolean;
  cash_challenge_capped_amount?: number;
  cash_off_amount?: number;
  cash_off_after?: number;
  spin_log_id?: string;
}

const formatRewardMoney = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const challengeSecondsLeft = (challenge: CashChallengeState | undefined, now: number) => {
  if (!challenge?.active || !challenge.expires_at) return 0;
  return Math.max(0, Math.floor((new Date(challenge.expires_at).getTime() - now) / 1000));
};

const formatChallengeTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
};

const cleanPrizeLabel = (label?: string) =>
  (label || "Reward").replace(/^(demo|test)\s+/i, "").trim();

const wheelSegmentLabel = (label?: string) =>
  cleanPrizeLabel(label)
    .replace(/\s+cash[ -]?off$/i, " Cash")
    .replace(/bonus spin/i, "Bonus")
    .replace(/try again/i, "Retry");

const formatPrice = (price: number) => {
  if (!price || price <= 0) return "Request Quote";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

const extractWhatsAppNumber = (whatsappValue: string): string => {
  const waMe = whatsappValue.match(/wa\.me\/(\d+)/);
  if (waMe) return waMe[1];
  return whatsappValue.replace(/\D/g, "");
};

const buildCartWhatsAppUrl = (
  cart: CartItem[],
  whatsappValue: string,
  selectedCashOffProductId: string | null,
  cashOffBalance: number,
): string => {
  const phone = extractWhatsAppNumber(whatsappValue);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedItem = selectedCashOffProductId
    ? cart.find((item) => item.id === selectedCashOffProductId) || null
    : null;
  const selectedSubtotal = selectedItem
    ? selectedItem.price * selectedItem.quantity
    : 0;
  const cashOffRequested = selectedItem
    ? Math.min(Math.max(0, cashOffBalance), selectedSubtotal)
    : 0;
  const estimatedTotal = Math.max(0, total - cashOffRequested);

  const lines = [
    "🛒 *New Order — Emmy Technology*",
    "",
    ...cart.map((item, index) => {
      const subtotal = item.price * item.quantity;
      const isCashOffItem = item.id === selectedCashOffProductId && cashOffRequested > 0;
      const itemCashOff = isCashOffItem ? cashOffRequested : 0;
      const estimatedItemTotal = Math.max(0, subtotal - itemCashOff);

      return [
        `${index + 1}. *${item.name}*`,
        `   Qty: ${item.quantity} × ${formatPrice(item.price)}`,
        `   Subtotal: ${formatPrice(subtotal)}`,
        ...(isCashOffItem
          ? [
              `   Cash-Off requested: -${formatRewardMoney(itemCashOff)}`,
              `   Estimated item total: ${formatPrice(estimatedItemTotal)}`,
            ]
          : []),
      ].join("\n");
    }),
    "",
    `*Order subtotal: ${formatPrice(total)}*`,
    ...(cashOffRequested > 0
      ? [
          `*Cash-Off requested: -${formatRewardMoney(cashOffRequested)}*`,
          `*Estimated order total: ${formatPrice(estimatedTotal)}*`,
          "Cash-Off should be verified and applied when the order is confirmed.",
        ]
      : ["No Cash-Off has been selected for this order."]),
    "",
    "Please confirm availability, Cash-Off eligibility and delivery details. Thank you!",
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
};

const buildSingleProductWhatsAppUrl = (product: Product, whatsappValue: string): string => {
  const phone = extractWhatsAppNumber(whatsappValue);

  const lines = [
    "🛍️ *Product Enquiry — Emmy Technology*",
    "",
    `*${product.name}*`,
    `Category: ${product.subcategory || product.category}`,
    `Price: ${formatPrice(product.price)}`,
    ...(product.original_price && product.original_price > product.price
      ? [`Original Price: ${formatPrice(product.original_price)}`]
      : []),
    ...(product.discount && product.discount > 0 ? [`Discount: ${product.discount}%`] : []),
    "",
    "I'm interested in this product. Please confirm availability and delivery details.",
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
};

const safeImage = (value?: string | null) => {
  if (!value || !value.trim()) return PLACEHOLDER_IMAGE;
  return value;
};

const titleCase = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const mapProduct = (row: any): Product => {
  const categorySlug =
    row.product_categories?.slug ||
    row.category ||
    "accessories";

  const categoryName =
    row.product_categories?.name ||
    titleCase(categorySlug);

  const gallery = [row.image_url].filter(Boolean) as string[];

  const salePrice = Number(row.sale_price || row.price || 0);
  const originalPrice = Number(row.original_price || 0);
  const discount = Number(row.discount_percentage || row.discount || 0);

  const specs: Record<string, string> = {
    Category: categoryName,
    Stock: String(Number(row.stock || 0)),
    Status: row.status || "active",
  };

  if (row.product_tag) specs.Tag = row.product_tag;
  if (discount > 0) specs.Discount = `${discount}%`;

  return {
    id: String(row.id || ""),
    name: row.name || "Unnamed Product",
    category: categorySlug,
    subcategory: categoryName,
    price: salePrice,
    original_price: originalPrice > salePrice ? originalPrice : undefined,
    discount: discount > 0 ? discount : undefined,
    image: safeImage(gallery[0]),
    gallery: gallery.length ? gallery.map(safeImage) : [PLACEHOLDER_IMAGE],
    rating: Number(row.rating || 4.8),
    reviews: Number(row.reviews || 0),
    stock: Number(row.stock || 0),
    badge: row.product_tag || (row.featured ? "Featured Product" : undefined),
    specs,
    description:
      row.description ||
      "Quality technology product available from Emmy Technology.",
    tags: [
      row.name || "",
      row.product_tag || "",
      categoryName,
      categorySlug,
      row.description || "",
    ].filter(Boolean),
    featured: Boolean(row.featured),
    created_at: row.created_at,
  };
};

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 size={40} className="animate-spin text-[var(--primary)]" />
      <p className="text-[var(--muted)] font-medium">Loading products...</p>
    </div>
  );
}

function OptimizedProductImage({
  src,
  alt,
  className,
  sizes,
  quality = 63,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
  quality?: number;
}) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => setFailed(!src), [src]);

  if (failed) {
    return (
      <div className={`${className} product-image-placeholder`} role="img" aria-label={`${alt} image unavailable`}>
        <Package size={28} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
      <AlertCircle size={48} className="text-red-400" />
      <h3 className="text-lg font-bold text-[var(--ink)]">Something went wrong</h3>
      <p className="text-[var(--muted)] max-w-md">{message}</p>
      <button className="btn primary" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="product-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            className={star <= Math.floor(rating) ? "star-filled" : "star-empty"}
            fill={star <= Math.floor(rating) ? "currentColor" : "none"}
          />
        ))}
      </div>
      <span className="rating-text">
        {rating} ({reviews})
      </span>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onProductView,
  onQuickView,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductView: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="product-card-ecom">
      <div className="product-card-image-wrapper" onClick={() => onProductView(product)}>
        <div className="product-card-image">
          <OptimizedProductImage
            src={product.image}
            alt={product.name}
            className="product-img"
            sizes="(max-width: 380px) 100vw, (max-width: 900px) 50vw, (max-width: 1060px) 33vw, 25vw"
          />
        </div>

        {product.badge && <span className="product-badge">{product.badge}</span>}

        {product.discount && product.discount > 0 && (
          <span className="product-discount-badge">-{product.discount}%</span>
        )}

        <button
          className={`product-wishlist-btn ${isLiked ? "liked" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>

        <div className="product-card-actions" onClick={(event) => event.stopPropagation()}>
          <button className="product-action-btn" onClick={() => onQuickView(product)}>
            Quick View
          </button>
          <button
            className="product-action-btn primary"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.subcategory || product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <StarRating rating={product.rating} reviews={product.reviews} />

        <div className="product-card-price-row">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="product-card-original">{formatPrice(product.original_price)}</span>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <span className="product-stock-low">Only {product.stock} left</span>
        )}
        {product.stock === 0 && <span className="product-stock-out">Out of Stock</span>}

        <button
          className="card-add-to-cart-btn"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={15} />
          <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}

function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  gallery,
  galleryLoading,
  galleryError,
  onShare,
  onWhatsApp,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  gallery: string[];
  galleryLoading: boolean;
  galleryError: string | null;
  onShare: (product: Product) => void;
  onWhatsApp: (product: Product) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const [activeImage, setActiveImage] = useState<string>(PLACEHOLDER_IMAGE);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setActiveTab("description");
      setActiveImage(product.image);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const canIncrease = product.stock === 0 ? false : quantity < product.stock;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-grid">
          <div className="modal-image">
            <OptimizedProductImage
              src={activeImage}
              alt={product.name}
              className="modal-img"
              sizes="(max-width: 1060px) 100vw, 450px"
              quality={65}
            />

            {product.discount && product.discount > 0 && (
              <span className="modal-discount">-{product.discount}%</span>
            )}

            {galleryLoading && (
              <div className="gallery-loading"><Loader2 size={18} className="animate-spin" /> Loading gallery...</div>
            )}
            {galleryError && <div className="gallery-error">{galleryError}</div>}
            {!galleryLoading && gallery.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  zIndex: 4,
                }}
              >
                {gallery.map((image) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(image)}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 12,
                      overflow: "hidden",
                      border:
                        activeImage === image
                          ? "2px solid var(--product-secondary)"
                          : "2px solid rgba(255,255,255,0.75)",
                      padding: 0,
                      background: "#fff",
                      cursor: "pointer",
                      flex: "0 0 auto",
                      position: "relative",
                    }}
                  >
                    <OptimizedProductImage
                      src={image}
                      alt={product.name}
                      className="modal-thumbnail-img"
                      sizes="54px"
                      quality={60}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="modal-details">
            <span className="modal-category">{product.subcategory || product.category}</span>
            <h2 className="modal-title">{product.name}</h2>
            <StarRating rating={product.rating} reviews={product.reviews} />

            <div className="modal-price-row">
              <span className="modal-price">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="modal-original">{formatPrice(product.original_price)}</span>
              )}
            </div>

            <p className="modal-description">{product.description}</p>

            <div className="modal-tabs">
              <button
                className={activeTab === "description" ? "active" : ""}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={activeTab === "specs" ? "active" : ""}
                onClick={() => setActiveTab("specs")}
              >
                Specifications
              </button>
            </div>

            {activeTab === "description" ? (
              <p className="modal-description">{product.description}</p>
            ) : (
              <div className="modal-specs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-key">{key}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-quantity">
              <span>Quantity:</span>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => canIncrease && setQuantity(quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn primary modal-add"
                onClick={() => {
                  if (product.stock === 0) return;
                  for (let i = 0; i < quantity; i += 1) onAddToCart(product);
                }}
                disabled={product.stock === 0}
              >
                <ShoppingCart size={16} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <a
                href={buildSingleProductWhatsAppUrl(product, brand.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn secondary modal-whatsapp"
                onClick={() => onWhatsApp(product)}
              >
                <Zap size={16} />
                Buy on WhatsApp
              </a>
              <button className="btn ghost" onClick={() => onShare(product)}>
                <Share2 size={16} />
                Share Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onWhatsApp,
  cashOffBalance,
  selectedCashOffProductId,
  onCashOffToggle,
  onOpenFullWheel,
  fullWheelBusy,
  fullWheelError,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onWhatsApp: (cart: CartItem[]) => void;
  cashOffBalance: number;
  selectedCashOffProductId: string | null;
  onCashOffToggle: (id: string) => void;
  onOpenFullWheel: () => void;
  fullWheelBusy: boolean;
  fullWheelError: string | null;
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCashOffItem = selectedCashOffProductId
    ? cart.find((item) => item.id === selectedCashOffProductId) || null
    : null;
  const selectedCashOffSubtotal = selectedCashOffItem
    ? selectedCashOffItem.price * selectedCashOffItem.quantity
    : 0;
  const cashOffRequested = selectedCashOffItem
    ? Math.min(Math.max(0, cashOffBalance), selectedCashOffSubtotal)
    : 0;
  const estimatedTotal = Math.max(0, total - cashOffRequested);
  const checkoutUrl =
    cart.length > 0
      ? buildCartWhatsAppUrl(
          cart,
          brand.whatsapp,
          selectedCashOffProductId,
          cashOffBalance,
        )
      : "#";

  return (
    <>
      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>
            <ShoppingCart size={18} />
            Cart ({itemCount})
          </h3>
          <button className="cart-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={44} className="cart-empty-icon" />
            <p>Your cart is empty</p>
            <span>Add some products to get started</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className={`cart-item ${selectedCashOffProductId === item.id ? "cash-off-selected" : ""}`}>
                  <div className="cart-item-image">
                    <OptimizedProductImage
                      src={item.image}
                      alt={item.name}
                      className="cart-img"
                      sizes="68px"
                      quality={60}
                    />
                  </div>

                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-actions">
                      <div className="quantity-control small">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="cart-remove" onClick={() => onRemove(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cash-off-toggle"
                      aria-pressed={selectedCashOffProductId === item.id}
                      onClick={() => onCashOffToggle(item.id)}
                      disabled={cashOffBalance <= 0}
                    >
                      <span>
                        <strong>{selectedCashOffProductId === item.id ? "Cash-Off selected" : "Use Cash-Off"}</strong>
                        <small>{selectedCashOffProductId === item.id ? "Tap to remove" : `${formatRewardMoney(cashOffBalance)} available`}</small>
                      </span>
                      <span className="cash-off-check">{selectedCashOffProductId === item.id ? <Check size={13} /> : null}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-order-summary">
                <div className="cart-subtotal">
                  <span>Order subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {cashOffRequested > 0 ? (
                  <>
                    <div className="cart-cashoff-line">
                      <span>Cash-Off requested</span>
                      <strong>−{formatRewardMoney(cashOffRequested)}</strong>
                    </div>
                    <div className="cart-estimated-total">
                      <span>Estimated total</span>
                      <strong>{formatPrice(estimatedTotal)}</strong>
                    </div>
                    <small>
                      Applied only after EmmyTech confirms the order and reward eligibility.
                    </small>
                  </>
                ) : (
                  <small>Cash-Off is available but not applied to this order.</small>
                )}
              </div>
              <div className="cart-wheel-summary">
                <span><Zap size={15} /> Available Cash-Off <strong>{formatRewardMoney(cashOffBalance)}</strong></span>
                <button className="cart-full-wheel-link" onClick={onOpenFullWheel} disabled={fullWheelBusy}>
                  {fullWheelBusy ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
                  Open full wheel
                </button>
                {fullWheelError && <small role="alert">{fullWheelError}</small>}
              </div>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn primary cart-checkout" onClick={() => onWhatsApp(cart)}>
                <ShoppingCart size={16} />
                Continue to checkout
              </a>
              <button className="btn ghost cart-continue" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Products", icon: <Package size={16} /> },
  ]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewGallery, setQuickViewGallery] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [spinProductId, setSpinProductId] = useState<string | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelState, setWheelState] = useState<WheelState | null>(null);
  const [wheelLoading, setWheelLoading] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelSpinResult, setWheelSpinResult] = useState<WheelSpinResult | null>(null);
  const [wheelSpinTarget, setWheelSpinTarget] = useState<WheelSpinResult | null>(null);
  const [selectedCashOffProductId, setSelectedCashOffProductId] = useState<string | null>(null);
  const [fullWheelBusy, setFullWheelBusy] = useState(false);
  const [fullWheelError, setFullWheelError] = useState<string | null>(null);
  const [rewardProfileReady, setRewardProfileReady] = useState(false);
  const [rewardProfileBusy, setRewardProfileBusy] = useState(false);
  const [challengeClock, setChallengeClock] = useState(() => Date.now());
  const challengeExpiryRefreshRef = useRef<string | null>(null);
  const galleryCache = useRef<Map<string, GalleryCacheEntry>>(new Map());
  const galleryRequestSequence = useRef(0);
  const requestSequence = useRef(0);

  const [controlBarVisible, setControlBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);
  const wheelLauncherRef = useRef<HTMLButtonElement>(null);

  const refreshWheelState = useCallback(async () => {
    const token = window.localStorage.getItem(WHEEL_SESSION_KEY);
    if (!token) return null;
    try {
      const data = await callWheelApi<WheelState>("state", { p_session_token: token });
      setWheelState(data);
      return data;
    } catch (error) {
      window.localStorage.removeItem(WHEEL_SESSION_KEY);
      throw error;
    }
  }, []);

  const ensureWheelState = useCallback(async () => {
    try {
      const existing = await refreshWheelState();
      if (existing) return existing;
    } catch (error) {
      console.warn("Stored wheel session could not be refreshed.", error);
    }
    const visitorId = getVisitorId();
    if (!visitorId) throw new Error("We could not prepare your reward session.");
    const data = await callWheelApi<{ wheel_session_token: string; state: WheelState }>("bootstrap", {
      p_visitor_id: visitorId, p_full_name: null, p_phone: null, p_email: null, p_referral_code: null,
    });
    if (!data?.wheel_session_token) throw new Error("Reward session unavailable.");
    window.localStorage.setItem(WHEEL_SESSION_KEY, data.wheel_session_token);
    setWheelState(data.state as WheelState);
    return data.state as WheelState;
  }, [refreshWheelState]);

  useEffect(() => {
    setRewardProfileReady(window.localStorage.getItem(REWARD_PROFILE_KEY) === "1");
    const stored = window.localStorage.getItem(CASH_OFF_SELECTION_KEY);
    if (stored) setSelectedCashOffProductId(stored);
    void ensureWheelState().catch((error) => console.warn("Wheel preload failed.", error));
    const onVisible = () => {
      if (document.visibilityState !== "visible" || !window.sessionStorage.getItem("emmy_full_wheel_open")) return;
      window.sessionStorage.removeItem("emmy_full_wheel_open");
      void refreshWheelState().catch((error) => console.warn("Wheel return refresh failed.", error));
      void trackReturnedFromFullWheel();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => { document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onVisible); };
  }, [ensureWheelState, refreshWheelState]);

  const registerRewardProfile = useCallback(async (profile: { fullName: string; phone: string; email: string }) => {
    setRewardProfileBusy(true);
    setSpinError(null);
    try {
      const visitorId = getVisitorId();
      if (!visitorId) throw new Error("We could not identify this browser. Please refresh and retry.");
      const data = await callWheelApi<{ wheel_session_token: string; state: WheelState }>("bootstrap", {
        p_visitor_id: visitorId,
        p_full_name: profile.fullName,
        p_phone: profile.phone,
        p_email: profile.email,
        p_referral_code: null,
      });
      if (!data?.wheel_session_token) throw new Error("Your Cash-Off account could not be connected.");
      window.localStorage.setItem(WHEEL_SESSION_KEY, data.wheel_session_token);
      window.localStorage.setItem(REWARD_PROFILE_KEY, "1");
      setWheelState(data.state as WheelState);
      setRewardProfileReady(true);
    } catch (error) {
      setSpinError(error instanceof Error ? error.message : "Your Cash-Off account could not be connected.");
    } finally {
      setRewardProfileBusy(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setChallengeClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const challenge = wheelState?.cash_challenge;
    if (!challenge?.active || !challenge.expires_at) {
      challengeExpiryRefreshRef.current = null;
      return;
    }
    const seconds = challengeSecondsLeft(challenge, challengeClock);
    if (seconds > 0 || challengeExpiryRefreshRef.current === challenge.id) return;
    challengeExpiryRefreshRef.current = challenge.id || challenge.expires_at;
    void refreshWheelState().catch((error) =>
      console.warn("Challenge expiry refresh failed.", error),
    );
  }, [challengeClock, refreshWheelState, wheelState?.cash_challenge]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTicking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY < 120 || currentY < lastScrollY.current) {
            setControlBarVisible(true);
          } else if (currentY > lastScrollY.current + 6) {
            setControlBarVisible(false);
            setShowFilters(false);
          }
          lastScrollY.current = currentY;
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("slug,name")
        .order("name", { ascending: true });

      if (!data) return;
      setCategories([
        { id: "all", name: "All Products", icon: <Package size={16} /> },
        ...data.map((category) => ({
          id: category.slug,
          name: category.name,
          icon: categoryConfig[category.slug]?.icon || <Package size={16} />,
        })),
      ]);
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode =
      params.get("ref") ||
      params.get("code") ||
      params.get("ambassador") ||
      localStorage.getItem("emmy_referral_code");

    if (referralCode) {
      localStorage.setItem("emmy_referral_code", referralCode);
    }

    void registerVisitor(referralCode).then((visitorId) => {
      if (!visitorId) return;
      void trackWebsiteVisited();
      void trackPageViewed();
    });
  }, []);

  const fetchProducts = useCallback(async (append = false) => {
    const requestId = ++requestSequence.current;
    const from = append ? products.length : 0;
    const to = from + PAGE_SIZE - 1;

    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("products")
        .select(`id,name,price,sale_price,original_price,discount_percentage,image_url,category,category_id,stock,featured,product_tag,created_at,product_categories(name,slug)`, { count: "exact" })
        .eq("status", "active");

      if (activeCategory !== "all") query = query.eq("category", activeCategory);
      if (debouncedSearch) {
        const safeTerm = debouncedSearch.replace(/[,%().]/g, " ");
        query = query.or(`name.ilike.%${safeTerm}%,product_tag.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%,category.ilike.%${safeTerm}%`);
      }
      if (priceRange[0] > 0) query = query.gte("price", priceRange[0]);
      if (priceRange[1] < 10000000) query = query.lte("price", priceRange[1]);

      if (sortBy === "price-low") query = query.order("price", { ascending: true });
      else if (sortBy === "price-high") query = query.order("price", { ascending: false });
      else if (sortBy === "newest") query = query.order("created_at", { ascending: false });
      else query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });

      const { data, error: supaError, count } = await query.range(from, to);

      if (supaError) throw new Error(supaError.message);
      if (requestId !== requestSequence.current) return;

      const mapped = (data || []).map(mapProduct);
      setProducts((current) => {
        if (!append) return mapped;
        const byId = new Map(current.map((product) => [product.id, product]));
        mapped.forEach((product) => byId.set(product.id, product));
        return Array.from(byId.values());
      });
      const total = count || 0;
      setTotalProducts(total);
      setHasMore(from + mapped.length < total);
    } catch (err: any) {
      if (requestId !== requestSequence.current) return;
      setError(err.message || "Failed to load products");
      console.error("Supabase fetch error:", err);
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeCategory, debouncedSearch, priceRange, products.length, sortBy]);

  useEffect(() => {
    void fetchProducts(false);
    // products.length changes after each page; it must not reset the active query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, debouncedSearch, priceRange, sortBy]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock === 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    trackAddToCart(product.id, 1);
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        setCart((prev) => {
          const removed = prev.find((item) => item.id === id);
          if (removed) void trackRemoveFromCart(removed.id, removed.quantity);
          return prev.filter((item) => item.id !== id);
        });
        return;
      }

      setCart((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return { ...item, quantity: Math.min(qty, item.stock || qty) };
        })
      );
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) void trackRemoveFromCart(removed.id, removed.quantity);
      return prev.filter((item) => item.id !== id);
    });
    if (selectedCashOffProductId === id) {
      setSelectedCashOffProductId(null);
      window.localStorage.removeItem(CASH_OFF_SELECTION_KEY);
      void trackCashOffProductRemoved(id);
    }
  }, [selectedCashOffProductId]);

  const openProductModal = useCallback(async (product: Product, eventType: "view" | "quick_view") => {
    const galleryRequestId = ++galleryRequestSequence.current;
    setQuickViewProduct(product);
    setShowQuickView(true);
    setQuickViewGallery([product.image].filter(Boolean));
    setGalleryError(null);
    if (eventType === "view") void trackProductView(product.id);
    else void trackProductQuickView(product.id);

    const cached = galleryCache.current.get(product.id);
    if (cached) {
      setGalleryLoading(false);
      setQuickViewGallery(cached.images);
      setQuickViewProduct({ ...product, description: cached.description });
      return;
    }

    setGalleryLoading(true);
    const [detailsResult, imagesResult] = await Promise.all([
      supabase.from("products").select("description").eq("id", product.id).single(),
      supabase
        .from("product_images")
        .select("image_url,is_primary,sort_order")
        .eq("product_id", product.id)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true }),
    ]);

    if (galleryRequestId !== galleryRequestSequence.current) return;

    if (imagesResult.error || detailsResult.error) {
      setGalleryError("Some product details could not be loaded.");
      setGalleryLoading(false);
      return;
    }

    const images = [product.image, ...(imagesResult.data || []).map((image) => image.image_url)]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index);
    const entry = {
      images,
      description: detailsResult.data?.description || product.description,
    };
    galleryCache.current.set(product.id, entry);
    setQuickViewGallery(entry.images);
    setQuickViewProduct({ ...product, description: entry.description });
    setGalleryLoading(false);
  }, []);

  const openProductView = useCallback(
    (product: Product) => void openProductModal(product, "view"),
    [openProductModal],
  );

  const openQuickView = useCallback(
    (product: Product) => void openProductModal(product, "quick_view"),
    [openProductModal],
  );

  const shareProduct = useCallback(async (product: Product) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard.writeText(url);
      void trackProductShared(product.id);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") console.warn("Product sharing failed.", error);
    }
  }, []);

  const trackCartWhatsApp = useCallback((items: CartItem[]) => {
    items.forEach((item) => void trackWhatsAppPurchaseClicked(item.id, item.quantity));
  }, []);

  const openSpinWheel = useCallback(async (product?: Product) => {
    setSpinProductId(product?.id || null);
    setSpinError(null);
    setWheelSpinResult(null);
    setWheelSpinTarget(null);
    setWheelOpen(true);
    setWheelLoading(true);
    try {
      await ensureWheelState();
    } catch (error) {
      console.warn('Spin & Save overlay failed.', error);
      setSpinError(error instanceof Error ? error.message : 'Your rewards are unavailable right now. Please retry.');
    } finally {
      setWheelLoading(false);
      setSpinProductId(null);
    }
  }, [ensureWheelState]);

  const spinNativeWheel = useCallback(async () => {
    const token = window.localStorage.getItem(WHEEL_SESSION_KEY);
    if (!token) return void openSpinWheel();
    setWheelSpinning(true);
    setSpinError(null);
    try {
      const data = await callWheelApi<{ result?: WheelSpinResult; state?: WheelState } & WheelState>("spin", {
        p_session_token: token, p_request_id: window.crypto.randomUUID(),
      });
      const nextResult = (data?.result || null) as WheelSpinResult | null;
      setWheelSpinTarget(nextResult);
      await new Promise((resolve) => window.setTimeout(resolve, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 350 : 6000));
      setWheelState((data?.state || data) as WheelState);
      setWheelSpinResult(nextResult);
    } catch (error) {
      setSpinError(error instanceof Error ? error.message : "The spin could not be completed. Please retry.");
    } finally { setWheelSpinning(false); }
  }, [openSpinWheel]);

  const closeSpinWheel = useCallback(() => {
    setWheelOpen(false);
    window.requestAnimationFrame(() => wheelLauncherRef.current?.focus());
  }, []);

  const viewCartFromWheel = useCallback(() => {
    setWheelOpen(false);
    setIsCartOpen(true);
  }, []);

  const openFullWheel = useCallback(async (source: "overlay" | "cart") => {
    setFullWheelBusy(true);
    setFullWheelError(null);
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      tab.opener = null;
      tab.document.title = "Opening Spin & Save…";
      tab.document.body.textContent = "Securely opening Spin & Save…";
    }
    try {
      if (!tab) throw new Error("Your browser blocked the new tab. Allow pop-ups and retry.");
      await ensureWheelState();
      const destination = await createFullWheelUrl(spinProductId);
      tab.location.replace(destination);
      window.sessionStorage.setItem("emmy_full_wheel_open", "1");
      void trackFullWheelOpened(source);
    } catch (error) {
      tab?.close();
      setFullWheelError(error instanceof Error ? error.message : "The full wheel could not be opened. Please retry.");
    } finally { setFullWheelBusy(false); }
  }, [ensureWheelState, spinProductId]);

  const toggleCashOff = useCallback((productId: string) => {
    if (selectedCashOffProductId === productId) {
      setSelectedCashOffProductId(null);
      window.localStorage.removeItem(CASH_OFF_SELECTION_KEY);
      void trackCashOffProductRemoved(productId);
      return;
    }
    if (selectedCashOffProductId && !window.confirm("Move Cash-Off to this product?")) return;
    const changed = Boolean(selectedCashOffProductId);
    setSelectedCashOffProductId(productId);
    window.localStorage.setItem(CASH_OFF_SELECTION_KEY, productId);
    void (changed ? trackCashOffProductChanged(productId) : trackCashOffProductSelected(productId));
  }, [selectedCashOffProductId]);

  const closeQuickView = useCallback(() => {
    galleryRequestSequence.current += 1;
    setShowQuickView(false);
    setGalleryLoading(false);
    setTimeout(() => setQuickViewProduct(null), 250);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const launcherSpins = Number(wheelState?.spin_player?.spins_remaining || 0);
  const launcherCashOff = Number(wheelState?.cash_off_balance || 0);
  const launcherChallenge = wheelState?.cash_challenge;
  const launcherChallengeSeconds = challengeSecondsLeft(launcherChallenge, challengeClock);
  const launcherChallengeCash = Number(launcherChallenge?.cash_balance || 0);
  const launcherRewardCopy = launcherChallenge?.active
    ? `${formatChallengeTime(launcherChallengeSeconds)} · ${formatRewardMoney(launcherChallengeCash)} cash`
    : launcherChallenge?.cash_eligible
      ? `${formatRewardMoney(launcherChallengeCash)} cash ready`
      : launcherChallenge?.converted_to_cash_off
        ? `${formatRewardMoney(Number(launcherChallenge.converted_cash_off_amount || 0))} converted`
        : launcherCashOff > 0
          ? `${formatRewardMoney(launcherCashOff)} Cash-Off`
          : launcherSpins > 0
            ? `${launcherSpins} spin${launcherSpins === 1 ? "" : "s"} ready`
            : "Tap to play";

  return (
    <main className="products-page">
      <section className="products-hero">
        <div className="products-hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>

        <div className="section-shell products-hero-content">
          <span className="products-hero-eyebrow">
            <Package size={13} />
            Emmy Tech Store
          </span>

          <h1 className="products-hero-title">
            Find the perfect <span>tech</span> for you.
          </h1>

          <p className="products-hero-desc">
            Laptops, phones, solar solutions, accessories — all in one place with the best prices in Ibadan.
          </p>

          <div className="products-hero-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search laptops, phones, solar panels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="products-hero-stats">
            <div className="hero-stat">
              <strong>{totalProducts}+</strong>
              <span>Products</span>
            </div>
            <div className="hero-stat">
              <strong>{Math.max(categories.length - 1, 0)}+</strong>
              <span>Categories</span>
            </div>
            <div className="hero-stat">
              <strong>24h</strong>
              <span>Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <div className={`sticky-control-bar ${controlBarVisible ? "visible" : "hidden"}`}>
        <div className="control-bar-inner section-shell">
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="bar-right-controls">
            {activeCategory !== "all" && (
              <button className="filter-chip" onClick={() => setActiveCategory("all")}>
                {categories.find((category) => category.id === activeCategory)?.name}
                <X size={12} />
              </button>
            )}

            {searchQuery && (
              <button className="filter-chip" onClick={() => setSearchQuery("")}>
                &quot;{searchQuery}&quot;
                <X size={12} />
              </button>
            )}

            <span className="result-count">{totalProducts} items</span>

            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="sort-arrow" />
            </div>

            <button
              className={`toolbar-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        <div className={`filter-panel-wrap ${showFilters ? "open" : ""}`}>
          <div className="section-shell">
            <div className="filter-panel">
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0] || ""}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1] || ""}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="price-slider"
                />
                <div className="price-labels">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              <button
                className="filter-reset"
                onClick={() => {
                  setPriceRange([0, 10000000]);
                  setShowFilters(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="store-action-dock">
        <button ref={wheelLauncherRef} className="wheel-fab" onClick={() => void openSpinWheel()} aria-label="Open Spin & Save">
          <span className="wheel-fab-icon" aria-hidden="true"><i /></span>
          <span className="wheel-fab-copy">
            <strong>Spin &amp; Save</strong>
            <small>{launcherRewardCopy}</small>
          </span>
        </button>
        <button className="cart-fab" onClick={() => setIsCartOpen(true)} aria-label={`Open cart with ${cartItemCount} items`}>
          <ShoppingCart size={20} />
          {cartItemCount > 0 && <span className="cart-fab-badge">{cartItemCount}</span>}
        </button>
      </div>

      <section className="products-grid-section">
        <div className="section-shell">
          {spinError && <div className="spin-handoff-error" role="alert">{spinError}</div>}
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void fetchProducts(false)} />
          ) : products.length > 0 ? (
            <>
              <div className="products-grid-ecom">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onProductView={openProductView}
                    onQuickView={openQuickView}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="load-more-wrap">
                  <button className="btn primary load-more-button" onClick={() => void fetchProducts(true)} disabled={loadingMore}>
                    {loadingMore ? <><Loader2 size={17} className="animate-spin" /> Loading...</> : "Load More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <Search size={44} className="no-results-icon" />
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button
                className="btn primary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setPriceRange([0, 10000000]);
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="trust-banner-section">
        <div className="section-shell">
          <div className="trust-banner">
            <h2>Why shop with Emmy Technology?</h2>
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon">
                  <Check size={22} />
                </div>
                <strong>Tested & Verified</strong>
                <span>Every device is fully tested before sale</span>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <Zap size={22} />
                </div>
                <strong>Fast Delivery</strong>
                <span>Same-day delivery within Ibadan</span>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <Package size={22} />
                </div>
                <strong>Warranty Included</strong>
                <span>30-day warranty on all products</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={closeQuickView}
        onAddToCart={addToCart}
        gallery={quickViewGallery}
        galleryLoading={galleryLoading}
        galleryError={galleryError}
        onShare={shareProduct}
        onWhatsApp={(product) => void trackWhatsAppPurchaseClicked(product.id, 1)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onWhatsApp={trackCartWhatsApp}
        cashOffBalance={Number(wheelState?.cash_off_balance || 0)}
        selectedCashOffProductId={selectedCashOffProductId}
        onCashOffToggle={toggleCashOff}
        onOpenFullWheel={() => void openFullWheel("cart")}
        fullWheelBusy={fullWheelBusy}
        fullWheelError={fullWheelError}
      />
      <SpinSaveOverlay
        open={wheelOpen}
        state={wheelState}
        loading={wheelLoading}
        spinning={wheelSpinning}
        openingFullWheel={fullWheelBusy}
        error={spinError || fullWheelError}
        result={wheelSpinResult}
        spinTarget={wheelSpinTarget}
        onClose={closeSpinWheel}
        onSpin={() => void spinNativeWheel()}
        onOpenFull={() => void openFullWheel("overlay")}
        onViewCart={viewCartFromWheel}
        profileRequired={!rewardProfileReady}
        profileBusy={rewardProfileBusy}
        onRegisterProfile={registerRewardProfile}
      />
    </main>
  );
}
