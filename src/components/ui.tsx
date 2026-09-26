import type { ReactNode } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'

import { formatMoney } from '@/lib/format'

type Metric = { label: string; value: string; color?: string }

// "Label ........ value" rows, used by the summary cards
export function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <Stack gap={0} className="metric-list">
      {metrics.map((m) => (
        <Group key={m.label} justify="space-between" gap="xs" className="metric-list-row" wrap="nowrap">
          <Text size="sm" c="dimmed">
            {m.label}
          </Text>
          <Text size="sm" fw={600} className="tabular-number" c={m.color}>
            {m.value}
          </Text>
        </Group>
      ))}
    </Stack>
  )
}

// Small icon + heading at the top of a card
export function CardTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Group gap={8} mb="sm" c="var(--color-tint)">
      {icon}
      <Title order={5} fz={15}>
        {title}
      </Title>
    </Group>
  )
}

// Small label above a value
export function Stat({ label, value, color, size = 'sm' }: Metric & { size?: 'sm' | 'md' }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fz={size} fw={size === 'md' ? 600 : 500} c={color} className="tabular-number">
        {value}
      </Text>
    </Stack>
  )
}

// A currency amount in tabular monospace digits; inherits size and color from its parent
export function Money({ value }: { value: number | null | undefined }) {
  return <span className="tabular-number">{formatMoney(value)}</span>
}

// Green for gains and zero, red for losses
export function colorBySign(amount: number) {
  return amount >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'
}
