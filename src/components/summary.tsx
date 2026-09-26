import type { ReactNode } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'

type Metric = { label: string; value: string; color?: string }

// "Label ........ value" rows, used by the summary cards
export function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <Stack gap={4}>
      {metrics.map((m) => (
        <Group key={m.label} justify="space-between" gap="xs">
          <Text size="sm" c="dimmed">
            {m.label}
          </Text>
          <Text size="sm" fw={600} className="numeric-value" c={m.color}>
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
    <Group gap="xs" mb="xs" c="gray.6">
      {icon}
      <Title order={5}>{title}</Title>
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
      <Text fz={size} fw={size === 'md' ? 600 : 500} c={color} className="numeric-value">
        {value}
      </Text>
    </Stack>
  )
}
