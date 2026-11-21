import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Keyboard, Minus, Mouse, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { PricedLine, ProductId } from '../types';
import { MAX_QUANTITY } from '../utils/cart';
import { formatINR } from '../utils/pricing';
import { spring, springSnappy } from '../utils/motion';
import { AnimatedPrice } from './AnimatedPrice';

interface Props {
  lines: readonly PricedLine[];
  total: number;
  count: number;
  /** Locks editing while an order is being submitted. */
  locked: boolean;
  onIncrement: (id: ProductId) => void;
  onDecrement: (id: ProductId) => void;
  onRemove: (id: ProductId) => void;
  onBrowse: () => void;
}

const ICONS = { 'quantum-mouse': Mouse, 'mechanical-keyboard': Keyboard } as const;

function StepButton({ label, onClick, disabled, children, testId }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; testId: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      transition={springSnappy}
      className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </motion.button>
  );
}

function CartLineItem({ line, locked, onIncrement, onDecrement, onRemove, reduce }: { line: PricedLine; locked: boolean; onIncrement: Props['onIncrement']; onDecrement: Props['onDecrement']; onRemove: Props['onRemove']; reduce: boolean }) {
  const Icon = ICONS[line.productId];
  const id = line.productId;
  return (
    <motion.li
      layout={reduce ? false : 'position'}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28, scale: 0.96 }}
      transition={spring}
      data-testid={`cart-line-${id}`}
      className="hairline rounded-2xl bg-white/[0.04] p-4"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#2a3080] to-[#0e1240] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Icon size={24} className={id === 'quantum-mouse' ? 'text-[color:var(--color-cyan)]' : 'text-[#b9a6ff]'} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium" data-testid={`cart-line-name-${id}`}>
            {line.name}
          </p>
          <p className="tnum text-sm text-[color:var(--color-muted)]">
            <span data-testid={`cart-unit-price-${id}`}>{formatINR(line.unitPrice)}</span> each
          </p>
        </div>
        <motion.button
          type="button"
          aria-label={`Remove ${line.name} from cart`}
          data-testid={`remove-${id}`}
          disabled={locked}
          onClick={() => onRemove(id)}
          whileTap={locked ? undefined : { scale: 0.88 }}
          transition={springSnappy}
          className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--color-muted)] hover:bg-white/10 hover:text-[#ff9bb0] disabled:opacity-35"
        >
          <Trash2 size={17} aria-hidden="true" />
        </motion.button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div role="group" aria-label={`Quantity of ${line.name}`} className="hairline flex items-center rounded-full bg-black/20 p-0.5">
          <StepButton label={`Decrease quantity of ${line.name}`} testId={`decrease-qty-${id}`} disabled={locked || line.quantity <= 1} onClick={() => onDecrement(id)}>
            <Minus size={16} aria-hidden="true" />
          </StepButton>
          <span data-testid={`cart-qty-${id}`} className="tnum min-w-[2.2rem] text-center font-semibold" aria-label={`Quantity: ${line.quantity}`}>
            {line.quantity}
          </span>
          <StepButton label={`Increase quantity of ${line.name}`} testId={`increase-qty-${id}`} disabled={locked || line.quantity >= MAX_QUANTITY} onClick={() => onIncrement(id)}>
            <Plus size={16} aria-hidden="true" />
          </StepButton>
        </div>
        <p className="text-right">
          <span className="block text-xs text-[color:var(--color-muted)]">Line total</span>
          <AnimatedPrice value={line.lineTotal} className="title text-xl" data-testid={`cart-line-total-${id}`} />
        </p>
      </div>
    </motion.li>
  );
}

export function Cart({ lines, total, count, locked, onIncrement, onDecrement, onRemove, onBrowse }: Props) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div data-testid="cart" role="region" aria-labelledby="cart-title" className="glass-strong grain relative rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 id="cart-title" className="title flex items-center gap-3 text-2xl">
          <ShoppingBag size={22} className="text-[color:var(--color-cyan)]" aria-hidden="true" />
          Your cart
        </h3>
        <span className="hairline tnum rounded-full bg-white/5 px-3 py-1 text-sm text-[color:var(--color-muted)]" data-testid="cart-item-count">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      {lines.length === 0 ? (
        <div data-testid="cart-empty" className="hairline grid place-items-center rounded-2xl border-dashed px-6 py-12 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/5">
            <ShoppingBag size={24} className="text-[color:var(--color-muted)]" aria-hidden="true" />
          </div>
          <p className="font-medium">Your cart is empty</p>
          <p className="mt-1 max-w-xs text-sm text-[color:var(--color-muted)]">Add a NEXORA device from the collection to begin your order.</p>
          <button type="button" onClick={onBrowse} className="btn-glass mt-5 rounded-full px-5 py-2.5 text-sm">
            Browse the collection
          </button>
        </div>
      ) : (
        <ul className="space-y-3" data-testid="cart-lines" aria-label="Cart items">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.map((line) => (
              <CartLineItem key={line.productId} line={line} locked={locked} onIncrement={onIncrement} onDecrement={onDecrement} onRemove={onRemove} reduce={reduce} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <dl className="mt-7 space-y-2.5 border-t border-white/10 pt-5 text-sm">
        <div className="flex justify-between text-[color:var(--color-muted)]">
          <dt>Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex items-end justify-between pt-1">
          <dt className="text-base font-medium">Order total</dt>
          <dd>
            <AnimatedPrice value={total} className="title text-[2.1rem]" data-testid="cart-total" />
          </dd>
        </div>
      </dl>
    </div>
  );
}
