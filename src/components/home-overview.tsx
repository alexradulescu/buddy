'use client'

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
    <Card
      style={{
        backgroundColor: '#FAF8F5',
        borderColor: 'rgba(28, 28, 28, 0.06)',
      }}
    >
      {/* Header with decorative line */}
      <Group gap="xs" mb="sm">
        <Box style={{ color: '#C4A052' }}>
          <Calendar size={14} strokeWidth={1.5} />
        </Box>
        <Title
          order={5}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: '#1C1C1C',
          }}
        >
          {monthName} {selectedYear}
        </Title>
      </Group>

      {/* Decorative separator */}
      <Box
        mb="sm"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(196, 160, 82, 0.3), rgba(196, 160, 82, 0.1), transparent)',
        }}
      />

      <Stack gap={6}>
        {metrics.map((metric) => (
          <Group key={metric.label} justify="space-between" gap="xs">
            <Text
              size="sm"
              style={{
                color: '#6B6B6B',
                letterSpacing: '0.01em',
              }}
            >
              {metric.label}
            </Text>
            <Text
              size="sm"
              fw={600}
              className="numeric-value"
              style={{
                color: metric.isPositive ? '#4A7C59' : metric.isNegative ? '#A65D57' : '#1C1C1C',
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
