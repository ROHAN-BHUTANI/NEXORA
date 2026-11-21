# NEXORA — Test Plan

## Scope
Cart arithmetic, checkout validation, order confirmation, duplicate-submit protection, and basic layout/accessibility safety. Out of scope: real payments/back-end, cross-browser (Chromium only), visual-regression diffing, the optional Spline runtime tier (no export available).

## Approach
- **Automated (Playwright, `tests/checkout.spec.ts`)** — the three required scenarios. Rules: stable `data-testid` selectors, a fresh browser context per test (independent state; cart is in-memory), only auto-retrying `expect` assertions, **no fixed sleeps**, `retries: 0` so flakiness is visible.
- **Manual / exploratory (`scripts/manual-checks.mjs`)** — the two required manual scenarios plus layout, keyboard and reduced-motion checks, driven through a real Chromium with real mouse/keyboard events. Observations are measured and written to `test-results/manual-observations.json`; nothing is pre-filled. *Honest note: these were executed by script, not by a person clicking by hand.*

## Automated cases
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| T1 | Successful checkout | clean state → add Quantum Mouse → name "Aarav Sharma" → Place Order | confirmation visible; status "Order confirmed"; reference matches `NXR-\d{8}-[A-Z2-9]{8}`; name/qty/total shown |
| T2 | Missing required field | clean state → add product → leave name empty → Place Order | checkout blocked; `name-error` visible; field `aria-invalid`; no confirmation; cart intact (₹799) |
| T3 | Exact quantity maths | clean state → add Quantum Mouse → increase to 2 | qty 2; line total ₹1,598; order total ₹1,598 |

## Manual / exploratory cases
| ID | Scenario | Expected |
|----|----------|----------|
| M1 | Checkout with **empty cart** (name filled) | blocked; cart-empty message; 0 orders created; typed name preserved |
| M2 | **Rapid double-click** on Place Order (cart: mouse + keyboard) | exactly 1 order and 1 confirmation; button disabled while processing |
| M2b | 10 synchronous `click()` calls in one JS task | still exactly 1 order (proves the ref guard, not just the disabled button) |
| M3 | Horizontal overflow at 1440 / 820 / 390 px | none |
| M4 | Keyboard-only checkout | completes; focus moves to confirmation heading |
| M5 | Two-product maths | ₹1,598 + ₹1,999 = ₹3,597 |
| M6 | `prefers-reduced-motion: reduce` | checkout works |
| M7 | Console errors during all runs | none |

## Entry / exit
Entry: `npm install`, Chromium available. Exit: 3/3 automated pass, all manual expectations met, `tsc` and `vite build` clean.
