import { useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import type { CheckoutApi } from '../hooks/useCheckout';
import type { PricedLine } from '../types';
import { formatINR } from '../utils/pricing';
import { spring } from '../utils/motion';
import { AnimatedPrice } from './AnimatedPrice';

interface Props {
  checkout: CheckoutApi;
  lines: readonly PricedLine[];
  total: number;
}

function FieldError({ id, testId, children }: { id: string; testId: string; children: React.ReactNode }) {
  return (
    <motion.p
      id={id}
      role="alert"
      data-testid={testId}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={spring}
      className="mt-2 flex items-start gap-2 text-sm text-[#ff9bb0]"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </motion.p>
  );
}

export function CheckoutForm({ checkout, lines, total }: Props) {
  const reduce = useReducedMotion() ?? false;
  const nameId = useId();
  const nameErrId = `${nameId}-err`;
  const { customerName, setCustomerName, errors, submitError, isProcessing, submit } = checkout;

  return (
    <form
      data-testid="checkout-form"
      aria-labelledby="checkout-title"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="glass-strong grain relative rounded-[2rem] p-6 sm:p-8"
    >
      <h3 id="checkout-title" className="title mb-6 flex items-center gap-3 text-2xl">
        <Lock size={21} className="text-[color:var(--color-violet)]" aria-hidden="true" />
        Checkout
      </h3>

      <div>
        <label htmlFor={nameId} className="mb-2 block text-sm font-medium">
          Customer name <span aria-hidden="true" className="text-[color:var(--color-cyan)]">*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <input
          id={nameId}
          data-testid="customer-name-input"
          name="customerName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Aarav Sharma"
          required
          maxLength={120}
          value={customerName}
          disabled={isProcessing}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? nameErrId : undefined}
          onChange={(e) => setCustomerName(e.target.value)}
          className="field w-full rounded-2xl px-4 py-3.5 text-base text-white placeholder:text-white/35 disabled:opacity-60"
        />
        <AnimatePresence>{errors.name && <FieldError id={nameErrId} testId="name-error">{errors.name}</FieldError>}</AnimatePresence>
      </div>

      <section aria-labelledby="summary-title" className="mt-7" data-testid="order-summary">
        <h4 id="summary-title" className="eyebrow mb-3 text-[color:var(--color-muted)]">
          Order summary
        </h4>
        {lines.length === 0 ? (
          <p className="hairline rounded-2xl border-dashed px-4 py-5 text-sm text-[color:var(--color-muted)]" data-testid="summary-empty">
            No items yet. Your order summary will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/[0.04] px-4" data-testid="summary-lines">
            {lines.map((l) => (
              <li key={l.productId} data-testid={`summary-line-${l.productId}`} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{l.name}</span>
                  <span className="tnum text-[color:var(--color-muted)]">
                    <span data-testid={`summary-qty-${l.productId}`}>{l.quantity}</span> × {formatINR(l.unitPrice)}
                  </span>
                </span>
                <span className="tnum font-semibold" data-testid={`summary-line-total-${l.productId}`}>
                  {formatINR(l.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-end justify-between">
          <span className="text-base font-medium">Final order total</span>
          <AnimatedPrice value={total} className="title text-[1.9rem]" data-testid="summary-total" />
        </div>
      </section>

      <AnimatePresence>
        {errors.cart && lines.length === 0 && (
          <div className="mt-5">
            <FieldError id="cart-err" testId="cart-error">{errors.cart}</FieldError>
          </div>
        )}
      </AnimatePresence>
      {submitError && (
        <p role="alert" data-testid="submit-error" className="mt-5 text-sm text-[#ff9bb0]">
          {submitError}
        </p>
      )}

      <motion.button
        type="submit"
        data-testid="place-order-button"
        disabled={isProcessing}
        aria-busy={isProcessing}
        whileTap={isProcessing ? undefined : { scale: 0.975 }}
        transition={spring}
        className="btn-primary mt-7 flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 size={19} className={reduce ? '' : 'animate-spin'} aria-hidden="true" />
            Placing your order…
          </>
        ) : (
          <>Place Order · {formatINR(total)}</>
        )}
      </motion.button>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[color:var(--color-muted)]">
        <ShieldCheck size={14} aria-hidden="true" />
        Demo checkout — no payment is taken and nothing leaves your browser.
      </p>
      <p className="sr-only" role="status" aria-live="polite" data-testid="checkout-status">
        {isProcessing ? 'Placing your order' : ''}
      </p>
    </form>
  );
}
