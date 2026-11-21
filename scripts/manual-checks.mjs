// Scripted exploratory checks run in a real Chromium against the live dev server.
// Every observation below is measured at run time and written to test-results/manual-observations.json — nothing is pre-filled.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const OUT = 'test-results/evidence';
mkdirSync(OUT, { recursive: true });
const obs = { ranAt: new Date().toISOString(), baseUrl: BASE, scenarios: {} };
const browser = await chromium.launch();

const orders = (page) => page.evaluate(() => window.__NEXORA__?.orders.length ?? -1);
const consoleErrors = [];
async function fresh(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  await page.goto(BASE);
  await page.getByTestId('cart-count').waitFor();
  return { ctx, page };
}

// ── Manual scenario 1: checkout with an EMPTY cart ─────────────────────────────
{
  const { ctx, page } = await fresh();
  await page.getByTestId('customer-name-input').fill('Rohan Test');
  await page.getByTestId('place-order-button').click();
  await page.getByTestId('cart-error').waitFor();
  await page.getByTestId('checkout-form').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600); // let entrance animations settle before the screenshot only
  await page.screenshot({ path: `${OUT}/manual1-empty-cart.png` });
  obs.scenarios.emptyCartCheckout = {
    cartErrorText: await page.getByTestId('cart-error').innerText(),
    confirmationVisible: await page.getByTestId('order-confirmation').count(),
    ordersCreated: await orders(page),
    nameFieldPreserved: await page.getByTestId('customer-name-input').inputValue(),
    cartCount: await page.getByTestId('cart-count').innerText(),
  };
  await ctx.close();
}

// ── Manual scenario 2: rapid double-click on Place Order ───────────────────────
{
  const { ctx, page } = await fresh();
  await page.getByTestId('add-to-cart-quantum-mouse').click();
  await page.getByTestId('add-to-cart-mechanical-keyboard').click();
  await page.getByTestId('customer-name-input').fill('Rapid Clicker');
  const btn = page.getByTestId('place-order-button');
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // (a) a genuine double-click (two real mouse clicks, zero delay)
  await btn.dblclick({ delay: 0 });
  const disabledDuring = await btn.isDisabled();
  await page.getByTestId('order-confirmation').waitFor();
  await page.waitForTimeout(1500); // observation window: would a 2nd order land late?
  const a = { ordersCreated: await orders(page), confirmations: await page.getByTestId('order-confirmation').count(), buttonDisabledDuringProcessing: disabledDuring, reference: await page.getByTestId('order-reference').innerText(), total: await page.getByTestId('order-total').innerText() };
  await page.screenshot({ path: `${OUT}/manual2-confirmation.png` });
  await ctx.close();

  // (b) stress: 10 synchronous click() calls inside one JS task (bypasses React re-render between clicks)
  const { ctx: c2, page: p2 } = await fresh();
  await p2.getByTestId('add-to-cart-quantum-mouse').click();
  await p2.getByTestId('customer-name-input').fill('Burst Clicker');
  await p2.evaluate(() => { const b = document.querySelector('[data-testid="place-order-button"]'); for (let i = 0; i < 10; i++) b.click(); });
  await p2.getByTestId('order-confirmation').waitFor();
  await p2.waitForTimeout(1500);
  const b2 = { ordersCreated: await orders(p2), confirmations: await p2.getByTestId('order-confirmation').count() };
  await c2.close();
  obs.scenarios.rapidDoubleClick = { realDoubleClick: a, tenSynchronousClicksInOneTask: b2 };
}

// ── Layout / overflow / keyboard / reduced-motion / failed-3D ──────────────────
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['tablet', { width: 820, height: 1100 }], ['mobile', { width: 390, height: 844 }]]) {
  const { ctx, page } = await fresh({ viewport: vp, hasTouch: name === 'mobile', isMobile: name === 'mobile' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/layout-${name}-hero.png` });
  const m = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  (obs.scenarios.horizontalOverflow ??= {})[name] = { ...m, overflows: m.scrollW > m.clientW };
  if (name !== 'tablet') {
    await page.getByTestId('add-to-cart-quantum-mouse').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/layout-${name}-products.png` });
  }
  await ctx.close();
}

{ // keyboard-only checkout
  const { ctx, page } = await fresh();
  await page.getByTestId('add-to-cart-quantum-mouse').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('customer-name-input').focus();
  await page.keyboard.type('Keyboard User');
  await page.keyboard.press('Enter'); // submit via Enter in the form
  await page.getByTestId('order-confirmation').waitFor();
  obs.scenarios.keyboardOnlyCheckout = { confirmed: true, focusedElementAfterConfirm: await page.evaluate(() => document.activeElement?.id), reference: await page.getByTestId('order-reference').innerText() };
  await page.waitForTimeout(1600);
  await page.getByTestId('order-confirmation').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/confirmation-desktop.png` });
  await ctx.close();
}

{ // checkout section visuals (cart with both products, filled form)
  const { ctx, page } = await fresh();
  await page.getByTestId('add-to-cart-quantum-mouse').click();
  await page.getByTestId('add-to-cart-mechanical-keyboard').click();
  await page.getByTestId('increase-qty-quantum-mouse').click();
  await page.getByTestId('customer-name-input').fill('Aarav Sharma');
  await page.getByTestId('checkout-form').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/cart-checkout-desktop.png` });
  obs.scenarios.twoProductMath = { mouseLine: await page.getByTestId('cart-line-total-quantum-mouse').innerText(), keyboardLine: await page.getByTestId('cart-line-total-mechanical-keyboard').innerText(), total: await page.getByTestId('cart-total').innerText(), expected: '₹1,598 + ₹1,999 = ₹3,597' };
  await ctx.close();
}

{ // reduced motion
  const { ctx, page } = await fresh({ reducedMotion: 'reduce' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/reduced-motion-hero.png` });
  await page.getByTestId('add-to-cart-quantum-mouse').click();
  await page.getByTestId('customer-name-input').fill('Reduced Motion');
  await page.getByTestId('place-order-button').click();
  await page.getByTestId('order-confirmation').waitFor();
  obs.scenarios.reducedMotion = { checkoutWorks: true };
  await ctx.close();
}

{ // Spline runtime state with no exported URL configured
  const { ctx, page } = await fresh();
  obs.scenarios.splineRuntime = { dataAttr: await page.getByTestId('hero-scene').getAttribute('data-spline-runtime'), note: 'off = no VITE_SPLINE_SCENE_URL set; parallax scene rebuilt from the supplied .spline is shown' };
  await ctx.close();
}

obs.consoleErrors = [...new Set(consoleErrors)];
writeFileSync('test-results/manual-observations.json', JSON.stringify(obs, null, 2));
console.log(JSON.stringify(obs, null, 2));
await browser.close();
