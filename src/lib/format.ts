const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

export function formatMoney(amount: number | null | undefined) {
  return amount == null ? 'N/A' : money.format(amount)
}

// ratio 0.433 -> "43.3%"
export function formatPercent(ratio: number, digits = 1) {
  return `${(ratio * 100).toFixed(digits)}%`
}

// month is 0-based, like the URL state
export function monthLabel(year: number, month: number) {
  return new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}
