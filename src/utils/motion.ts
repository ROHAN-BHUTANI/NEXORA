/**
 * Motion presets, following Apple's "fluid interfaces" guidance:
 *  - springs (damping + response) instead of fixed-duration easing,
 *  - critically damped (bounce 0) by default; bounce only for momentum-driven moments,
 *  - interruptible — Motion springs always start from the current value and carry velocity.
 */
export const spring = { type: 'spring', bounce: 0, duration: 0.45 } as const;
export const springSnappy = { type: 'spring', bounce: 0, duration: 0.3 } as const;
export const springPlayful = { type: 'spring', bounce: 0.28, duration: 0.6 } as const;

/** Config for useSpring() on pointer-tracked values (stiffness/damping form). */
export const trackingSpring = { stiffness: 140, damping: 22, mass: 0.6 } as const;
/** Slower, heavier spring for the "camera" — deeper layers feel weightier. */
export const cameraSpring = { stiffness: 60, damping: 17, mass: 0.9 } as const;

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function scrollToId(id: string, reduceMotion: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  // Move focus for keyboard / screen-reader users once the target is reachable.
  if (el.tabIndex < 0) el.tabIndex = -1;
  el.focus({ preventScroll: true });
}
