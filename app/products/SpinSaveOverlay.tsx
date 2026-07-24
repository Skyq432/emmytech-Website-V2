"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock3,
  Gift,
  Loader2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  WalletCards,
  TrendingUp,
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

interface CashChallengeLike {
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

interface WheelStateLike {
  cash_off_balance?: number;
  cash_challenge?: CashChallengeLike;
  spin_player?: {
    spins_remaining?: number;
    wallet_balance?: number;
    last_prize_won?: string;
    cashout_target?: number;
    spin_sequence_step?: number;
    cashout_eligible?: boolean;
  };
  active_prizes?: WheelPrize[];
  awarded_prizes?: AwardedPrize[];
}

interface WheelSpinResultLike {
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
  profileRequired: boolean;
  profileBusy: boolean;
  onRegisterProfile: (profile: { fullName: string; phone: string; email: string }) => Promise<void>;
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

const countdownSeconds = (challenge: CashChallengeLike | undefined, now: number) => {
  if (!challenge?.active || !challenge.expires_at) return 0;
  return Math.max(0, Math.floor((new Date(challenge.expires_at).getTime() - now) / 1000));
};

const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
};

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
  profileRequired,
  profileBusy,
  onRegisterProfile,
}: SpinSaveOverlayProps) {
  const [prizeBagOpen, setPrizeBagOpen] = useState(false);
  const [cashOffOpen, setCashOffOpen] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [profile, setProfile] = useState({ fullName: "", phone: "", email: "" });

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

  useEffect(() => {
    if (!open) return;
    setClockNow(Date.now());
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  if (!open) return null;

  const spinsRemaining = Number(state?.spin_player?.spins_remaining || 0);
  const hasSpins = spinsRemaining > 0;
  const cashOffBalance = Number(state?.cash_off_balance || 0);
  const challenge = state?.cash_challenge;
  const cashWallet = Number(challenge?.cash_balance ?? state?.spin_player?.wallet_balance ?? 0);
  const cashoutTarget = Math.max(1, Number(challenge?.cash_target || state?.spin_player?.cashout_target || 1000));
  const cashCap = Math.max(cashoutTarget, Number(challenge?.cash_cap || 3000));
  const cashoutProgress = Math.min(100, Math.max(0, Number(challenge?.progress_percent ?? (cashWallet / cashoutTarget) * 100)));
  const secondsRemaining = countdownSeconds(challenge, clockNow);
  const latestReward = cleanLabel(result?.label || state?.spin_player?.last_prize_won);
  const prizeCount = state?.awarded_prizes?.length || 0;
  const resultCashCredit = Number(result?.cash_challenge_credit || 0);
  const resultCashWon = Number(result?.cash_amount || 0);

  const challengeTitle = challenge?.active
    ? "24-hour cash challenge is live"
    : challenge?.cash_eligible
      ? "Cash withdrawal unlocked"
      : challenge?.converted_to_cash_off
        ? "Challenge converted to Cash-Off"
        : "Your first cash win starts 24 hours";

  const challengeNote = challenge?.active
    ? cashWallet >= cashoutTarget
      ? `Target reached. Keep the cash protected until ${formatCountdown(secondsRemaining)} ends.`
      : `${money(Math.max(0, cashoutTarget - cashWallet))} more unlocks cash eligibility when the timer ends.`
    : challenge?.cash_eligible
      ? `${money(cashWallet)} is eligible for cash withdrawal.`
      : challenge?.converted_to_cash_off
        ? `${money(Number(challenge.converted_cash_off_amount || 0))} was added to your Cash-Off balance.`
        : "Win cash on the wheel to begin the countdown.";

  const resultHeading = result
    ? resultCashWon > 0
      ? `${money(resultCashCredit)} added to your cash challenge`
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

        {profileRequired ? (
          <div className="cashoff-profile-onboarding">
            <span className="cashoff-profile-icon" aria-hidden="true">💳</span>
            <small>ONE CASH-OFF ACCOUNT</small>
            <h2>Connect your rewards</h2>
            <p>Use the same phone number or email from the wheel to load your existing balance.</p>
            <form onSubmit={(event) => { event.preventDefault(); void onRegisterProfile(profile); }}>
              <label>Full name<input required value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} autoComplete="name" /></label>
              <label>Phone number<input required value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} autoComplete="tel" inputMode="tel" /></label>
              <label>Email address<input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} autoComplete="email" /></label>
              {error ? <p className="cashoff-reference-error" role="alert">{error}</p> : null}
              <button type="submit" disabled={profileBusy}>{profileBusy ? <Loader2 size={17} className="animate-spin" /> : <WalletCards size={17} />} Connect Cash-Off</button>
            </form>
          </div>
        ) : <div className="cashoff-reference-content">
          <span className="cashoff-reference-kicker">
            <Gift size={13} /> Tap the wheel. Win Cash-Off.
          </span>
          <h2 id="cashoff-wheel-title">
            EmmyTech <span>Spin &amp; Save</span>
          </h2>

          <section className={`cash-challenge-strip ${challenge?.status || "not_started"}`} aria-live="polite">
            <div className="cash-challenge-strip-icon">
              {challenge?.cash_eligible ? <ShieldCheck size={20} /> : <Clock3 size={20} />}
            </div>
            <div className="cash-challenge-strip-copy">
              <small>{challengeTitle}</small>
              <strong>
                {challenge?.active ? formatCountdown(secondsRemaining) : challenge?.cash_eligible ? "CASH READY" : challenge?.converted_to_cash_off ? "CONVERTED" : "24:00:00"}
              </strong>
              <p>{challengeNote}</p>
            </div>
            <div className="cash-challenge-strip-balance">
              <small>Cash</small>
              <strong>{money(cashWallet)}</strong>
              <span>Cap {money(cashCap)}</span>
            </div>
            <div className="cash-challenge-strip-progress" aria-label={`${Math.round(cashoutProgress)}% of cash target`}>
              <i style={{ width: `${cashoutProgress}%` }} />
            </div>
          </section>

          <CashOffWheel
            prizes={state?.active_prizes}
            result={spinTarget}
            spinning={spinning}
          />

          {result ? (
            <div className="cashoff-result-card has-result">
              <strong>{resultHeading}</strong>
              {resultCashWon > 0 ? (
                <small>
                  {Number(result.cash_challenge_capped_amount || 0) > 0
                    ? `${money(Number(result.cash_challenge_capped_amount || 0))} was above the ₦3,000 challenge cap.`
                    : result.cash_challenge_started
                      ? "Your 24-hour countdown has started."
                      : `Cash challenge balance: ${money(Number(result.cash_challenge_after || cashWallet))}.`}
                </small>
              ) : null}
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

        </div>}

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
                  <small>24-hour cash</small>
                  <strong>{money(cashWallet)}</strong>
                </article>
                <article>
                  <small>Time remaining</small>
                  <strong className="cashoff-time-value">
                    {challenge?.active ? formatCountdown(secondsRemaining) : challenge?.cash_eligible ? "Ready" : "—"}
                  </strong>
                </article>
                <article>
                  <small>Spins left</small>
                  <strong>{spinsRemaining}</strong>
                </article>
              </div>

              <div className="cashoff-cashout-progress">
                <div>
                  <small>Cash target progress</small>
                  <strong>{money(cashWallet)} / {money(cashoutTarget)}</strong>
                </div>
                <span><i style={{ width: `${cashoutProgress}%` }} /></span>
              </div>

              <div className="cash-challenge-rules">
                <TrendingUp size={18} />
                <div>
                  <strong>What happens after 24 hours?</strong>
                  <p>Below ₦700 becomes the same Cash-Off. ₦700–₦999 becomes ₦1,000 Cash-Off. ₦1,000–₦3,000 becomes cash eligible.</p>
                </div>
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
