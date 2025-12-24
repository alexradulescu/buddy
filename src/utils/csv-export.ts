/**
 * CSV Export Utilities
 * Functions for formatting data and triggering CSV downloads
 */

/**
 * Format a number for CSV output (no currency symbol, 2 decimal places)
 */
export function formatNumberForCSV(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return value.toFixed(2)
}

/**
 * Format a delta value in accounting style: (+50.00) for positive, (-50.00) for negative
 */
export function formatDeltaForCSV(delta: number | undefined): string {
  if (delta === undefined) return ''
  const sign = delta >= 0 ? '+' : '-'
  return `(${sign}${Math.abs(delta).toFixed(2)})`
}

/**
 * Format a percentage value (e.g., 0.433 -> "43.3%")
 */
export function formatPercentForCSV(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Format a percentage that's already in percentage form (e.g., 43.3 -> "43.30%")
 */
export function formatPercentValueForCSV(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Escape a CSV field to handle commas, quotes, and newlines
 */
export function escapeCSVField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return ''
  const str = String(field)
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Create a CSV row from an array of values
 */
export function createCSVRow(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCSVField).join(',')
}

/**
 * Trigger a browser download of CSV content
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
