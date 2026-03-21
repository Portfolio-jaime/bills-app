import type { Currency } from '@bills/types'

// ─── Currency formatting ──────────────────────────────────────────────────────

const CURRENCY_CONFIG: Record<
  Currency,
  { locale: string; minimumFractionDigits: number; maximumFractionDigits: number }
> = {
  COP: { locale: 'es-CO', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  USD: { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { locale: 'de-DE', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  GBP: { locale: 'en-GB', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  BTC: { locale: 'en-US', minimumFractionDigits: 8, maximumFractionDigits: 8 },
  ETH: { locale: 'en-US', minimumFractionDigits: 6, maximumFractionDigits: 6 },
}

/**
 * Format an amount with its currency symbol.
 * e.g. formatCurrency(1500000, 'COP') → "$ 1.500.000"
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency]

  if (currency === 'BTC' || currency === 'ETH') {
    return `${amount.toFixed(config.maximumFractionDigits)} ${currency}`
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(amount)
}

/**
 * Format a compact number (e.g. 1500000 → "1.5M" for COP).
 */
export function formatCompact(amount: number, currency: Currency): string {
  const locale = CURRENCY_CONFIG[currency]?.locale ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

/**
 * Convert an amount from one currency to base currency.
 * rate is the exchange rate: 1 unit of `from` = `rate` units of `to`.
 */
export function convertToBaseCurrency(amount: number, rate: number): number {
  return Math.round(amount * rate * 1e6) / 1e6
}

// ─── Date utilities ───────────────────────────────────────────────────────────

/**
 * Returns the start of the current month in UTC (00:00:00.000Z).
 */
export function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/**
 * Returns the end of the current month in UTC (23:59:59.999Z).
 */
export function endOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
}

/**
 * Returns an ISO string for N months ago from today (first day of that month).
 */
export function monthsAgo(n: number): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1))
}

/**
 * Format a date as "Mar 2026" style label for charts.
 */
export function formatMonthLabel(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(date),
  )
}

/**
 * Format a date as "2026-03" key for grouping.
 */
export function toMonthKey(date: Date | string): string {
  const d = new Date(date)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * Format a date for display: "Mar 16, 2026".
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

// ─── Number utilities ─────────────────────────────────────────────────────────

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate percentage safely (returns 0 if total is 0).
 */
export function safePercent(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 10000) / 100 // 2 decimal places
}

// ─── String utilities ─────────────────────────────────────────────────────────

/**
 * Capitalize first letter of each word.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Generate a hash string for deduplication (connector transactions).
 * Not cryptographic — just for dedup purposes.
 */
export function generateDeduplicationHash(parts: string[]): string {
  let hash = 0
  const str = parts.join('|')
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
