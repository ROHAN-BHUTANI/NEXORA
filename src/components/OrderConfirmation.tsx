import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';
import { formatINR } from '../utils/pricing';
import { easeOutExpo, spring } from '../utils/motion';
import { MagneticButton } from './MagneticButton';

interface Props {
  order: Order;
  onNewOrder: () => void;
}

// Deterministic burst geometry (no Math.random during render).
const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 96 + (i % 3) * 22;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, c: i % 3 === 0 ? '#38e1ff' : i % 3 === 1 ? '#7c5cff' : '#ff4fd8', d: i * 0.012 };
});

export function OrderConfirmation({ order, onNewOrder }: Props) {
  const reduce = useReducedMotion() ?? false;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so keyboard / screen-reader users land on the result.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      data-testid="order-confirmation"
      role="region"
      aria-labelledby="confirm-title"
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: easeOutExpo }}
      className="glass-strong grain relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] p-7 sm:p-10"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[color:var(--color-cyan)]/25 blur-[90px]" aria-hidden="true" />

      <div className="relative mx-auto mb-6 grid h-28 w-28 place-items-center" aria-hidden="true">
        {!reduce &&
          SPARKS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{ background: s.c, boxShadow: `0 0 10px ${s.c}` }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0, 1.2, 0.4] }}
              transition={{ duration: 1.1, delay: 0.25 + s.d, ease: easeOutExpo }}
            />
          ))}
        <motion.span
          className="absolute inset-0 rounded-full border border-[color:var(--color-cyan)]/60"
          initial={reduce ? false : { scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.15 }}
        />
        <motion.div
          className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#38e1ff] shadow-[0_0_60px_-6px_rgba(56,225,255,0.65)]"
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.38, duration: 0.8 }}
        >
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
            <motion.path
              d="M12 25.5l8.5 8.5L36 15"
              stroke="#04061a"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.35, ease: easeOutExpo }}
            />
          </svg>
        </motion.div>
      </div>

      <div className="relative text-center">
        <p className="eyebrow mb-3 inline-flex items-center gap-2 text-[color:var(--color-cyan)]">
          <CheckCircle2 size={14} aria-hidden="true" />
          <span data-testid="order-status">Order confirmed</span>
        </p>
        <h3 id="confirm-title" ref={headingRef} tabIndex={-1} style={{ outline: 'none' }} className="display text-[clamp(1.9rem,4.4vw,2.8rem)]">
          Thank you, <span className="text-gradient" data-testid="order-customer-name">{order.customerName}</span>
        </h3>
        <p className="mt-3 text-[color:var(--color-muted)]">Your NEXORA order is confirmed and on its way to the lab.</p>

        <div className="hairline mx-auto mt-6 inline-flex flex-col items-center rounded-2xl bg-black/25 px-6 py-3">
          <span className="eyebrow text-[color:var(--color-muted)]">Order reference</span>
          <span className="tnum mt-1 select-all text-lg font-semibold tracking-[0.08em]" data-testid="order-reference">
            {order.reference}
          </span>
        </div>
      </div>

      <ul className="relative mt-8 divide-y divide-white/10 rounded-2xl bg-white/[0.04] px-5" data-testid="order-lines" aria-label="Ordered products">
        {order.lines.map((l, i) => (
          <motion.li
            key={l.productId}
            data-testid={`confirmation-line-${l.productId}`}
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.5 + i * 0.1 }}
            className="flex items-center justify-between gap-4 py-4"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{l.name}</span>
              <span className="tnum text-sm text-[color:var(--color-muted)]">
                Quantity <span data-testid={`confirmation-qty-${l.productId}`}>{l.quantity}</span> × {formatINR(l.unitPrice)}
              </span>
            </span>
            <span className="tnum font-semibold" data-testid={`confirmation-line-total-${l.productId}`}>
              {formatINR(l.lineTotal)}
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="relative mt-5 flex items-end justify-between">
        <span className="text-base font-medium">Final total</span>
        <span className="title tnum text-[2.2rem]" data-testid="order-total">
          {formatINR(order.total)}
        </span>
      </div>

      <div className="relative mt-8 flex justify-center">
        <MagneticButton variant="glass" data-testid="new-order-button" onClick={onNewOrder}>
          <ArrowLeft size={17} aria-hidden="true" />
          Start a new order
        </MagneticButton>
      </div>
    </motion.div>
  );
}
