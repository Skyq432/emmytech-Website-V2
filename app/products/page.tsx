"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import "./products.css";
import {
  ShoppingCart,
  Search,
  Filter,
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
} from 'lucide-react';
import CTA from '@/components/CTA';
import { brand } from '@/lib/site-data';
import { createClient } from '@/lib/supabase/client';

// ==================== SUPABASE CLIENT ====================
const supabase = createClient();

// ==================== TYPES ====================
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  original_price?: number;
  discount?: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  specs: Record<string, string>;
  description: string;
  tags: string[];
}

interface CartItem extends Product {
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// ==================== CATEGORY CONFIG ====================
const categoryConfig: Record<string, { name: string; icon: React.ReactNode }> = {
  all: { name: 'All Products', icon: <Package size={16} /> },
  laptops: { name: 'Laptops', icon: <Laptop size={16} /> },
  phones: { name: 'Phones', icon: <Smartphone size={16} /> },
  solar: { name: 'Solar', icon: <Sun size={16} /> },
  accessories: { name: 'Accessories', icon: <Headphones size={16} /> },
  cables: { name: 'Cables', icon: <Cable size={16} /> },
  gaming: { name: 'Gaming', icon: <Gamepad2 size={16} /> },
  smartwatch: { name: 'Smart Watch', icon: <Watch size={16} /> },
};

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Highest Rated' },
];

// ==================== UTILS ====================
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price);
};

// Strips everything except digits from a WhatsApp URL or phone number
// e.g. "https://wa.me/2348012345678" â†’ "2348012345678"
//      "+234 801 234 5678"            â†’ "2348012345678"
const extractWhatsAppNumber = (whatsappValue: string): string => {
  // If it's a wa.me URL, pull the path segment
  const waMe = whatsappValue.match(/wa\.me\/(\d+)/);
  if (waMe) return waMe[1];
  // Otherwise strip all non-digits
  return whatsappValue.replace(/\D/g, '');
};

const buildCartWhatsAppUrl = (cart: CartItem[], whatsappValue: string): string => {
  const phone = extractWhatsAppNumber(whatsappValue);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const lines = [
    'ðŸ›’ *New Order â€” Emmy Technology*',
    '',
    ...cart.map((item, i) => {
      const subtotal = item.price * item.quantity;
      return (
        `${i + 1}. *${item.name}*\n` +
        `   Qty: ${item.quantity}  Ã—  ${formatPrice(item.price)}\n` +
        `   Subtotal: ${formatPrice(subtotal)}`
      );
    }),
    '',
    `*Order Total: ${formatPrice(total)}*`,
    '',
    'Please confirm availability and delivery details. Thank you! ðŸ™',
  ];

  const message = lines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const buildSingleProductWhatsAppUrl = (product: Product, whatsappValue: string): string => {
  const phone = extractWhatsAppNumber(whatsappValue);
  const lines = [
    `ðŸ›ï¸ *Product Enquiry â€” Emmy Technology*`,
    '',
    `*${product.name}*`,
    `Category: ${product.category}`,
    `Price: ${formatPrice(product.price)}`,
    ...(product.original_price && product.original_price > product.price
      ? [`Original Price: ${formatPrice(product.original_price)}`]
      : []),
    '',
    'I\'m interested in this product. Please confirm availability and share delivery details. Thank you! ðŸ™',
  ];

  const message = lines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// ==================== COMPONENTS ====================

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
            className={star <= Math.floor(rating) ? 'star-filled' : 'star-empty'}
            fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
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
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="product-img"
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
            }}
          />
        </div>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {product.discount && product.discount > 0 && (
          <span className="product-discount-badge">-{product.discount}%</span>
        )}
        <button
          className={`product-wishlist-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Hover action bar */}
        <div className="product-card-actions">
          <button className="product-action-btn" onClick={() => onQuickView(product)}>
            Quick View
          </button>
          <button className="product-action-btn primary" onClick={() => onAddToCart(product)}>
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
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

        {/* Inline Add to Cart â€” always visible, sleek */}
        <button
          className="card-add-to-cart-btn"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={15} />
          <span>Add to Cart</span>
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
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="modal-grid">
          <div className="modal-image">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="modal-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
              }}
            />
            {product.discount && product.discount > 0 && (
              <span className="modal-discount">-{product.discount}%</span>
            )}
          </div>
          <div className="modal-details">
            <span className="modal-category">{product.category}</span>
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
                className={activeTab === 'description' ? 'active' : ''}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={activeTab === 'specs' ? 'active' : ''}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
            </div>

            {activeTab === 'specs' && (
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
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn primary modal-add" onClick={() => onAddToCart(product)}>
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <a href={buildSingleProductWhatsAppUrl(product, brand.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn secondary modal-whatsapp">
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
  const checkoutUrl = cart.length > 0 ? buildCartWhatsAppUrl(cart, brand.whatsapp) : '#';

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
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
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="cart-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
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
              <p className="cart-note">Shipping and taxes calculated at checkout</p>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary cart-checkout"
              >
                <ShoppingCart size={16} />
                Proceed to Checkout
              </a>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn secondary cart-whatsapp"
              >
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

// ==================== MAIN PAGE ====================
export default function ProductsPage() {
  // ===== DATA STATE =====
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== FILTER STATE =====
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);

  // ===== CART STATE =====
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ===== MODAL STATE =====
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // ===== SCROLL-AWARE CONTROL BAR =====
  const [controlBarVisible, setControlBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTicking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Show bar when scrolling up or near top; hide when scrolling down past 120px
          if (currentY < 120 || currentY < lastScrollY.current) {
            setControlBarVisible(true);
          } else if (currentY > lastScrollY.current + 6) {
            setControlBarVisible(false);
            setShowFilters(false); // close filter panel too
          }
          lastScrollY.current = currentY;
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== FETCH PRODUCTS FROM SUPABASE =====
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (supaError) throw new Error(supaError.message);

      const mapped: Product[] = (data || []).map((row: any) => ({
        id: row.id?.toString() || '',
        name: row.name || 'Unnamed Product',
        category: row.category || 'uncategorized',
        subcategory: row.subcategory || '',
        price: Number(row.price) || 0,
        original_price: row.original_price ? Number(row.original_price) : undefined,
        discount: row.discount ? Number(row.discount) : undefined,
        image: row.image || '/images/products/placeholder.jpg',
        rating: Number(row.rating) || 0,
        reviews: Number(row.reviews) || 0,
        stock: Number(row.stock) || 0,
        badge: row.badge || undefined,
        specs: row.specs || {},
        description: row.description || '',
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));

      setProducts(mapped);

      const uniqueCats = Array.from(new Set(mapped.map((p) => p.category)));
      const builtCategories: Category[] = [
        { id: 'all', name: 'All Products', icon: <Package size={16} /> },
        ...uniqueCats
          .filter((c) => c && c !== 'uncategorized')
          .map((cat) => ({
            id: cat,
            name: categoryConfig[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: categoryConfig[cat]?.icon || <Package size={16} />,
          })),
      ];
      setCategories(builtCategories);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Supabase fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ===== CART ACTIONS =====
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
      );
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setShowQuickView(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  // ===== FILTERED PRODUCTS =====
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== 'all') result = result.filter((p) => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.id > a.id ? 1 : -1)); break;
    }
    return result;
  }, [products, activeCategory, searchQuery, sortBy, priceRange]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ===== RENDER =====
  return (
    <main className="products-page">
      {/* ===== HERO ===== */}
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
            Laptops, phones, solar solutions, accessories â€” all in one place with the best prices in Ibadan.
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
              <button className="search-clear" onClick={() => setSearchQuery('')}>
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
              <strong>{categories.length - 1}+</strong>
              <span>Categories</span>
            </div>
            <div className="hero-stat">
              <strong>24h</strong>
              <span>Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STICKY CONTROL BAR â€” scroll-aware ===== */}
      <div className={`sticky-control-bar ${controlBarVisible ? 'visible' : 'hidden'}`}>
        {/* Single compact row: categories + count + sort + filter toggle */}
        <div className="control-bar-inner section-shell">
          {/* Category pills */}
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="bar-right-controls">
            {/* Active filter chips */}
            {activeCategory !== 'all' && (
              <button className="filter-chip" onClick={() => setActiveCategory('all')}>
                {categories.find((c) => c.id === activeCategory)?.name}
                <X size={12} />
              </button>
            )}
            {searchQuery && (
              <button className="filter-chip" onClick={() => setSearchQuery('')}>
                &quot;{searchQuery}&quot;
                <X size={12} />
              </button>
            )}

            <span className="result-count">{filteredProducts.length} items</span>

            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="sort-arrow" />
            </div>

            <button
              className={`toolbar-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* Collapsible filter panel */}
        <div className={`filter-panel-wrap ${showFilters ? 'open' : ''}`}>
          <div className="section-shell">
            <div className="filter-panel">
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0] || ''}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <span>â€”</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1] || ''}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
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
                onClick={() => { setPriceRange([0, 1000000]); setShowFilters(false); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STICKY CART FAB ===== */}
      <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
        <ShoppingCart size={20} />
        {cartItemCount > 0 && <span className="cart-fab-badge">{cartItemCount}</span>}
      </button>

      {/* ===== PRODUCT GRID ===== */}
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
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setPriceRange([0, 1000000]); }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== TRUST BANNER ===== */}
      <section className="trust-banner-section">
        <div className="section-shell">
          <div className="trust-banner">
            <h2>Why shop with Emmy Technology?</h2>
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon"><Check size={22} /></div>
                <strong>Tested & Verified</strong>
                <span>Every device is fully tested before sale</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><Zap size={22} /></div>
                <strong>Fast Delivery</strong>
                <span>Same-day delivery within Ibadan</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><Package size={22} /></div>
                <strong>Warranty Included</strong>
                <span>30-day warranty on all products</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />

      {/* ===== MODALS ===== */}
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

