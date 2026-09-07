/**
 * Kenyan Shilling (KES) currency formatting utilities.
 * All monetary amounts are handled strictly as integer minor units (cents).
 * 1 KES = 100 Cents.
 */

export function formatKes(cents: number): string {
  const shillings = cents / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(shillings);
}

export function formatKesCompact(cents: number): string {
  const shillings = Math.round(cents / 100);
  return `KES ${shillings.toLocaleString('en-KE')}`;
}

export function centsToKes(cents: number): number {
  return cents / 100;
}

export function kesToCents(kes: number): number {
  return Math.round(kes * 100);
}
