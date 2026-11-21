import { motion, useReducedMotion } from 'motion/react';
import { PRODUCTS } from '../data/products';
import type { PricedLine, ProductId } from '../types';
import { easeOutExpo } from '../utils/motion';
import { ProductCard } from './ProductCard';

interface Props {
  lines: readonly PricedLine[];
  onAdd: (id: ProductId) => void;
}

export function ProductShowcase({ lines, onAdd }: Props) {
  const reduce = useReducedMotion() ?? false;
  const qty = (id: ProductId) => lines.find((l) => l.productId === id)?.quantity ?? 0;

  return (
    <section id="products" aria-labelledby="products-title" className="relative isolate px-4 py-24 sm:px-8 lg:px-12 lg:py-32">
      {/* Ambient aurora */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="animate-drift absolute -left-[10%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-[color:var(--color-violet)]/25 blur-[120px]" style={{ ['--dur' as string]: '24s' }} />
        <div className="animate-drift absolute -right-[8%] top-[30%] h-[30rem] w-[30rem] rounded-full bg-[color:var(--color-cyan)]/18 blur-[120px]" style={{ ['--dur' as string]: '30s' }} />
        <div className="animate-drift absolute bottom-[4%] left-[30%] h-[26rem] w-[26rem] rounded-full bg-[color:var(--color-magenta)]/14 blur-[130px]" style={{ ['--dur' as string]: '27s' }} />
      </div>

      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="eyebrow mb-4 text-[color:var(--color-cyan)]">The collection</p>
          <h2 id="products-title" className="display text-[clamp(2.2rem,5vw,3.8rem)]">
            Two devices. <span className="text-gradient">Zero compromise.</span>
          </h2>
          <p className="body-copy mt-5 text-[color:var(--color-muted)]">
            Move your cursor across each product — they tilt, catch the light and respond. Then add them to your cart.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8" data-testid="product-grid">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} inCart={qty(p.id)} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}
