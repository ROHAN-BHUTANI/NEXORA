import { getProduct } from '../data/products';
import type { CartLine, PricedLine, ProductId } from '../types';
import { lineTotal, sumLines } from './pricing';

export const MAX_QUANTITY = 99;

export type CartState = readonly CartLine[];

export type CartAction =
  | { type: 'add'; productId: ProductId }
  | { type: 'increment'; productId: ProductId }
  | { type: 'decrement'; productId: ProductId }
  | { type: 'remove'; productId: ProductId }
  | { type: 'clear' };

export const EMPTY_CART: CartState = [];

/** Pure cart reducer — no React, no side effects, trivially unit-testable. */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
    case 'increment': {
      const existing = state.find((l) => l.productId === action.productId);
      if (!existing) return [...state, { productId: action.productId, quantity: 1 }];
      if (existing.quantity >= MAX_QUANTITY) return state;
      return state.map((l) =>
        l.productId === action.productId ? { ...l, quantity: l.quantity + 1 } : l,
      );
    }
    case 'decrement': {
      // Quantity never goes below 1 — removing a line is an explicit, separate action.
      return state.map((l) =>
        l.productId === action.productId && l.quantity > 1 ? { ...l, quantity: l.quantity - 1 } : l,
      );
    }
    case 'remove':
      return state.filter((l) => l.productId !== action.productId);
    case 'clear':
      return EMPTY_CART;
    default:
      return state;
  }
}

/** Join cart lines with product data and compute exact line totals. */
export function priceLines(state: CartState): PricedLine[] {
  return state.map((l) => {
    const product = getProduct(l.productId);
    return {
      productId: l.productId,
      name: product.name,
      unitPrice: product.price,
      quantity: l.quantity,
      lineTotal: lineTotal(product.price, l.quantity),
    };
  });
}

export function cartTotal(state: CartState): number {
  return sumLines(priceLines(state));
}

export function cartCount(state: CartState): number {
  return state.reduce((n, l) => n + l.quantity, 0);
}
