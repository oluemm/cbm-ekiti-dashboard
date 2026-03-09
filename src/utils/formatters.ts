/**
 * Formatting utilities for the dashboard
 */

/** Format a number with commas: 1234567 → "1,234,567" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-NG').format(n);
}

/** Format as Naira currency: 1234567 → "₦1,234,567" */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format as percentage: 0.4567 → "45.67%"  or  45.67 → "45.67%" */
export function formatPercent(n: number, alreadyPercent = true): string {
  const val = alreadyPercent ? n : n * 100;
  return `${val.toFixed(1)}%`;
}

/** Compact number: 1_234_567 → "1.2M" */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(n);
}

/** Determine a color class for positive/negative deltas */
export function deltaColor(val: number): string {
  if (val > 0) return 'text-green-600';
  if (val < 0) return 'text-red-600';
  return 'text-gray-500';
}

/** Arrow indicator for a delta */
export function deltaArrow(val: number): string {
  if (val > 0) return '↑';
  if (val < 0) return '↓';
  return '→';
}
