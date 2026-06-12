"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import "./products.css";
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
} from "lucide-react";
import CTA from "@/components/CTA";
import { brand } from "@/lib/site-data";
import { trackingSupabase as supabase, registerVisitor, trackProductView, trackAddToCart } from "@/lib/tracking";

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

const PLACEHOLDER_IMAGE = "/images/products/placeholder.jpg";

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

const buildCartWhatsAppUrl = (cart: CartItem[], whatsappValue: string): string => {
  const phone = extractWhatsAppNumber(whatsappValue);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const lines = [
    "🛒 *New Order — Emmy Technology*",
    "",
    ...cart.map((item, i) => {
      const subtotal = item.price * item.quantity;
      return (
        `${i + 1}. *${item.name}*\n` +
        `   Qty: ${item.quantity} × ${formatPrice(item.price)}\n` +
        `   Subtotal: ${formatPrice(subtotal)}`
      );
    }),
    "",
    `*Order Total: ${formatPrice(total)}*`,
    "",
    "Please confirm availability and delivery details. Thank you!",
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

  const productImages: ProductImage[] = Array.isArray(row.product_images)
    ? row.product_images
    : [];

  const sortedImages = [...productImages].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });

  const gallery = [
    row.image_url,
    ...sortedImages.map((img) => img.image_url),
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index) as string[];

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
  onQuickView,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="product-card-ecom">
      <div className="product-card-image-wrapper">
        <div className="product-card-image">
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>

        {product.badge && <span className="product-badge">{product.badge}</span>}

        {product.discount && product.discount > 0 && (
          <span className="product-discount-badge">-{product.discount}%</span>
        )}

        <button
          className={`product-wishlist-btn ${isLiked ? "liked" : ""}`}
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>

        <div className="product-card-actions">
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
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
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
            <img
              src={activeImage}
              alt={product.name}
              className="modal-img"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />

            {product.discount && product.discount > 0 && (
              <span className="modal-discount">-{product.discount}%</span>
            )}

            {product.gallery.length > 1 && (
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
                {product.gallery.map((image) => (
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
                    }}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
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
              >
                <Zap size={16} />
                Buy on WhatsApp
              </a>
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
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const checkoutUrl = cart.length > 0 ? buildCartWhatsAppUrl(cart, brand.whatsapp) : "#";

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
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-img"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
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
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="cart-note">Shipping and availability will be confirmed by EmmyTech.</p>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn primary cart-checkout">
                <ShoppingCart size={16} />
                Proceed to Checkout
              </a>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn secondary cart-whatsapp">
                <Zap size={15} />
                Complete on WhatsApp
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
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const [controlBarVisible, setControlBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

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
    const params = new URLSearchParams(window.location.search);
    const referralCode =
      params.get("ref") ||
      params.get("code") ||
      params.get("ambassador") ||
      localStorage.getItem("emmy_referral_code");

    if (referralCode) {
      localStorage.setItem("emmy_referral_code", referralCode);
    }

    registerVisitor(referralCode);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supaError } = await supabase
        .from("products")
        .select(`
          *,
          product_categories (
            id,
            name,
            slug
          ),
          product_images (
            id,
            image_url,
            image_path,
            is_primary,
            sort_order
          )
        `)
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (supaError) throw new Error(supaError.message);

      const mapped = (data || []).map(mapProduct);
      setProducts(mapped);

      const categoryMap = new Map<string, Category>();
      categoryMap.set("all", { id: "all", name: "All Products", icon: <Package size={16} /> });

      mapped.forEach((product) => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            id: product.category,
            name:
              categoryConfig[product.category]?.name ||
              product.subcategory ||
              titleCase(product.category),
            icon: categoryConfig[product.category]?.icon || <Package size={16} />,
          });
        }
      });

      setCategories(Array.from(categoryMap.values()));
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      console.error("Supabase fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        setCart((prev) => prev.filter((item) => item.id !== id));
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
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
    trackProductView(product.id);
  }, []);

  const closeQuickView = useCallback(() => {
    setShowQuickView(false);
    setTimeout(() => setQuickViewProduct(null), 250);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter((product) => product.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.subcategory.toLowerCase().includes(q) ||
          product.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        break;
      case "featured":
      default:
        result.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, priceRange]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
              <strong>{products.length}+</strong>
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

            <span className="result-count">{filteredProducts.length} items</span>

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

      <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
        <ShoppingCart size={20} />
        {cartItemCount > 0 && <span className="cart-fab-badge">{cartItemCount}</span>}
      </button>

      <section className="products-grid-section">
        <div className="section-shell">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid-ecom">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onQuickView={openQuickView}
                />
              ))}
            </div>
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
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </main>
  );
}
