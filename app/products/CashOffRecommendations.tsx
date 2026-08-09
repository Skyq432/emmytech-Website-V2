"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

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

  const currentProduct =
    validProducts[
      currentIndex
    ] as CashOffRecommendationProduct;

  const nextProduct =
    validProducts[
      (currentIndex + 1) %
        validProducts.length
    ] as
      | CashOffRecommendationProduct
      | undefined;

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
          {nextProduct &&
          validProducts.length > 1 ? (
            <button
              type="button"
              className="cashoff-stack-card is-back"
              onClick={() =>
                changeCard("next")
              }
              aria-label={`Show ${nextProduct.name}`}
            >
              <div className="cashoff-stack-image-shell">
                {nextProduct.image ? (
                  <Image
                    src={nextProduct.image}
                    alt={nextProduct.name}
                    fill
                    sizes="240px"
                    className="cashoff-stack-image"
                  />
                ) : (
                  <div className="cashoff-stack-image-placeholder">
                    <Sparkles size={22} />
                  </div>
                )}
              </div>
            </button>
          ) : null}

          <button
            type="button"
            className="cashoff-stack-card is-front"
            onClick={() =>
              onProductClick(currentProduct)
            }
            aria-labelledby="cashoff-stack-title"
          >
            <div className="cashoff-stack-image-shell">
              {currentProduct.image ? (
                <Image
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  fill
                  sizes="300px"
                  className="cashoff-stack-image"
                />
              ) : (
                <div className="cashoff-stack-image-placeholder">
                  <Sparkles size={26} />
                </div>
              )}
            </div>

            <div className="cashoff-stack-content">
              <p
                id="cashoff-stack-title"
                className="cashoff-stack-microcopy"
              >
                People are buying this with Cash-Off
              </p>

              <h3 className="cashoff-stack-name">
                {currentProduct.name}
              </h3>

              <div className="cashoff-stack-price-row">
                <strong>
                  {money(currentProduct.price)}
                </strong>

                {currentProduct.original_price &&
                currentProduct.original_price >
                  currentProduct.price ? (
                  <span>
                    {money(
                      currentProduct.original_price,
                    )}
                  </span>
                ) : null}
              </div>

              <div className="cashoff-stack-action-row">
                <span className="cashoff-stack-chip">
                  Tap to view product
                </span>

                <span className="cashoff-stack-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </button>
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
