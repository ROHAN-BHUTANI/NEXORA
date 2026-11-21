const ITEMS = [
  'Quantum sensing',
  'Gasket-mounted typing',
  'Aurora underglow',
  'Magnetic glide',
  'Hot-swap switches',
  'Instant checkout',
  'Experience Commerce Beyond Ordinary',
];

/** Decorative, seamless marquee that bridges the hero and the collection. */
export function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div aria-hidden="true" className="relative -mt-px overflow-hidden border-y border-white/10 bg-[#060818] py-4">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="eyebrow flex items-center gap-12 text-[color:var(--color-muted)]">
            {t}
            <span className="h-1 w-1 rounded-full bg-[color:var(--color-violet)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
