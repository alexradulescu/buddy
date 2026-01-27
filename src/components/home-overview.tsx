import { Calendar } from 'lucide-react'
import { Card, Title, Stack, Group, Text, Box } from '@mantine/core'
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
    { label: 'Total Income', value: formatCurrency(totalMonthlyIncomes), isPositive: true },
    { label: 'Total Expenses', value: formatCurrency(totalMonthlyExpenses), isNegative: true },
    { label: 'Net Income', value: formatCurrency(netIncome), isHighlight: netIncome >= 0 },
    { label: 'Investments', value: formatCurrency(totalInvestmentValue) },
    { label: 'Saving Rate', value: savingRate }
  ]

  return (
    <Card>
      <Group gap="xs" mb="sm">
        <Box style={{ color: '#52B788' }}>
          <Calendar size={14} strokeWidth={1.5} />
        </Box>
        <Title order={5} fw={600}>
          {monthName} {selectedYear}
        </Title>
      </Group>

      <Stack gap={6}>
        {metrics.map((metric) => (
          <Group key={metric.label} justify="space-between" gap="xs">
            <Text size="sm" c="dimmed">
              {metric.label}
            </Text>
            <Text
              size="sm"
              fw={600}
              className="numeric-value"
              style={{
                color: metric.isPositive ? '#2D6A4F' : metric.isNegative ? '#D64550' : undefined,
              }}
            >
              {metric.value}
            </Text>
          </Group>
        ))}
      </Stack>
    </Card>
  )
}
