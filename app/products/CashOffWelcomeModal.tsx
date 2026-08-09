"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  RefreshCw,
  X,
} from "lucide-react";

interface CashOffWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  cashOffAmount: number;
  lastSpinDate?: string | null;
  spinsRemaining: number;
  onExploreProducts: () => void;
  onUseSpins: () => void;
}

function formatSpinDate(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

export default function CashOffWelcomeModal({
  isOpen,
  onClose,
  userName,
  cashOffAmount,
  lastSpinDate,
  spinsRemaining,
  onExploreProducts,
  onUseSpins,
}: CashOffWelcomeModalProps) {

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

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
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }


  const formattedAmount =
    Number(
      cashOffAmount || 0,
    ).toLocaleString(
      "en-NG",
    );


  const formattedSpinDate =
    formatSpinDate(
      lastSpinDate,
    );


  return (
    <div
      className="cashoff-welcome-backdrop"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cashoff-modal-title"
        className="cashoff-welcome-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          className="cashoff-welcome-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>


        <div className="cashoff-welcome-brand">

          <Image
            src="/images/emmy-logo-blue-text.png"
            alt="Emmy Technology"
            width={150}
            height={48}
            className="cashoff-welcome-logo"
            priority
          />

          <span>
            Rewards
          </span>

        </div>


        <div className="cashoff-welcome-kicker">
          Welcome back
        </div>


        <h2 id="cashoff-modal-title">
          Good to have you back, {userName}.
        </h2>


        <p className="cashoff-welcome-intro">
          {formattedSpinDate ? (
            <>
              You last spun the wheel on{" "}
              <strong>
                {formattedSpinDate}
              </strong>.
              {" "}
              We&apos;ve kept your Cash-Off
              saved for you.
            </>
          ) : (
            <>
              It&apos;s good to see you again.
              We&apos;ve kept your Cash-Off
              saved for you.
            </>
          )}
        </p>


        <div className="cashoff-welcome-balance">

          <div className="cashoff-welcome-balance-top">

            <span>
              Your Cash-Off
            </span>

            <span className="cashoff-ready-pill">
              <Check size={12} />
              Ready to use
            </span>

          </div>


          <div className="cashoff-welcome-amount">
            <small>₦</small>

            <strong>
              {formattedAmount}
            </strong>
          </div>


          <p>
            Use it toward any eligible product
            from EmmyTech.
          </p>

        </div>


        {spinsRemaining > 0 && (
          <div className="cashoff-welcome-spins">

            <RefreshCw size={16} />

            <strong>
              {spinsRemaining} spin{
                spinsRemaining === 1
                  ? ""
                  : "s"
              } waiting
            </strong>

            <span>
              — come back anytime
            </span>

          </div>
        )}


        <button
          type="button"
          className="cashoff-welcome-primary"
          onClick={onExploreProducts}
        >
          Explore products

          <ArrowRight size={16} />
        </button>


        {spinsRemaining > 0 && (
          <button
            type="button"
            className="cashoff-welcome-secondary"
            onClick={onUseSpins}
          >
            <RefreshCw size={15} />

            Use my {spinsRemaining} spin{
              spinsRemaining === 1
                ? ""
                : "s"
            }
          </button>
        )}

      </div>
    </div>
  );
}
