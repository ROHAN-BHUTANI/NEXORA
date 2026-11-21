import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { AnimatedPrice } from './AnimatedPrice';
import { scrollToId, springSnappy } from '../utils/motion';

interface Props {
  count: number;
  total: number;
  onCartClick: () => void;
}

const LINKS = [
  { id: 'products', label: 'Collection' },
  { id: 'checkout', label: 'Checkout' },
];

export function Navbar({ count, total, onCartClick }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [scrolled, setScrolled] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bump the badge whenever the count changes (skip first paint).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = badgeRef.current;
    if (!el || reduce) return;
    el.classList.remove('bump');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('bump');
  }, [count, reduce]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.nav
        aria-label="Primary"
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.7, delay: 0.1 }}
        className={`pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2 transition-[background-color,box-shadow] duration-300 ${
          scrolled ? 'glass-strong' : 'glass'
        }`}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
          }}
          className="flex items-center gap-2.5 rounded-full"
          aria-label="NEXORA — back to top"
        >
          <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="nx-logo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7c5cff" />
                <stop offset="1" stopColor="#38e1ff" />
              </linearGradient>
            </defs>
            <path d="M16 48V16l32 32V16" fill="none" stroke="url(#nx-logo)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[0.95rem] font-semibold tracking-[0.22em]">NEXORA</span>
        </a>

        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(l.id, reduce);
                }}
                className="rounded-full px-4 py-2 text-sm text-[color:var(--color-muted)] transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          data-testid="nav-cart-button"
          onClick={onCartClick}
          whileTap={{ scale: 0.95 }}
          transition={springSnappy}
          aria-label={`Open cart and checkout — ${count} ${count === 1 ? 'item' : 'items'}`}
          className="btn-glass flex items-center gap-2.5 rounded-full py-2 pl-3.5 pr-4 text-sm"
        >
          <span className="relative">
            <ShoppingBag size={18} aria-hidden="true" />
            <span
              ref={badgeRef}
              data-testid="cart-count"
              className="absolute -right-2.5 -top-2.5 grid min-w-[1.15rem] place-items-center rounded-full bg-[color:var(--color-cyan)] px-1 text-[0.68rem] font-bold leading-[1.15rem] text-[#04061a]"
            >
              {count}
            </span>
          </span>
          <span className="hidden min-w-[3.2rem] text-left font-medium sm:inline">
            <AnimatedPrice value={total} data-testid="nav-cart-total" />
          </span>
        </motion.button>
      </motion.nav>
    </header>
  );
}
