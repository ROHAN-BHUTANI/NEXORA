import { expect, test, type Page } from '@playwright/test';

/**
 * NEXORA — Fynd SDET challenge. Three independent tests.
 * Each test gets a fresh browser context (cart lives in memory only), and every wait is an
 * auto-retrying `expect` / actionability check — there are no fixed sleeps.
 */

const MOUSE = 'quantum-mouse';

async function openCleanApp(page: Page) {
  await page.goto('/');
  // Clean-state precondition: nothing in the cart, nothing confirmed.
  await expect(page.getByTestId('cart-count')).toHaveText('0');
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('order-confirmation')).toHaveCount(0);
}

async function addToCart(page: Page, productId: string) {
  await page.getByTestId(`add-to-cart-${productId}`).click();
  await expect(page.getByTestId(`cart-line-${productId}`)).toBeVisible();
}

test.describe('NEXORA checkout', () => {
  test('TEST 1 — successful checkout shows confirmation with an order reference', async ({ page }, testInfo) => {
    await openCleanApp(page);
    await addToCart(page, MOUSE);

    await page.getByTestId('customer-name-input').fill('Aarav Sharma');
    await page.getByTestId('place-order-button').click();

    const confirmation = page.getByTestId('order-confirmation');
    await expect(confirmation).toBeVisible();
    await expect(page.getByTestId('order-status')).toHaveText('Order confirmed');

    const reference = page.getByTestId('order-reference');
    await expect(reference).toBeVisible();
    await expect(reference).toHaveText(/^NXR-\d{8}-[A-Z2-9]{8}$/);

    // Confirmation reflects the order that was placed.
    await expect(page.getByTestId('order-customer-name')).toHaveText('Aarav Sharma');
    await expect(page.getByTestId(`confirmation-qty-${MOUSE}`)).toHaveText('1');
    await expect(page.getByTestId('order-total')).toHaveText('₹799');

    await page.screenshot({ path: testInfo.outputPath('test1-confirmation.png') });
  });

  test('TEST 2 — missing customer name blocks checkout and shows a validation message', async ({ page }, testInfo) => {
    await openCleanApp(page);
    await addToCart(page, MOUSE);

    // Name deliberately left empty.
    await expect(page.getByTestId('customer-name-input')).toHaveValue('');
    await page.getByTestId('place-order-button').click();

    // Blocked: validation message visible, no confirmation, cart untouched, field flagged.
    const error = page.getByTestId('name-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Customer name is required');
    await expect(page.getByTestId('customer-name-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('order-confirmation')).toHaveCount(0);
    await expect(page.getByTestId('checkout-form')).toBeVisible();
    await expect(page.getByTestId(`cart-line-${MOUSE}`)).toBeVisible();
    await expect(page.getByTestId('cart-total')).toHaveText('₹799');

    await page.screenshot({ path: testInfo.outputPath('test2-validation.png') });
  });

  test('TEST 3 — quantity of two Quantum Mice totals exactly ₹1,598', async ({ page }, testInfo) => {
    await openCleanApp(page);
    await addToCart(page, MOUSE);

    await page.getByTestId(`increase-qty-${MOUSE}`).click();

    await expect(page.getByTestId(`cart-qty-${MOUSE}`)).toHaveText('2');
    await expect(page.getByTestId(`cart-line-total-${MOUSE}`)).toHaveText('₹1,598');
    await expect(page.getByTestId('cart-total')).toHaveText('₹1,598');

    await page.screenshot({ path: testInfo.outputPath('test3-quantity.png') });
  });
});
