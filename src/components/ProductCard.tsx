import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Plus } from 'lucide-react';
import type { Product } from '../types';
import { formatINR } from '../utils/pricing';
import { easeOutExpo, springSnappy } from '../utils/motion';
import { useSpotlight } from '../hooks/useSpotlight';
import { ProductArt, POSE } from './ProductArt';
import { TiltStage } from './TiltStage';

interface Props {
  product: Product;
  index: number;
  inCart: number;
  onAdd: (id: Product['id']) => void;
}

const ACCENT = {
  cyan: { glow: 'rgba(56,225,255,0.2)', stage: 'radial-gradient(60% 70% at 50% 55%, rgba(56,225,255,0.22), transparent 70%)', chip: 'text-[color:var(--color-cyan)]' },
  violet: { glow: 'rgba(124,92,255,0.26)', stage: 'radial-gradient(60% 70% at 50% 55%, rgba(124,92,255,0.3), transparent 70%)', chip: 'text-[#b9a6ff]' },
} as const;

export function ProductCard({ product, index, inCart, onAdd }: Props) {
  const reduce = useReducedMotion() ?? false;
  const accent = ACCENT[product.accent];
  const spot = useSpotlight({ size: 460, color: accent.glow });
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleAdd = () => {
    onAdd(product.id);
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 1500);
  };

  const scale = product.id === 'quantum-mouse' ? 1.0 : 0.82;

  return (
    <motion.article
      data-testid={`product-card-${product.id}`}
      aria-labelledby={`title-${product.id}`}
      initial={reduce ? false : { opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: index * 0.14, ease: easeOutExpo }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="group glass-strong grain relative overflow-hidden rounded-[2rem]"
      {...spot.bind}
    >
      {/* Cursor-following light across the whole card */}
      <motion.div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: spot.background }} aria-hidden="true" />

      {/* 3D stage — only this region tilts; text and the button below stay perfectly still */}
      <div className="relative h-[19rem] overflow-hidden sm:h-[21rem]" aria-hidden="true" data-testid={`product-art-${product.id}`}>
        <div className="absolute inset-0" style={{ background: accent.stage }} />
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(60% 60% at 50% 55%, black, transparent)', WebkitMaskImage: 'radial-gradient(60% 60% at 50% 55%, black, transparent)' }}
        />
        <TiltStage max={13} className="absolute inset-0">
          <div className="animate-float grid h-full w-full place-items-center" style={{ ['--dur' as string]: `${7 + index}s` }}>
            <div className="p3d" style={{ transform: `scale(${scale}) ${POSE[product.id]}` }}>
              <ProductArt id={product.id} />
            </div>
          </div>
        </TiltStage>
      </div>

      <div className="relative z-[2] p-6 pt-2 sm:p-8 sm:pt-3">
        <p className={`eyebrow mb-2 ${accent.chip}`}>{product.tagline}</p>
        <h3 id={`title-${product.id}`} className="title text-[1.65rem] sm:text-[1.9rem]">
          {product.name}
        </h3>
        <p className="body-copy mt-3 text-[0.97rem] text-[color:var(--color-muted)]">{product.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${product.shortName} specifications`}>
          {product.specs.map((s) => (
            <li key={s} className="hairline rounded-full bg-white/5 px-3 py-1 text-[0.78rem] text-[color:var(--color-text)]/90">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[color:var(--color-muted)]">Fixed price</p>
            <p className="title tnum text-[2rem]" data-testid={`price-${product.id}`}>
              {formatINR(product.price)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {inCart > 0 && (
              <span className="text-sm text-[color:var(--color-muted)]" data-testid={`in-cart-${product.id}`}>
                {inCart} in cart
              </span>
            )}
            <motion.button
              type="button"
              data-testid={`add-to-cart-${product.id}`}
              onClick={handleAdd}
              whileTap={{ scale: 0.95 }}
              transition={springSnappy}
              className="btn-primary inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem]"
            >
              {justAdded ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              <span>{justAdded ? 'Added' : 'Add to Cart'}</span>
              <span className="sr-only"> — {product.name}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
