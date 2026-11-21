export type ProductId = 'quantum-mouse' | 'mechanical-keyboard';

export interface Product {
  id: ProductId;
  name: string;
  /** Short label used in tight UI such as the cart HUD. */
  shortName: string;
  tagline: string;
  description: string;
  /** Fixed price in whole rupees (no paise — all NEXORA prices are integers). */
  price: number;
  specs: string[];
  accent: 'violet' | 'cyan';
}

export interface CartLine {
  productId: ProductId;
  quantity: number;
}

/** A cart line joined with its product data, ready to render or submit. */
export interface PricedLine {
  productId: ProductId;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  reference: string;
  idempotencyKey: string;
  customerName: string;
  lines: PricedLine[];
  total: number;
  status: 'confirmed';
  placedAt: string;
}

export interface CheckoutErrors {
  name?: string;
  cart?: string;
}

export type CheckoutStatus = 'idle' | 'processing' | 'success';
