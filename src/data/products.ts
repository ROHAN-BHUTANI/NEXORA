import type { Product, ProductId } from '../types';

/** Exactly two synthetic products, with fixed prices (integer rupees). */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'quantum-mouse',
    name: 'NEXORA Quantum Mouse',
    shortName: 'Quantum Mouse',
    tagline: 'Precision, rendered in light.',
    description:
      'A featherweight, ambidextrous mouse with a virtual-quantum optical sensor, magnetic glide feet and a pulse-lit scroll ring. Built to disappear under your hand.',
    price: 799,
    specs: ['26K optical sensor', '54 g shell', '90 hr battery'],
    accent: 'cyan',
  },
  {
    id: 'mechanical-keyboard',
    name: 'NEXORA Mechanical Keyboard',
    shortName: 'Mechanical Keyboard',
    tagline: 'Every keystroke, a small event.',
    description:
      'A gasket-mounted 75% mechanical board with hot-swappable switches, a dampened aluminium-look chassis and aurora underglow that breathes with your typing.',
    price: 1999,
    specs: ['Hot-swap switches', 'Gasket mount', 'Per-key aurora glow'],
    accent: 'violet',
  },
] as const;

const BY_ID = new Map<ProductId, Product>(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: ProductId): Product {
  const product = BY_ID.get(id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}
