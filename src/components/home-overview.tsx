'use client'

import { Calendar } from 'lucide-react'
import { Card, Title, Stack, Group, Text } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

interface HomeOverviewProps {
  totalMonthlyIncomes: number
  totalMonthlyExpenses: number
  netIncome: number
  totalInvestmentValue: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function HomeOverview({ totalMonthlyIncomes, totalMonthlyExpenses, netIncome, totalInvestmentValue }: HomeOverviewProps) {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  const formatCurrency = (amount: number | undefined): string => {
    return amount !== undefined ? currencyFormatter.format(amount) : 'N/A'
  }

  const savingRate = totalMonthlyIncomes > 0
    ? `${((netIncome / totalMonthlyIncomes) * 100).toFixed(1)}%`
    : 'N/A'

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en-US', { month: 'long' })

  const metrics = [
    { label: 'Total Income', value: formatCurrency(totalMonthlyIncomes) },
    { label: 'Total Expenses', value: formatCurrency(totalMonthlyExpenses) },
    { label: 'Net Income', value: formatCurrency(netIncome) },
    { label: 'Investments', value: formatCurrency(totalInvestmentValue) },
    { label: 'Saving Rate', value: savingRate }
  ]

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <Calendar size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Title order={4} c="dimmed">{monthName} {selectedYear}</Title>
        </Group>
        <Stack gap="xs">
          {metrics.map((metric) => (
            <Group key={metric.label} justify="space-between">
              <Text size="sm" c="dimmed">{metric.label}</Text>
              <Text size="sm" fw={600} className="numeric-value">{metric.value}</Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
