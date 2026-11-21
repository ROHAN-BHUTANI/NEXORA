/**
 * Pricing helpers. All amounts are integer rupees, so arithmetic is exact
 * (no floating-point drift) and formatting is deterministic across browsers.
 */

/** Indian digit grouping: 1,598 · 12,345 · 1,23,456. Independent of ICU data. */
function groupIndian(n: number): string {
  const s = Math.abs(Math.trunc(n)).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
}

export function formatINR(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${groupIndian(amount)}`;
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function sumLines(lines: ReadonlyArray<{ lineTotal: number }>): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}
