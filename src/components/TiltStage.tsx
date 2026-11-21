import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { trackingSpring } from '../utils/motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  /**
   * Optional external pointer in [-1, 1] (e.g. the hero camera). When omitted, the stage tracks
   * the pointer over its own bounds.
   */
  external?: { x: MotionValue<number>; y: MotionValue<number> };
  perspective?: number;
}

/**
 * Perspective container that tilts its children toward the pointer. Purely visual: it sets no
 * pointer-events of its own beyond tracking, so buttons placed next to it are never affected.
 */
export function TiltStage({ children, className = '', max = 12, external, perspective = 1100 }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, trackingSpring);
  const sy = useSpring(py, trackingSpring);

  const srcX = external?.x ?? sx;
  const srcY = external?.y ?? sy;
  const k = external ? max : max * 2; // own pointer is in [-0.5, 0.5]
  const rotateY = useTransform(srcX, (v) => v * k);
  const rotateX = useTransform(srcY, (v) => -v * k);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || external || e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className="p3d h-full w-full"
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY }}
      >
        {children}
      </motion.div>
    </div>
  );
}
