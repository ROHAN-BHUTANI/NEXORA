import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { springSnappy, trackingSpring } from '../utils/motion';

type Variant = 'primary' | 'glass';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: Variant;
  /** Magnetic pull strength (fraction of cursor offset). Capped, and zero at the exact centre. */
  magnetism?: number;
  children: ReactNode;
}

/**
 * Magnetic button. Feedback starts on pointer-DOWN (Apple: respond immediately, commit on release),
 * and the magnetic offset is small and capped so the hit target never runs away from the cursor.
 */
export function MagneticButton({
  variant = 'primary',
  magnetism = 0.22,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, trackingSpring);
  const y = useSpring(my, trackingSpring);
  const MAX = 7;

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce || disabled || e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(Math.max(-MAX, Math.min(MAX, dx * magnetism)));
    my.set(Math.max(-MAX, Math.min(MAX, dy * magnetism)));
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      style={{ x, y }}
      whileTap={disabled ? undefined : { scale: 0.965 }}
      transition={springSnappy}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-glass'} relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
