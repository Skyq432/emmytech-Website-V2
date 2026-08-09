"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

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
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onDismiss, validProducts.length]);

  if (validProducts.length === 0) {
    return null;
  }

  const changeCard = (direction: "next" | "prev") => {
    setCurrentIndex((previous) => {
      if (direction === "next") {
        return (previous + 1) % validProducts.length;
      }

      return (
        (previous - 1 + validProducts.length) %
        validProducts.length
      );
    });
  };

  return (
    <div
      className="cashoff-stack-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cashoff-stack-title"
    >
      <div className="cashoff-stack-modal">
        <button
          type="button"
          className="cashoff-stack-close"
          onClick={onDismiss}
          aria-label="Close recommendations"
        >
          <X size={18} />
        </button>

        <div className="cashoff-stack-deck">
          {validProducts.map((product, index) => {
            const offset =
              (index - currentIndex + validProducts.length) %
              validProducts.length;
            const isFront = offset === 0;

            return (
              <button
                key={product.id}
                type="button"
                className={`cashoff-stack-card ${
                  isFront ? "is-front" : "is-back"
                }`}
                style={{
                  zIndex: validProducts.length - offset,
                }}
                onClick={() =>
                  isFront
                    ? onProductClick(product)
                    : setCurrentIndex(index)
                }
                aria-label={
                  isFront ? undefined : `Show ${product.name}`
                }
                aria-labelledby={
                  isFront ? "cashoff-stack-title" : undefined
                }
              >
                <div className="cashoff-stack-image-shell">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes={isFront ? "300px" : "240px"}
                      className="cashoff-stack-image"
                    />
                  ) : (
                    <div className="cashoff-stack-image-placeholder">
                      <Sparkles size={isFront ? 26 : 22} />
                    </div>
                  )}
                </div>

                {isFront ? (
                  <div className="cashoff-stack-content">
                    <p
                      id="cashoff-stack-title"
                      className="cashoff-stack-microcopy"
                    >
                      People are buying this with Cash-Off
                    </p>

                    <h3 className="cashoff-stack-name">
                      {product.name}
                    </h3>

                    <div className="cashoff-stack-price-row">
                      <strong>
                        {money(product.price)}
                      </strong>

                      {product.original_price &&
                      product.original_price >
                        product.price ? (
                        <span>
                          {money(product.original_price)}
                        </span>
                      ) : null}
                    </div>

                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {validProducts.length > 1 ? (
          <div className="cashoff-stack-controls">
            <button
              type="button"
              className="cashoff-stack-nav"
              onClick={() =>
                changeCard("prev")
              }
              aria-label="Show previous recommendation"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="cashoff-stack-dots">
              {validProducts.map(
                (item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      index ===
                      currentIndex
                        ? "cashoff-stack-dot active"
                        : "cashoff-stack-dot"
                    }
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                    aria-label={`Show ${item.name}`}
                  />
                ),
              )}
            </div>

            <button
              type="button"
              className="cashoff-stack-nav"
              onClick={() =>
                changeCard("next")
              }
              aria-label="Show next recommendation"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
