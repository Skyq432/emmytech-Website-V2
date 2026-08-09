"use client";

import Image from "next/image";
import {
  ArrowRight,
  Package,
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

const money = (
  value: number,
) =>
  new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  );

export default function CashOffRecommendations({
  eyebrow,
  headline,
  bodyText,
  cashOffAmount,
  products,
  onProductClick,
  onDismiss,
}: CashOffRecommendationsProps) {

  if (
    products.length !== 2 ||
    cashOffAmount <= 0
  ) {
    return null;
  }

  return (
    <section
      className="cashoff-recommendations"
      aria-labelledby="cashoff-recommendations-title"
    >
      <div className="cashoff-recommendations-heading">
        <div>
          <span className="cashoff-recommendations-eyebrow">
            <WalletCards size={14} />
            {eyebrow}
          </span>

          <h2 id="cashoff-recommendations-title">
            {headline}
          </h2>

          <p>
            {bodyText}
          </p>
        </div>

        <div className="cashoff-recommendations-balance">
          <small>Saved for you</small>
          <strong>
            {money(cashOffAmount)}
          </strong>
        </div>

        <button
          type="button"
          className="cashoff-recommendations-close"
          onClick={onDismiss}
          aria-label="Hide recommendations"
        >
          <X size={17} />
        </button>
      </div>

      <div className="cashoff-recommendations-grid">
        {products.map(
          (
            product,
            index,
          ) => (
            <article
              key={product.id}
              className="cashoff-recommendation-card"
            >
              <button
                type="button"
                className="cashoff-recommendation-image"
                onClick={() =>
                  onProductClick(
                    product,
                  )
                }
                aria-label={`View ${product.name}`}
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 720px) 42vw, 220px"
                    className="cashoff-recommendation-img"
                  />
                ) : (
                  <span className="cashoff-recommendation-placeholder">
                    <Package size={28} />
                  </span>
                )}

                <span className="cashoff-recommendation-number">
                  0{index + 1}
                </span>
              </button>

              <div className="cashoff-recommendation-copy">
                <small>
                  {product.subcategory ||
                    product.category}
                </small>

                <h3>
                  {product.name}
                </h3>

                <div className="cashoff-recommendation-price">
                  <strong>
                    {money(product.price)}
                  </strong>

                  {product.original_price &&
                    product.original_price >
                      product.price ? (
                    <span>
                      {money(
                        product.original_price,
                      )}
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="cashoff-recommendation-view"
                  onClick={() =>
                    onProductClick(
                      product,
                    )
                  }
                >
                  View product
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ),
        )}
      </div>

      <p className="cashoff-recommendations-note">
        Your Cash-Off remains saved while you browse.
        Final product eligibility is confirmed when you order.
      </p>
    </section>
  );
}
