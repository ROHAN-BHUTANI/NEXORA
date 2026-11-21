import { useEffect } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { cameraSpring } from '../utils/motion';

/**
 * Normalised pointer position in [-1, 1], spring-smoothed. Drives the scene "camera".
 * Motion values update outside React's render cycle, so tracking never re-renders components.
 */
export function usePointerParallax() {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, cameraSpring);
  const y = useSpring(rawY, cameraSpring);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce, rawX, rawY]);

  return { x, y };
}
