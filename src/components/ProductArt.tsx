import { memo, type CSSProperties } from 'react';
import type { ProductId } from '../types';

/**
 * Real CSS-3D product models: stacked slices give genuine extrusion, so the objects read as solid
 * forms when the TiltStage rotates them. No images, no WebGL — they render instantly and can't "fail to load".
 */

type KeyDef = readonly [unit: number, accent?: 'violet' | 'cyan'];
const ones = (n: number): KeyDef[] => Array.from({ length: n }, () => [1] as const);

// Each row sums to 15 units, like a compact 75% layout.
const KB_ROWS: KeyDef[][] = [
  [[1, 'violet'], ...ones(12), [2]],
  [[1.5], ...ones(12), [1.5]],
  [[1.75], ...ones(11), [2.25, 'cyan']],
  [[2.25], ...ones(10), [2.75]],
  [[1.25], [1.25], [1.25], [6.25], [1.25], [1.25], [1.25], [1.25]],
];

const KB_SLICES = 7;
const MOUSE_RADIUS = '62px 62px 74px 74px / 78px 78px 120px 120px';
const MOUSE_SLICES = 15;

function KeyboardModel() {
  return (
    <div className="kb p3d" aria-hidden="true">
      <div className="model-shadow" style={{ width: 440, height: 130, marginLeft: -220, marginTop: -50, transform: 'translateZ(-46px)' }} />
      <div className="glow-ring" style={{ borderRadius: 26, transform: 'translateZ(-6px)' }} />
      {Array.from({ length: KB_SLICES }, (_, i) => {
        const top = i === KB_SLICES - 1;
        const style: CSSProperties = {
          transform: `translateZ(${i * 2}px)`,
          background: top
            ? 'linear-gradient(155deg, #272e78 0%, #121744 55%, #0b0e2e 100%)'
            : `hsl(233 48% ${12 + i * 1.4}%)`,
          boxShadow: top ? 'inset 0 1px 0 rgba(255,255,255,.3), inset 0 0 0 1.5px rgba(255,255,255,.07)' : undefined,
        };
        return <div key={i} className="kb-slice" style={style} />;
      })}
      <div className="kb-keys" style={{ transform: `translateZ(${(KB_SLICES - 1) * 2}px)` }}>
        {KB_ROWS.map((row, r) => (
          <div className="kb-row" key={r}>
            {row.map(([unit, accent], k) => (
              <div className="kb-key" key={k} style={{ flex: unit }}>
                <div className={`kb-cap ${accent ? `accent-${accent}` : ''}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MouseModel() {
  return (
    <div className="mouse p3d" aria-hidden="true">
      <div className="model-shadow" style={{ width: 160, height: 250, marginLeft: -80, marginTop: -110, transform: 'translateZ(-40px)' }} />
      <div className="glow-ring" style={{ borderRadius: MOUSE_RADIUS, transform: 'translateZ(-6px)' }} />
      {Array.from({ length: MOUSE_SLICES }, (_, i) => (
        <div
          key={i}
          className="mouse-slice"
          style={{ transform: `translateZ(${i * 2}px)`, background: `hsl(228 46% ${13 + i * 1.3}%)` }}
        />
      ))}
      {/* Top cap with button seams, scroll ring and LED strip */}
      <div
        className="mouse-slice"
        style={{
          transform: `translateZ(${MOUSE_SLICES * 2}px)`,
          overflow: 'hidden',
          background: 'linear-gradient(150deg, #2f3790 0%, #161b4c 48%, #0c1034 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), inset 0 0 0 1.5px rgba(255,255,255,.08)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.22), transparent 38%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: '44%', marginLeft: -1, background: 'rgba(3,5,20,.75)', boxShadow: '1px 0 0 rgba(255,255,255,.12)' }} />
        <div style={{ position: 'absolute', left: '7%', right: '7%', top: '44%', height: 2, background: 'rgba(3,5,20,.6)', boxShadow: '0 1px 0 rgba(255,255,255,.1)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '14%', width: 15, height: 38, marginLeft: -7.5, borderRadius: 9, background: 'linear-gradient(180deg,#9af3ff,#2bbfe0)', boxShadow: '0 0 14px 2px rgba(56,225,255,.75), inset 0 1px 0 rgba(255,255,255,.7)' }} />
        <div style={{ position: 'absolute', left: '24%', right: '24%', bottom: '9%', height: 5, borderRadius: 4, background: 'linear-gradient(90deg,#38e1ff,#7c5cff,#ff4fd8)', boxShadow: '0 0 12px rgba(124,92,255,.9)' }} />
      </div>
    </div>
  );
}

interface Props {
  id: ProductId;
}

export const ProductArt = memo(function ProductArt({ id }: Props) {
  return id === 'quantum-mouse' ? <MouseModel /> : <KeyboardModel />;
});

/** Static isometric "pose" for each model, applied before the interactive tilt. */
export const POSE: Record<ProductId, string> = {
  'quantum-mouse': 'rotateX(56deg) rotateZ(-28deg)',
  'mechanical-keyboard': 'rotateX(58deg) rotateZ(-24deg)',
};
