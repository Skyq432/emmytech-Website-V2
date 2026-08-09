"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ShoppingCart,
  Sparkles,
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
  onComplete: () => void;
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
  products,
  onProductClick,
  onComplete,
  onDismiss,
}: CashOffRecommendationsProps) {
  const [
    removedIds,
    setRemovedIds,
  ] = useState<Set<string>>(
    () => new Set(),
  );

  const [
    frontProductId,
    setFrontProductId,
  ] = useState<string | null>(
    null,
  );

  const [
    animatingId,
    setAnimatingId,
  ] = useState<string | null>(
    null,
  );

  const validProducts =
    useMemo(
      () =>
        products
          .filter(Boolean)
          .slice(0, 2),
      [products],
    );

  const remainingProducts =
    useMemo(
      () =>
        validProducts.filter(
          (
            product,
          ) =>
            !removedIds.has(
              product.id,
            ),
        ),
      [
        removedIds,
        validProducts,
      ],
    );

  const stackedProducts =
    useMemo(
      () => {
        if (
          remainingProducts.length <=
          1
        ) {
          return remainingProducts;
        }

        const front =
          remainingProducts.find(
            (
              product,
            ) =>
              product.id ===
              frontProductId,
          ) ||
          remainingProducts[0];

        return [
          front,
          ...remainingProducts.filter(
            (
              product,
            ) =>
              product.id !==
              front.id,
          ),
        ];
      },
      [
        frontProductId,
        remainingProducts,
      ],
    );

  useEffect(
    () => {
      setRemovedIds(
        new Set(),
      );

      setFrontProductId(
        validProducts[0]
          ?.id ||
        null,
      );

      setAnimatingId(
        null,
      );
    },
    [
      validProducts
        .map(
          (
            product,
          ) =>
            product.id,
        )
        .join("|"),
    ],
  );

  useEffect(() => {
    const handleKeyDown =
      (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
            "Escape" &&
          !animatingId
        ) {
          onDismiss();
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    animatingId,
    onDismiss,
  ]);

  if (
    stackedProducts.length ===
    0
  ) {
    return null;
  }

  const flyProductToCart =
    async (
      product:
        CashOffRecommendationProduct,
      card:
        HTMLButtonElement,
    ) => {
      if (animatingId) {
        return;
      }

      setAnimatingId(
        product.id,
      );

      const imageShell =
        card.querySelector(
          ".cashoff-stack-image-shell",
        ) as HTMLElement | null;

      const cartButton =
        document.querySelector(
          ".cart-fab",
        ) as HTMLElement | null;

      const reduceMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

      if (
        imageShell &&
        cartButton &&
        !reduceMotion
      ) {
        const sourceRect =
          imageShell.getBoundingClientRect();

        const targetRect =
          cartButton.getBoundingClientRect();

        const clone =
          imageShell.cloneNode(
            true,
          ) as HTMLElement;

        clone.setAttribute(
          "aria-hidden",
          "true",
        );

        Object.assign(
          clone.style,
          {
            position:
              "fixed",

            left:
              `${sourceRect.left}px`,

            top:
              `${sourceRect.top}px`,

            width:
              `${sourceRect.width}px`,

            height:
              `${sourceRect.height}px`,

            margin:
              "0",

            zIndex:
              "2600",

            pointerEvents:
              "none",

            overflow:
              "hidden",

            background:
              "#eff1f8",

            border:
              "1px solid rgba(255,255,255,.85)",

            boxShadow:
              "0 18px 42px rgba(8,18,52,.28)",

            transformOrigin:
              "center center",
          },
        );

        document.body.appendChild(
          clone,
        );

        const sourceCenterX =
          sourceRect.left +
          sourceRect.width / 2;

        const sourceCenterY =
          sourceRect.top +
          sourceRect.height / 2;

        const targetCenterX =
          targetRect.left +
          targetRect.width / 2;

        const targetCenterY =
          targetRect.top +
          targetRect.height / 2;

        const deltaX =
          targetCenterX -
          sourceCenterX;

        const deltaY =
          targetCenterY -
          sourceCenterY;

        const flight =
          clone.animate(
            [
              {
                transform:
                  "translate3d(0,0,0) scale(1)",
                borderRadius:
                  "22px",
                opacity:
                  1,
              },
              {
                transform:
                  `translate3d(${deltaX * 0.42}px, ${deltaY * 0.38}px, 0) scale(.48)`,
                borderRadius:
                  "50%",
                opacity:
                  1,
                offset:
                  0.52,
              },
              {
                transform:
                  `translate3d(${deltaX}px, ${deltaY}px, 0) scale(.08)`,
                borderRadius:
                  "50%",
                opacity:
                  0.1,
              },
            ],
            {
              duration:
                760,

              easing:
                "cubic-bezier(.2,.8,.2,1)",

              fill:
                "forwards",
            },
          );

        card.animate(
          [
            {
              transform:
                "scale(1)",
              opacity:
                1,
            },
            {
              transform:
                "scale(.94)",
              opacity:
                0.16,
            },
          ],
          {
            duration:
              540,

            easing:
              "ease",

            fill:
              "forwards",
          },
        );

        await flight.finished
          .catch(
            () => undefined,
          );

        clone.remove();

        cartButton.animate(
          [
            {
              transform:
                "scale(1)",
            },
            {
              transform:
                "scale(1.2)",
            },
            {
              transform:
                "scale(1)",
            },
          ],
          {
            duration:
              360,

            easing:
              "cubic-bezier(.2,.8,.2,1)",
          },
        );
      }

      onProductClick(
        product,
      );

      const wasLastCard =
        remainingProducts.length ===
        1;

      if (wasLastCard) {
        setAnimatingId(
          null,
        );

        onComplete();

        return;
      }

      const nextFront =
        remainingProducts.find(
          (
            item,
          ) =>
            item.id !==
            product.id,
        );

      setRemovedIds(
        (
          current,
        ) => {
          const next =
            new Set(
              current,
            );

          next.add(
            product.id,
          );

          return next;
        },
      );

      setFrontProductId(
        nextFront
          ?.id ||
        null,
      );

      window.setTimeout(
        () => {
          setAnimatingId(
            null,
          );
        },
        reduceMotion
          ? 0
          : 130,
      );
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
          disabled={
            Boolean(
              animatingId,
            )
          }
          aria-label="Cancel recommendations"
        >
          <X size={18} />
        </button>

        <div className="cashoff-stack-deck">
          {stackedProducts.map(
            (
              product,
              index,
            ) => {
              const isFront =
                index === 0;

              const isAnimating =
                animatingId ===
                product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  className={`cashoff-stack-card ${
                    isFront
                      ? "is-front"
                      : "is-back"
                  } ${
                    isAnimating
                      ? "is-sending"
                      : ""
                  }`}
                  disabled={
                    Boolean(
                      animatingId,
                    )
                  }
                  style={{
                    zIndex:
                      stackedProducts.length -
                      index,
                  }}
                  onClick={(
                    event,
                  ) => {
                    if (
                      !isFront
                    ) {
                      setFrontProductId(
                        product.id,
                      );

                      return;
                    }

                    void flyProductToCart(
                      product,
                      event.currentTarget,
                    );
                  }}
                  aria-label={
                    isFront
                      ? `Add ${product.name} to cart`
                      : `Show ${product.name}`
                  }
                >
                  <div className="cashoff-stack-image-shell">
                    {product.image ? (
                      <Image
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                        fill
                        sizes={
                          isFront
                            ? "330px"
                            : "290px"
                        }
                        className="cashoff-stack-image"
                      />
                    ) : (
                      <div className="cashoff-stack-image-placeholder">
                        <Sparkles
                          size={
                            isFront
                              ? 28
                              : 22
                          }
                        />
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
                          {money(
                            product.price,
                          )}
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

                        <span className="cashoff-stack-cart-icon">
                          <ShoppingCart
                            size={18}
                          />
                        </span>
                      </div>
                    </div>
                  ) : null}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
