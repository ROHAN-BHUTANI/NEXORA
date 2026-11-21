import { useMotionValue, useReducedMotion, useSpring, useMotionTemplate, type MotionValue } from 'motion/react';
import { trackingSpring } from '../utils/motion';

interface Options {
  size?: number;
  /** rgba() colour at the centre of the spotlight. */
  color?: string;
}

/**
 * Cursor-following spotlight. Returns a `background` MotionValue to place on an overlay, plus handlers
 * for the container. Updates bypass React rendering entirely.
 */
export function useSpotlight({ size = 420, color = 'rgba(124,92,255,0.22)' }: Options = {}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, trackingSpring);
  const sy = useSpring(y, trackingSpring);
  const background: MotionValue<string> = useMotionTemplate`radial-gradient(${size}px circle at ${sx}px ${sy}px, ${color}, transparent 65%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };
  const onPointerLeave = () => {
    x.set(-9999);
    y.set(-9999);
  };

  return { background, x: sx, y: sy, bind: { onPointerMove, onPointerLeave } };
}
