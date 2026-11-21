import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useMotionValue, useTransform } from 'motion/react';
import { ArrowRight, ChevronDown, ShoppingBag } from 'lucide-react';
import { SplineScene } from './SplineScene';
import { MagneticButton } from './MagneticButton';
import { ProductArt, POSE } from './ProductArt';
import { TiltStage } from './TiltStage';
import { usePointerParallax } from '../hooks/usePointerParallax';
import { useSpotlight } from '../hooks/useSpotlight';
import { easeOutExpo, scrollToId, trackingSpring } from '../utils/motion';

const rise = (i: number) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay: 0.25 + i * 0.1, ease: easeOutExpo },
});

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const pointer = usePointerParallax();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const spot = useSpotlight({ size: 560, color: 'rgba(124,92,255,0.24)' });

  // Glass "lens" that trails the cursor
  const lx = useMotionValue(-999);
  const ly = useMotionValue(-999);
  const lensX = useSpring(lx, { stiffness: 55, damping: 16, mass: 1 });
  const lensY = useSpring(ly, { stiffness: 55, damping: 16, mass: 1 });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.0]);
  const wordY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
      style={{ ['--hero-h' as string]: 'clamp(760px, 100svh, 1120px)', height: 'var(--hero-h)' }}
      onPointerMove={(e) => {
        spot.bind.onPointerMove(e);
        if (reduce || e.pointerType === 'touch') return;
        const r = e.currentTarget.getBoundingClientRect();
        lx.set(e.clientX - r.left - 70);
        ly.set(e.clientY - r.top - 70);
      }}
      onPointerLeave={() => {
        spot.bind.onPointerLeave();
        lx.set(-999);
        ly.set(-999);
      }}
    >
      <SplineScene pointerX={pointer.x} pointerY={pointer.y} progress={scrollYProgress}>
        {/* Depth-sandwiched wordmark: behind the figures and trees, in front of the sky */}
        <motion.div
          className="absolute inset-x-0 top-[6%] flex justify-center"
          style={{ y: wordY }}
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: easeOutExpo }}
        >
          <span
            className="display select-none whitespace-nowrap"
            style={{
              fontSize: 'clamp(5.2rem, 23vw, 25rem)',
              letterSpacing: '-0.055em',
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96) 6%, rgba(205,214,255,0.55) 55%, rgba(124,92,255,0.18) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.35)',
              filter: 'drop-shadow(0 30px 60px rgba(6,8,24,0.55))',
            }}
          >
            NEXORA
          </span>
        </motion.div>
      </SplineScene>

      {/* Grading: navbar legibility + seamless handoff into the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-40 bg-gradient-to-b from-[#060818]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[38%] bg-gradient-to-t from-[#060818] via-[#060818]/70 to-transparent" />
      <motion.div className="pointer-events-none absolute inset-0 z-[6] mix-blend-screen" style={{ background: spot.background }} aria-hidden="true" />

      {/* Glass lens (fine pointers only) */}
      <motion.div
        aria-hidden="true"
        className="only-hover pointer-events-none absolute left-0 top-0 z-[7] h-[140px] w-[140px] rounded-full"
        style={{
          x: lensX,
          y: lensY,
          WebkitBackdropFilter: 'blur(3px) saturate(1.5) brightness(1.12)',
          backdropFilter: 'blur(3px) saturate(1.5) brightness(1.12)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.18), 0 0 60px rgba(124,92,255,0.35)',
        }}
      />

      {/* Floating 3D products, driven by the same camera as the scene */}
      <div className="pointer-events-none absolute bottom-[7%] right-[2%] z-[8] hidden h-[48%] w-[42%] max-w-[640px] md:block" aria-hidden="true" data-testid="hero-objects">
        <TiltStage external={pointer} max={14} className="h-full w-full">
          <div className="animate-float absolute left-[2%] top-[4%]" style={{ ['--dur' as string]: '8s' }}>
            <div className="p3d" style={{ transform: `scale(0.62) ${POSE['quantum-mouse']}` }}>
              <ProductArt id="quantum-mouse" />
            </div>
          </div>
          <div className="animate-float absolute bottom-[8%] right-[6%]" style={{ ['--dur' as string]: '9.5s', animationDelay: '-3s' }}>
            <div className="p3d" style={{ transform: `scale(0.78) ${POSE['mechanical-keyboard']}` }}>
              <ProductArt id="mechanical-keyboard" />
            </div>
          </div>
        </TiltStage>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-[10] mx-auto flex h-full max-w-[1400px] items-center px-4 pb-24 pt-28 sm:px-8 lg:px-12"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="glass-strong grain relative max-w-[34rem] rounded-[2rem] p-6 sm:p-9">
          <motion.p {...rise(0)} className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[color:var(--color-cyan)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)]" aria-hidden="true" />
            Intelligent commerce · 2026
          </motion.p>

          <motion.h1 id="hero-title" {...rise(1)} className="display text-[clamp(2.6rem,6.4vw,4.6rem)]">
            Experience Commerce <span className="text-gradient">Beyond Ordinary.</span>
          </motion.h1>

          <motion.p {...rise(2)} className="body-copy mt-5 max-w-md text-[1.02rem] text-[color:var(--color-muted)]">
            NEXORA fuses a painterly parallax world with precision hardware. Explore two flagship devices in depth, build your cart, and check out in seconds.
          </motion.p>

          <motion.div {...rise(3)} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton data-testid="hero-cta-explore" onClick={() => scrollToId('products', reduce)}>
              Explore the collection
              <ArrowRight size={18} aria-hidden="true" />
            </MagneticButton>
            <MagneticButton variant="glass" data-testid="hero-cta-checkout" onClick={() => scrollToId('checkout', reduce)}>
              <ShoppingBag size={17} aria-hidden="true" />
              Go to checkout
            </MagneticButton>
          </motion.div>

          <motion.ul {...rise(4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:var(--color-muted)]">
            <li>2 flagship devices</li>
            <li aria-hidden="true">·</li>
            <li>From ₹799</li>
            <li aria-hidden="true">·</li>
            <li>Instant checkout</li>
          </motion.ul>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToId('products', reduce)}
        aria-label="Scroll to the collection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-[10] grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full btn-glass"
      >
        <ChevronDown size={18} className="animate-float" style={{ ['--dur' as string]: '2.4s' }} aria-hidden="true" />
      </motion.button>
    </section>
  );
}

// Re-exported so spring tuning for the hero stays discoverable next to its consumer.
export { trackingSpring };
