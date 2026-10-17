import type { ReactNode } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'

import { formatMoney } from '@/lib/format'

type Metric = {
  label: string
  value: string
  color?: string
  // A leading operator ("+", "−", "=") turns the list into a readable sum
  sign?: string
  // Totals get a separator above and heavier type
  total?: boolean
}

// "Label ........ value" rows, used by the summary cards
export function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <Stack gap={0} className="metric-list">
      {metrics.map((m) => (
        <Group
          key={m.label}
          justify="space-between"
          gap="xs"
          className="metric-list-row"
          data-total={m.total || undefined}
          wrap="nowrap"
        >
          <Text className="metric-list-label">
            {m.sign && <span className="metric-list-sign">{m.sign}</span>}
            {m.label}
          </Text>
          <Text className="metric-list-value tabular-number" c={m.color}>
            {m.value}
          </Text>
        </Group>
      ))}
    </Stack>
  )
}

// Muted icon + heading at the top of a card; optional trailing element (an action or a note)
export function CardTitle({ icon, title, trailing }: { icon?: ReactNode; title: string; trailing?: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" mb="sm" className="card-title">
      <Group gap={8} wrap="nowrap">
        {icon && <span className="card-title-icon">{icon}</span>}
        <Title order={2} className="card-title-text">
          {title}
        </Title>
      </Group>
      {trailing}
    </Group>
  )
}

// Small label above a value
export function Stat({ label, value, color, size = 'sm' }: Metric & { size?: 'sm' | 'md' }) {
  return (
    <Stack gap={2}>
      <Text className="stat-label">{label}</Text>
      <Text className="stat-value tabular-number" data-size={size} c={color}>
        {value}
      </Text>
    </Stack>
  )
}

// A headline number: label, large value, optional footnote and meter (Shopify / Apple Wallet style)
export function StatTile({
  label,
  value,
  color,
  footnote,
  meter
}: {
  label: string
  value: string
  color?: string
  footnote?: ReactNode
  meter?: { used: number; limit: number }
}) {
  return (
    <div className="stat-tile">
      <Text className="stat-tile-label">{label}</Text>
      <Text className="stat-tile-value tabular-number" c={color}>
        {value}
      </Text>
      {meter && <Meter used={meter.used} limit={meter.limit} />}
      {footnote && <Text className="stat-tile-footnote">{footnote}</Text>}
    </div>
  )
}

// Thin progress bar: tint while within the limit, red once over it
export function Meter({ used, limit }: { used: number; limit: number }) {
  const ratio = limit > 0 ? used / limit : used > 0 ? 1 : 0
  const over = used > limit
  return (
    <div
      className="meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={used}
      data-over={over || undefined}
    >
      <div className="meter-fill" style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
    </div>
  )
}

// "$40.12 left" / "$100.43 over" for a budget, coloured only when over
export function BudgetRemaining({ spent, budget }: { spent: number; budget: number }) {
  const left = budget - spent
  return (
    <span className={left < 0 ? 'budget-remaining negative' : 'budget-remaining'}>
      {formatMoney(Math.abs(left))} {left < 0 ? 'over' : 'left'}
    </span>
  )
}

// A currency amount in tabular digits; inherits size and color from its parent
export function Money({ value }: { value: number | null | undefined }) {
  return <span className="tabular-number">{formatMoney(value)}</span>
}

// Green for gains and zero, red for losses
export function colorBySign(amount: number) {
  return amount >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'
}
