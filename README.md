# NEXORA — Experience Commerce Beyond Ordinary.

Immersive commerce frontend for the **Fynd Hiring Hackathon (Nov 2026), SDET Intern track**.
React 19 · Vite · TypeScript · Tailwind CSS 4 · Motion · Spline runtime (optional tier) · Lucide · Playwright.

## Run it

```bash
npm install
npm run dev            # http://127.0.0.1:5173
npm test               # 3 Playwright tests (starts the dev server itself)
npm run test:manual    # scripted exploratory checks -> test-results/manual-observations.json (+ screenshots)
npm run build          # type-check + production build
```
Playwright needs a Chromium: `npx playwright install chromium` (if not already installed).

## Features
- Two synthetic products at fixed prices: **Quantum Mouse ₹799**, **Mechanical Keyboard ₹1,999**.
- Cart: add, remove, increment, decrement (min 1; remove is a separate action), per-line totals, exact order total — all integer-rupee maths, Indian digit grouping.
- Checkout: required customer name, order summary, final total, Place Order. Empty cart and empty name are both blocked with visible messages; the typed name and the cart are never discarded on a failed attempt.
- Confirmation: unique reference `NXR-YYYYMMDD-XXXXXXXX`, customer name, products, quantities, total, status, animated success.
- **Duplicate-order protection (3 layers)** — see `src/hooks/useCheckout.ts`: (1) a synchronous `useRef` lock, (2) `processing` state disables the button and inputs, (3) a per-attempt idempotency key resolved to a single order in `submitOrder`.
- Reduced motion, keyboard operation, `prefers-reduced-transparency` / `prefers-contrast` fallbacks, no horizontal overflow at 390 / 820 / 1440 px.

## Design & motion
Apple "fluid interface" principles (from the Apple-design skill guide): springs with bounce 0 by default instead of fixed-duration easing; buttons react on pointer-**down**; pointer-tracked values are spring-smoothed motion values (no React re-render per mouse move); translucent `backdrop-filter` materials; tabular numerals for prices; magnetic offset capped at 7px so hit targets never run away from the cursor. Only the product *art* tilts — text and the Add-to-Cart button never move under the pointer.

## The Spline reference — what is and is not integrated (read this)
- The Community URL is an **editor page**, and the supplied `parallax_interactive_website_classic.spline` is an **editor source file**. Neither can be loaded by the Spline web runtime (`@splinetool/react-spline`), which requires an exported `https://prod.spline.design/…/scene.splinecode`. That URL only exists after opening the file in Spline and using **Export → Code**. No export URL was supplied, and none is invented here.
- I did not open the Community URL itself; the design reference used is the supplied `.spline` file.
- **Tier 1 (always on, verified):** `ParallaxScene` rebuilds the reference from the raster layers embedded in the `.spline` file (sky, lake, hill, tree, figures, cloud puffs, ground — cropped WebP in `src/assets/scene/`), with spring-smoothed pointer + scroll parallax, depth-sandwiched NEXORA wordmark, cursor spotlight and glass lens. Floating CSS-3D product models and tilt cards sit on top.
- **Tier 2 (optional, NOT verified):** set `VITE_SPLINE_SCENE_URL` to a real exported scene URL and the genuine runtime is lazy-loaded and cross-fades in; on error/timeout (12 s) the parallax scene stays. **This path was not exercised against a real export** because none exists in this workspace. `data-testid="hero-scene"` exposes `data-spline-runtime="off|loading|loaded"`.
- The 3D layer is decorative: checkout works whether or not it loads.

## Structure
```
src/components/  Navbar Hero SplineScene ParallaxScene ProductShowcase ProductCard ProductArt TiltStage
                 Cart CheckoutForm OrderConfirmation MagneticButton AnimatedPrice Ticker
src/hooks/       useCart useCheckout usePointerParallax useSpotlight
src/utils/       cart.ts (reducer)  pricing.ts  order.ts (validation, reference, idempotent submit)  motion.ts
tests/checkout.spec.ts   scripts/manual-checks.mjs   test-results/
```
Business logic (`utils/`, `hooks/`) is React-free or presentation-free; components only render.

## Known limitations
- No backend: `submitOrder` simulates a ~900 ms server call (`VITE_ORDER_LATENCY_MS`) and keeps orders in memory. Refreshing the page clears the cart and orders by design (clean state per session).
- `window.__NEXORA__.orders` (dev builds only) is an audit trail used by the manual checks to count orders actually created.
- Spline runtime chunk (~4 MB, 1.08 MB gzip) is code-split and only fetched when `VITE_SPLINE_SCENE_URL` is set.
- A HawkScan DAST security scan was not run (no API key available in this environment).
