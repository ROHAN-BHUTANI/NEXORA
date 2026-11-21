import { useCallback, useRef, useState } from 'react';
import type { CheckoutErrors, CheckoutStatus, Order, PricedLine } from '../types';
import { createIdempotencyKey, submitOrder, validateCheckout } from '../utils/order';

interface Options {
  lines: readonly PricedLine[];
  /** Called once, after an order has been confirmed — used to clear the cart. */
  onOrderPlaced: (order: Order) => void;
}

/**
 * Checkout state machine.
 *
 * Duplicate-order protection is layered:
 *  1. `lockRef` — a synchronous guard. React state updates are async, so two clicks in the same
 *     tick would both see `status === 'idle'`; the ref flips immediately and the 2nd call returns.
 *  2. `status === 'processing'` — disables the button and inputs for the user.
 *  3. A per-attempt idempotency key — even if (1) and (2) were bypassed, `submitOrder` resolves
 *     the same key to the same order instead of creating another.
 */
export function useCheckout({ lines, onOrderPlaced }: Options) {
  const [customerName, setCustomerNameState] = useState('');
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [order, setOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lockRef = useRef(false);
  const keyRef = useRef<string>(createIdempotencyKey());

  const setCustomerName = useCallback((value: string) => {
    setCustomerNameState(value);
    // Clear the name error as soon as the user starts correcting it.
    setErrors((prev) => (prev.name ? { ...prev, name: undefined } : prev));
  }, []);

  const clearCartError = useCallback(() => {
    setErrors((prev) => (prev.cart ? { ...prev, cart: undefined } : prev));
  }, []);

  const submit = useCallback(async (): Promise<void> => {
    if (lockRef.current) return; // synchronous duplicate-submit guard

    const found = validateCheckout(customerName, lines);
    if (found.cart || found.name) {
      // Blocked: show messages, keep the name and the cart exactly as they are.
      setErrors(found);
      return;
    }

    lockRef.current = true;
    setErrors({});
    setSubmitError(null);
    setStatus('processing');

    try {
      const placed = await submitOrder({
        idempotencyKey: keyRef.current,
        customerName,
        lines,
      });
      setOrder(placed);
      setStatus('success');
      onOrderPlaced(placed);
      // The lock intentionally stays set after success: the form is gone and cannot re-submit.
    } catch {
      lockRef.current = false;
      setStatus('idle');
      setSubmitError('We could not place your order. Your cart and details are safe — please try again.');
    }
  }, [customerName, lines, onOrderPlaced]);

  /** Start over after a confirmed order. */
  const reset = useCallback(() => {
    keyRef.current = createIdempotencyKey();
    lockRef.current = false;
    setCustomerNameState('');
    setErrors({});
    setSubmitError(null);
    setOrder(null);
    setStatus('idle');
  }, []);

  return {
    customerName,
    setCustomerName,
    errors,
    clearCartError,
    status,
    order,
    submitError,
    isProcessing: status === 'processing',
    submit,
    reset,
  };
}

export type CheckoutApi = ReturnType<typeof useCheckout>;
