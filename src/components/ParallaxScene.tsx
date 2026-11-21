import { memo, type ReactNode } from 'react';
import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { SCENE_LAYERS } from '../assets/scene/manifest';

/**
 * The reference scene, rebuilt for the web.
 *
 * The supplied `parallax_interactive_website_classic.spline` is an editor source file; it embeds eleven
 * raster layers (sky, horizon clouds, lake, hills, trees, ground and the figures) arranged on a 1440×960
 * canvas, with an orthographic camera and mouse-hover events. Those exact layers are used here, each at
 * its original canvas position, and the "camera" is reproduced with spring-smoothed pointer + scroll
 * parallax: nearer layers travel further, exactly like the reference.
 */

interface LayerDef {
  id: keyof typeof SCENE_LAYERS;
  /** Parallax depth multiplier — larger = closer to camera. */
  depth: number;
  /** Idle float period in seconds (floating figures). */
  float?: number;
  priority?: boolean;
}

const BACK: LayerDef[] = [
  { id: 'sky', depth: 0.18, priority: true },
  { id: 'horizon-clouds', depth: 0.3 },
  { id: 'lake', depth: 0.42 },
  { id: 'hill', depth: 0.52 },
  { id: 'puff', depth: 0.62, float: 11 },
];

const FRONT: LayerDef[] = [
  { id: 'tree', depth: 0.85 },
  { id: 'ground', depth: 1.05 },
  { id: 'europa-group', depth: 1.2, float: 9 },
  { id: 'figure-reclining', depth: 1.4, float: 7 },
  { id: 'figure-walker', depth: 1.55, float: 8 },
  { id: 'figure-reaching', depth: 1.7, float: 10 },
];

const AMP_X = 30; // px of travel per unit depth, at full pointer deflection
const AMP_Y = 18;
const SCROLL_Y = 70; // px of scroll-linked travel per unit depth, over the hero's height

interface LayerProps extends LayerDef {
  px: MotionValue<number>;
  py: MotionValue<number>;
  progress: MotionValue<number>;
  reduce: boolean;
}

function Layer({ id, depth, float, priority, px, py, progress, reduce }: LayerProps) {
  const l = SCENE_LAYERS[id];
  const x = useTransform(px, (v) => (reduce ? 0 : -v * depth * AMP_X));
  const y = useTransform([py, progress] as MotionValue<number>[], (vals: number[]) =>
    reduce ? 0 : -vals[0] * depth * AMP_Y + vals[1] * depth * SCROLL_Y,
  );

  return (
    <motion.div
      className="absolute"
      style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`, x, y, willChange: 'transform' }}
    >
      <div
        className={float ? 'animate-float h-full w-full' : 'h-full w-full'}
        style={float ? ({ '--dur': `${float}s`, animationDelay: `-${(float * 0.37).toFixed(1)}s` } as React.CSSProperties) : undefined}
      >
        <img
          src={l.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          loading="eager"
          fetchPriority={priority ? 'high' : 'auto'}
          className="pointer-events-none h-full w-full select-none"
        />
      </div>
    </motion.div>
  );
}

interface StageProps {
  layers: LayerDef[];
  px: MotionValue<number>;
  py: MotionValue<number>;
  progress: MotionValue<number>;
  reduce: boolean;
  z: number;
}

/** Every stage shares identical geometry so layers across stages stay registered to one canvas. */
function Stage({ layers, px, py, progress, reduce, z }: StageProps) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        width: 'max(108%, calc(var(--hero-h) * 1.62))',
        aspectRatio: '1440 / 960',
        zIndex: z,
      }}
    >
      {layers.map((layer) => (
        <Layer key={layer.id} {...layer} px={px} py={py} progress={progress} reduce={reduce} />
      ))}
    </div>
  );
}

interface Props {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  /** 0 → 1 as the hero scrolls out of view. */
  progress: MotionValue<number>;
  /** Rendered between the back and front stages (the depth-sandwiched wordmark). */
  children?: ReactNode;
  className?: string;
}

export const ParallaxScene = memo(function ParallaxScene({ pointerX, pointerY, progress, children, className = '' }: Props) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true" data-testid="parallax-scene">
      <Stage layers={BACK} px={pointerX} py={pointerY} progress={progress} reduce={reduce} z={0} />
      {/* Atmospheric perspective: distant layers are graded into NEXORA's midnight/violet palette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(6,8,24,0.78) 0%, rgba(22,26,92,0.5) 38%, rgba(40,30,120,0.28) 68%, rgba(6,8,24,0.2) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ zIndex: 1, background: 'radial-gradient(80% 70% at 30% 20%, rgba(124,92,255,0.55), transparent 70%), radial-gradient(60% 60% at 85% 35%, rgba(56,225,255,0.35), transparent 70%)' }}
      />
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {children}
      </div>
      <Stage layers={FRONT} px={pointerX} py={pointerY} progress={progress} reduce={reduce} z={3} />
    </div>
  );
});
