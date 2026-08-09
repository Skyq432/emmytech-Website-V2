"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";

export interface CashOffRecommendationProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  original_price?: number;
  image: string;
  stock: number;
}

interface CashOffRecommendationsProps {
  eyebrow: string;
  headline: string;
  bodyText: string;
  cashOffAmount: number;
  products: CashOffRecommendationProduct[];
  onProductClick: (
    product: CashOffRecommendationProduct,
  ) => void;
  onDismiss: () => void;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export default function CashOffRecommendations({
  eyebrow,
  headline,
  bodyText,
  cashOffAmount,
  products,
  onProductClick,
  onDismiss,
}: CashOffRecommendationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validProducts = useMemo(
    () => products.filter(Boolean).slice(0, 2),
    [products],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [validProducts.length]);

  useEffect(() => {
    if (validProducts.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((previous) =>
          (previous + 1) % validProducts.length,
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((previous) =>
          (previous - 1 + validProducts.length) %
          validProducts.length,
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
      document.body.style.overflow = previousOverflow;
    };
  }, [onDismiss, validProducts.length]);

  if (
    validProducts.length === 0 ||
    cashOffAmount <= 0
  ) {
    return null;
  }

  const product =
    validProducts[
      currentIndex
    ] as CashOffRecommendationProduct;

  const helperText =
    currentIndex === 0
      ? "One of the best products you can use your Cash-Off on right now."
      : "Another solid option to explore while your Cash-Off is still available.";

  const productLabel =
    product.subcategory ||
    product.category ||
    "EmmyTech product";

  return (
    <div
      className="cashoff-recommendation-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cashoff-recommendation-title"
    >
      <div className="cashoff-recommendation-modal">
        <button
          type="button"
          className="cashoff-recommendation-close"
          onClick={onDismiss}
          aria-label="Close recommendations"
        >
          <X size={18} />
        </button>

        <div className="cashoff-recommendation-modal-topline" />

        <div className="cashoff-recommendation-branding">
          <div className="cashoff-recommendation-branding-logo">
            <Image
              src="/images/emmy-logo-blue-text.png"
              alt="EmmyTech"
              fill
              sizes="160px"
              className="cashoff-recommendation-branding-logo-img"
            />
          </div>

          <div className="cashoff-recommendation-balance-pill">
            <small>Cash-Off available</small>
            <strong>{money(cashOffAmount)}</strong>
          </div>
        </div>

        <div className="cashoff-recommendation-copy">
          <span className="cashoff-recommendation-eyebrow">
            <WalletCards size={14} />
            {eyebrow}
          </span>

          <h2 id="cashoff-recommendation-title">
            {headline || "Two products worth a look"}
          </h2>

          <p>
            {bodyText ||
              "Here are a few great options you can use your Cash-Off on today."}
          </p>
        </div>

        <div className="cashoff-recommendation-slider-shell">
          <div className="cashoff-recommendation-slide-card">
            <div className="cashoff-recommendation-image-panel">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 70vw, 320px"
                  className="cashoff-recommendation-image"
                />
              ) : (
                <div className="cashoff-recommendation-image-placeholder">
                  <Sparkles size={30} />
                </div>
              )}

              <span className="cashoff-recommendation-slide-number">
                0{currentIndex + 1}
              </span>
            </div>

            <div className="cashoff-recommendation-content-panel">
              <small>{productLabel}</small>

              <h3>{product.name}</h3>

              <p className="cashoff-recommendation-helper">
                {helperText}
              </p>

              <div className="cashoff-recommendation-price-row">
                <strong>{money(product.price)}</strong>

                {product.original_price &&
                product.original_price >
                  product.price ? (
                  <span>
                    {money(product.original_price)}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                className="cashoff-recommendation-primary"
                onClick={() =>
                  onProductClick(product)
                }
              >
                View product
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="cashoff-recommendation-controls">
            <button
              type="button"
              className="cashoff-recommendation-nav"
              onClick={() =>
                setCurrentIndex((previous) =>
                  (previous - 1 + validProducts.length) %
                  validProducts.length,
                )
              }
              aria-label="Previous recommendation"
              disabled={validProducts.length < 2}
            >
              <ArrowLeft size={16} />
            </button>

            <div className="cashoff-recommendation-dots">
              {validProducts.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    index === currentIndex
                      ? "cashoff-recommendation-dot active"
                      : "cashoff-recommendation-dot"
                  }
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`Show recommendation ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="cashoff-recommendation-nav"
              onClick={() =>
                setCurrentIndex((previous) =>
                  (previous + 1) %
                  validProducts.length,
                )
              }
              aria-label="Next recommendation"
              disabled={validProducts.length < 2}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <p className="cashoff-recommendation-footnote">
          Your Cash-Off stays available while you browse.
        </p>
      </div>
    </div>
  );
}
