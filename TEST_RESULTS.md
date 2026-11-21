# NEXORA — Test Results (actual runs, 2026-11-21, Chromium headless, Playwright 1.63.0)

## Automated — `npx playwright test`
```
✓ 1 TEST 1 — successful checkout shows confirmation with an order reference            (5.4 s)
✓ 2 TEST 2 — missing customer name blocks checkout and shows a validation message      (3.3 s)
✓ 3 TEST 3 — quantity of two Quantum Mice totals exactly ₹1,598                        (4.1 s)
3 passed (13.5 s) · expected 3 · unexpected 0 · flaky 0 · skipped 0
```
Source: `test-results/results.json`; HTML report: `test-results/html-report/` (regenerate with `npm test`).
Also verified: `tsc -b` clean; `vite build` succeeds.

## Manual / exploratory — `npm run test:manual` (final run 20:40 UTC)
| Case | Observed |
|------|----------|
| **M1 Empty cart** | Message shown: "Your cart is empty. Add at least one product before placing an order." Confirmation count 0, **orders created 0**, name field still "Rohan Test", cart count 0. **Blocked correctly.** |
| **M2 Real double-click** (₹2,798 cart) | **1 order, 1 confirmation**, button was disabled during processing. Reference `NXR-20261121-DVBWPXK5`. No late second order after a 1.5 s observation window. |
| **M2b 10 sync clicks, one task** | **1 order, 1 confirmation.** |
| M3 Overflow | 1440: 1440/1440 · 820: 820/820 · 390: 390/390 (scrollWidth/clientWidth) → none |
| M4 Keyboard-only | Enter on Add to Cart → type name → Enter submits → confirmed; focus on `confirm-title` |
| M5 Two products | ₹1,598 + ₹1,999 = **₹3,597** (cart and summary agree) |
| M6 Reduced motion | checkout completes |
| M7 Console | **0 errors / page errors** across all runs |
| Spline runtime | `data-spline-runtime="off"` (no export URL configured) — parallax scene from the `.spline` shown |

## Defects
- **Found and fixed during this run:** after checkout, the confirmation heading showed a cyan focus box (global `:focus-visible` outranked Tailwind's `outline-none` on a programmatically focused heading). Fixed with an inline `outline: none`; re-screenshotted to confirm.
- **No functional defects found** in M1/M2.

## Evidence (all produced by the runs above)
`test-results/evidence/`: `manual1-empty-cart.png`, `manual2-confirmation.png`, `cart-checkout-desktop.png`, `confirmation-desktop.png`, `layout-{desktop,tablet,mobile}-hero.png`, `layout-{desktop,mobile}-products.png`, `reduced-motion-hero.png`.
Per-test screenshots: `test-results/artifacts/*/test{1,2,3}-*.png`. Raw data: `test-results/manual-observations.json`.

## Not tested
Real Spline runtime (no export), browsers other than Chromium, screen-reader testing, formal contrast audit tooling, DAST scan.
