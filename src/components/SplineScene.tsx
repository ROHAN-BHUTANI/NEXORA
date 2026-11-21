import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import type { MotionValue } from 'motion/react';
import { ParallaxScene } from './ParallaxScene';

/**
 * Spline integration — what is (and is not) possible with the supplied reference:
 *
 *  • The Community URL (app.spline.design/community/file/…) is an *editor* page, and the supplied
 *    `.spline` file is an *editor source* file. Neither can be loaded by the Spline web runtime.
 *  • The runtime (`@splinetool/react-spline`) needs an exported scene — a `…/scene.splinecode` URL that
 *    only exists after you open the file in Spline and use Export → Code (Viewer / React).
 *
 * Therefore this component works in two tiers, and never invents an export URL:
 *
 *  1. ALWAYS — `ParallaxScene`: the reference rebuilt from the layers embedded in the supplied file,
 *     with spring-smoothed pointer + scroll parallax. This is the guaranteed, zero-dependency path.
 *  2. OPTIONALLY — set `VITE_SPLINE_SCENE_URL` to a real exported `https://prod.spline.design/…` URL and the
 *     genuine Spline runtime is lazy-loaded and cross-fades in over the parallax scene. If it errors or
 *     times out, the parallax scene simply stays — the page (and checkout) is never blocked.
 */

const Spline = lazy(() => import('@splinetool/react-spline'));

const RAW_URL = (import.meta.env.VITE_SPLINE_SCENE_URL as string | undefined)?.trim();
const LOAD_TIMEOUT_MS = 12_000;

export function getExportedSplineUrl(raw: string | undefined = RAW_URL): string | null {
  if (!raw) return null;
  if (/app\.spline\.design\/community/i.test(raw)) {
    console.warn(
      '[NEXORA] VITE_SPLINE_SCENE_URL points at a Spline Community page, which is not an embeddable scene. ' +
        'Open the file in Spline → Export → Code → copy the https://prod.spline.design/…/scene.splinecode URL.',
    );
    return null;
  }
  return /^https:\/\/(prod|my)\.spline\.design\/[\w-]+(\/[\w.-]+)*$/i.test(raw) ? raw : null;
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _i: ErrorInfo) {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface Props {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  progress: MotionValue<number>;
  children?: ReactNode;
}

export function SplineScene({ pointerX, pointerY, progress, children }: Props) {
  const url = getExportedSplineUrl();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const runtimeActive = Boolean(url) && !failed;

  useEffect(() => {
    if (!runtimeActive || loaded) return;
    const t = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [runtimeActive, loaded]);

  return (
    <div className="absolute inset-0" data-testid="hero-scene" data-spline-runtime={runtimeActive ? (loaded ? 'loaded' : 'loading') : 'off'}>
      <ParallaxScene
        pointerX={pointerX}
        pointerY={pointerY}
        progress={progress}
        className={`transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      >
        {children}
      </ParallaxScene>
      {runtimeActive && url && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <Spline scene={url} onLoad={() => setLoaded(true)} />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
