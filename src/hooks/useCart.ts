import { useCallback, useMemo, useReducer } from 'react';
import type { ProductId } from '../types';
import { EMPTY_CART, cartCount, cartReducer, cartTotal, priceLines } from '../utils/cart';

/** React binding for the pure cart reducer. Presentation components never touch the reducer directly. */
export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);

  const lines = useMemo(() => priceLines(state), [state]);
  const total = useMemo(() => cartTotal(state), [state]);
  const count = useMemo(() => cartCount(state), [state]);

  const add = useCallback((productId: ProductId) => dispatch({ type: 'add', productId }), []);
  const increment = useCallback((productId: ProductId) => dispatch({ type: 'increment', productId }), []);
  const decrement = useCallback((productId: ProductId) => dispatch({ type: 'decrement', productId }), []);
  const remove = useCallback((productId: ProductId) => dispatch({ type: 'remove', productId }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return { lines, total, count, add, increment, decrement, remove, clear };
}

export type CartApi = ReturnType<typeof useCart>;
