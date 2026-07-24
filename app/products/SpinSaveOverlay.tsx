"use client";

import { useEffect, useRef, useState } from "react";
import {
  Gift,
  Loader2,
  ShoppingCart,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

interface WheelPrize {
  id?: string;
  label?: string;
  monetary_value?: number;
}

interface AwardedPrize {
  id?: string;
  prize_label?: string;
  result_label?: string;
  status?: string;
  created_at?: string;
}

interface WheelStateLike {
  cash_off_balance?: number;
  spin_player?: {
    spins_remaining?: number;
    wallet_balance?: number;
    last_prize_won?: string;
    cashout_target?: number;
    spin_sequence_step?: number;
  };
  active_prizes?: WheelPrize[];
  awarded_prizes?: AwardedPrize[];
}

interface WheelSpinResultLike {
  label?: string;
  result_type?: string;
  cash_off_amount?: number;
  cash_off_after?: number;
  spin_log_id?: string;
}

interface SpinSaveOverlayProps {
  open: boolean;
  state: WheelStateLike | null;
  loading: boolean;
  spinning: boolean;
  openingFullWheel: boolean;
  error: string | null;
  result: WheelSpinResultLike | null;
  spinTarget: WheelSpinResultLike | null;
  onClose: () => void;
  onSpin: () => void;
  onOpenFull: () => void;
  onViewCart: () => void;
}

const SEGMENT_COLORS = ["#003399", "#fbb03b", "#ffffff"];
const SEGMENT_TEXT = ["#ffffff", "#09152f", "#003399"];

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const cleanLabel = (value?: string | null) =>
  String(value || "Reward")
    .replace(/^(demo|test)\s+/i, "")
    .replace(/\s+cash[ -]?off$/i, " Cash-Off")
    .replace(/bonus spin/i, "Bonus Spin")
    .trim();

const compactLabel = (value?: string | null) =>
  cleanLabel(value)
    .replace(/\s+Cash-Off$/i, "")
    .replace(/Try Again/i, "Try Again")
    .replace(/Bonus Spin/i, "Bonus");

function CashOffWheel({
  prizes,
  result,
  spinning,
}: {
  prizes?: WheelPrize[];
  result: WheelSpinResultLike | null;
  spinning: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  const labels = (prizes?.length
    ? prizes
    : [
        { label: "₦100" },
        { label: "₦200" },
        { label: "₦500" },
        { label: "₦1,000" },
        { label: "₦2,000" },
        { label: "Laptop" },
        { label: "Try Again" },
        { label: "Bonus Spin" },
        { label: "EM" },
      ]
  ).map((prize) =>
    compactLabel(
      prize.label ||
        (prize.monetary_value ? money(prize.monetary_value) : "Prize"),
    ),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context || labels.length === 0) return;

    const size = 820;
    const center = size / 2;
    const radius = center - 18;
    const arc = (Math.PI * 2) / labels.length;

    canvas.width = size;
    canvas.height = size;

    const draw = (angle: number) => {
      context.clearRect(0, 0, size, size);

      labels.forEach((label, index) => {
        const start = angle - Math.PI / 2 + index * arc;
        const colorIndex = index % SEGMENT_COLORS.length;

        context.beginPath();
        context.moveTo(center, center);
        context.arc(center, center, radius, start, start + arc);
        context.closePath();
        context.fillStyle = SEGMENT_COLORS[colorIndex];
        context.fill();
        context.strokeStyle = "rgba(0, 51, 153, 0.16)";
        context.lineWidth = 2;
        context.stroke();

        context.save();
        context.translate(center, center);
        context.rotate(start + arc / 2);
        context.translate(radius * 0.66, 0);
        context.fillStyle = SEGMENT_TEXT[colorIndex];
        context.textAlign = "center";
        context.textBaseline = "middle";

        let fontSize = labels.length > 9 ? 19 : 22;
        const maxWidth = Math.max(86, radius * Math.min(0.38, arc * 0.6));
        context.font = `800 ${fontSize}px Arial, sans-serif`;
        while (context.measureText(label.toUpperCase()).width > maxWidth && fontSize > 13) {
          fontSize -= 1;
          context.font = `800 ${fontSize}px Arial, sans-serif`;
        }
        context.fillText(label.toUpperCase(), 0, 0);
        context.restore();
      });

      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.strokeStyle = "#003399";
      context.lineWidth = 7;
      context.stroke();
    };

    draw(angleRef.current);

    if (!result?.spin_log_id) return;

    const wanted = compactLabel(result.label).toLowerCase();
    let winnerIndex = labels.findIndex((label) => label.toLowerCase() === wanted);
    if (winnerIndex < 0) {
      winnerIndex = labels.findIndex(
        (label) =>
          wanted.includes(label.toLowerCase()) ||
          label.toLowerCase().includes(wanted),
      );
    }
    if (winnerIndex < 0) winnerIndex = 0;

    const targetModulo =
      ((-winnerIndex * arc - arc / 2) % (Math.PI * 2) + Math.PI * 2) %
      (Math.PI * 2);
    const currentModulo =
      ((angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const correction =
      (targetModulo - currentModulo + Math.PI * 2) % (Math.PI * 2);
    const startAngle = angleRef.current;
    const totalDelta = correction + 11 * Math.PI * 2;
    const startedAt = performance.now();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducedMotion ? 350 : 6000;
    let frame = 0;
    let lastTickIndex = -1;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      angleRef.current = startAngle + totalDelta * eased;
      draw(angleRef.current);

      const currentTickIndex =
        Math.floor(
          (((-angleRef.current % (Math.PI * 2)) + Math.PI * 2) / arc),
        ) % labels.length;
      if (currentTickIndex !== lastTickIndex && hubRef.current) {
        lastTickIndex = currentTickIndex;
        hubRef.current.classList.remove("ticking");
        void hubRef.current.offsetWidth;
        hubRef.current.classList.add("ticking");
      }

      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [labels.join("|"), result?.spin_log_id]);

  return (
    <div className={`cashoff-wheel-shell ${spinning ? "is-spinning" : ""}`}>
      <div className="cashoff-wheel-pointer" aria-hidden="true">
        <svg width="42" height="52" viewBox="0 0 40 50">
          <path
            d="M20 50L0 15C0 6.7 6.7 0 15 0H25C33.3 0 40 6.7 40 15L20 50Z"
            fill="#ef4444"
          />
          <circle cx="20" cy="15" r="5" fill="white" />
        </svg>
      </div>
      <canvas ref={canvasRef} aria-label="Spin & Save prize wheel" />
      <div ref={hubRef} className="cashoff-wheel-hub" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export default function SpinSaveOverlay({
  open,
  state,
  loading,
  spinning,
  openingFullWheel,
  error,
  result,
  spinTarget,
  onClose,
  onSpin,
  onOpenFull,
  onViewCart,
}: SpinSaveOverlayProps) {
  const [prizeBagOpen, setPrizeBagOpen] = useState(false);
  const [cashOffOpen, setCashOffOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setPrizeBagOpen(false);
      setCashOffOpen(false);
    }
  }, [open]);

  if (!open) return null;

  const spinsRemaining = Number(state?.spin_player?.spins_remaining || 0);
  const hasSpins = spinsRemaining > 0;
  const cashOffBalance = Number(state?.cash_off_balance || 0);
  const cashWallet = Number(state?.spin_player?.wallet_balance || 0);
  const cashoutTarget = Math.max(
    1,
    Number(state?.spin_player?.cashout_target || 1000),
  );
  const cashoutProgress = Math.min(
    100,
    Math.max(0, (cashWallet / cashoutTarget) * 100),
  );
  const latestReward = cleanLabel(
    result?.label || state?.spin_player?.last_prize_won,
  );
  const prizeCount = state?.awarded_prizes?.length || 0;
  const resultIsCashOff = Number(result?.cash_off_amount || 0) > 0;

  const resultHeading = result
    ? resultIsCashOff
      ? `${money(result.cash_off_amount)} Cash-Off unlocked`
      : latestReward
    : "Your next reward is waiting";

  const mainButtonLabel = loading
    ? "Connecting…"
    : spinning
      ? "Spinning…"
      : hasSpins
        ? "Spin now"
        : "Get another spin";

  return (
    <div className="wheel-overlay" onMouseDown={onClose}>
      <section
        className="wheel-dialog cashoff-reference-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cashoff-wheel-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="wheel-close"
          onClick={onClose}
          aria-label="Close Spin & Save"
        >
          <X size={18} />
        </button>

        <div className="cashoff-reference-content">
          <span className="cashoff-reference-kicker">
            <Gift size={13} /> Tap the wheel. Win Cash-Off.
          </span>
          <h2 id="cashoff-wheel-title">
            EmmyTech <span>Spin &amp; Save</span>
          </h2>
          <CashOffWheel
            prizes={state?.active_prizes}
            result={spinTarget}
            spinning={spinning}
          />

          {result ? (
            <div className="cashoff-result-card has-result">
              <strong>{resultHeading}</strong>
            </div>
          ) : null}

          {error ? (
            <p className="cashoff-reference-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className={`cashoff-main-spin ${hasSpins ? "ready" : "no-spins"}`}
            onClick={hasSpins ? onSpin : onOpenFull}
            disabled={loading || spinning || openingFullWheel}
          >
            {loading || spinning || openingFullWheel ? (
              <Loader2 size={19} className="animate-spin" />
            ) : hasSpins ? (
              <Zap size={19} />
            ) : (
              <Sparkles size={19} />
            )}
            {mainButtonLabel}
          </button>

          <nav className="cashoff-quick-actions" aria-label="Spin & Save actions">
            <button type="button" onClick={() => setCashOffOpen(true)}>
              <span className="cashoff-action-emoji" aria-hidden="true">💳</span>
              <span>My Cash-Off</span>
            </button>
            <button type="button" onClick={onViewCart}>
              <span className="cashoff-action-emoji" aria-hidden="true">🛍️</span>
              <span>Use Cash-Off</span>
            </button>
            <button
              type="button"
              onClick={onOpenFull}
              disabled={openingFullWheel}
            >
              {openingFullWheel ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <span className="cashoff-action-emoji" aria-hidden="true">🚀</span>
              )}
              <span>Full Wheel</span>
            </button>
            <button type="button" onClick={() => setPrizeBagOpen(true)}>
              <span className="cashoff-action-emoji" aria-hidden="true">🎁</span>
              <span>Prize Bag</span>
            </button>
          </nav>

        </div>

        {cashOffOpen ? (
          <div className="cashoff-panel-overlay" onMouseDown={() => setCashOffOpen(false)}>
            <section onMouseDown={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>Your rewards</small>
                  <h3>My Cash-Off</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCashOffOpen(false)}
                  aria-label="Close Cash-Off details"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="cashoff-balance-hero">
                <small>Available Cash-Off</small>
                <strong>{money(cashOffBalance)}</strong>
                <p>Shopping credit you can apply to one eligible cart item.</p>
              </div>

              <div className="cashoff-wallet-grid">
                <article>
                  <small>Cash wallet</small>
                  <strong>{money(cashWallet)}</strong>
                </article>
                <article>
                  <small>Spins left</small>
                  <strong>{spinsRemaining}</strong>
                </article>
              </div>

              <div className="cashoff-cashout-progress">
                <div>
                  <small>Cashout progress</small>
                  <strong>
                    {money(cashWallet)} / {money(cashoutTarget)}
                  </strong>
                </div>
                <span>
                  <i style={{ width: `${cashoutProgress}%` }} />
                </span>
              </div>

              <button
                type="button"
                className="cashoff-panel-primary"
                onClick={onViewCart}
              >
                <ShoppingCart size={17} /> Choose a product in your cart
              </button>
              <p className="cashoff-panel-note">
                Cash-Off reduces eligible EmmyTech purchases. It is not a
                withdrawable cash balance.
              </p>
            </section>
          </div>
        ) : null}

        {prizeBagOpen ? (
          <div className="cashoff-panel-overlay" onMouseDown={() => setPrizeBagOpen(false)}>
            <section onMouseDown={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>Your rewards</small>
                  <h3>My Prize Bag</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPrizeBagOpen(false)}
                  aria-label="Close prize bag"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="cashoff-balance-hero compact">
                <small>Cash-Off balance</small>
                <strong>{money(cashOffBalance)}</strong>
              </div>

              <div className="cashoff-prize-list">
                {state?.awarded_prizes?.length ? (
                  state.awarded_prizes.map((prize, index) => (
                    <article key={prize.id || index}>
                      <Gift size={18} />
                      <div>
                        <strong>
                          {cleanLabel(prize.prize_label || prize.result_label)}
                        </strong>
                        <small>
                          {prize.created_at
                            ? new Date(prize.created_at).toLocaleString()
                            : "Saved reward"}
                        </small>
                      </div>
                      <span>{prize.status || "available"}</span>
                    </article>
                  ))
                ) : (
                  <p className="cashoff-empty-prizes">
                    Your prize bag is ready. Complete a spin and eligible
                    rewards will appear here.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
