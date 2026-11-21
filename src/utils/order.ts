import type { CheckoutErrors, Order, PricedLine } from '../types';
import { sumLines } from './pricing';

export const NAME_MIN = 2;
export const NAME_MAX = 80;

/** Pure validation — returns an empty object when checkout may proceed. */
export function validateCheckout(customerName: string, lines: readonly PricedLine[]): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = customerName.trim();

  if (lines.length === 0) {
    errors.cart = 'Your cart is empty. Add at least one product before placing an order.';
  }
  if (name.length === 0) {
    errors.name = 'Customer name is required to place your order.';
  } else if (name.length < NAME_MIN) {
    errors.name = `Please enter your full name (at least ${NAME_MIN} characters).`;
  } else if (name.length > NAME_MAX) {
    errors.name = `Name is too long — please keep it under ${NAME_MAX} characters.`;
  }
  return errors;
}

// Unambiguous alphabet (no 0/O/1/I) so references are easy to read aloud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const issuedReferences = new Set<string>();

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
}

/** Unique, human-readable reference: NXR-YYYYMMDD-XXXXXXXX. Collision-checked within the session. */
export function generateOrderReference(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join('');
    const ref = `NXR-${date}-${suffix}`;
    if (!issuedReferences.has(ref)) {
      issuedReferences.add(ref);
      return ref;
    }
  }
  throw new Error('Could not allocate a unique order reference');
}

export function createIdempotencyKey(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(randomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SubmitPayload {
  idempotencyKey: string;
  customerName: string;
  lines: readonly PricedLine[];
}

const LATENCY_MS = Number(import.meta.env.VITE_ORDER_LATENCY_MS ?? 900);

// Server-side idempotency simulation: the same key always resolves to the same order,
// even if the request is replayed while the first one is still in flight.
const completed = new Map<string, Order>();
const inflight = new Map<string, Promise<Order>>();

declare global {
  interface Window {
    /** Dev/test-only audit trail of every order actually created (never present in production builds). */
    __NEXORA__?: { orders: Order[] };
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__NEXORA__ = { orders: [] };
}

export function submitOrder(payload: SubmitPayload): Promise<Order> {
  const done = completed.get(payload.idempotencyKey);
  if (done) return Promise.resolve(done);
  const pending = inflight.get(payload.idempotencyKey);
  if (pending) return pending;

  const promise = new Promise<Order>((resolve) => {
    window.setTimeout(() => {
      const lines = payload.lines.map((l) => ({ ...l }));
      const order: Order = {
        reference: generateOrderReference(),
        idempotencyKey: payload.idempotencyKey,
        customerName: payload.customerName.trim(),
        lines,
        total: sumLines(lines),
        status: 'confirmed',
        placedAt: new Date().toISOString(),
      };
      completed.set(payload.idempotencyKey, order);
      inflight.delete(payload.idempotencyKey);
      window.__NEXORA__?.orders.push(order);
      resolve(order);
    }, LATENCY_MS);
  });
  inflight.set(payload.idempotencyKey, promise);
  return promise;
}
