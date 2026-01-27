import { useMemo } from 'react'
import { Card, Stack, Group, Title, Text } from '@mantine/core'
import { TrendingUp } from 'lucide-react'
import { InvestmentContribution, InvestmentValue } from '@/types/investment'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformanceGraphProps {
  contributions: InvestmentContribution[]
  values: InvestmentValue[]
}

export default function PerformanceGraph({ contributions, values }: PerformanceGraphProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    // Combine all dates from both contributions and values
    const allDates = [
      ...contributions.map(c => c.date),
      ...values.map(v => v.date)
    ].sort()

    // Create a map of dates to month-year strings for grouping
    const dateToMonthMap = new Map()
    allDates.forEach(dateStr => {
      const date = new Date(dateStr)
      const monthYear = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      dateToMonthMap.set(dateStr, monthYear)
    })

    // Get unique month-year combinations
    const uniqueMonths = [...new Set(dateToMonthMap.values())]
      .sort((a, b) => a.localeCompare(b))

    // Calculate cumulative contributions and values for each month
    const monthlyData = uniqueMonths.map(monthYear => {
      // Get all contributions up to this month
      const contributionsUpToMonth = contributions.filter(c => {
        const contributionMonth = dateToMonthMap.get(c.date)
        return contributionMonth <= monthYear
      })

      // Calculate cumulative contributions
      const cumulativeContributions = contributionsUpToMonth.reduce(
        (sum, contribution) => sum + contribution.amount,
        0
      )

      // Find the latest value for this month
      const monthValues = values.filter(v => dateToMonthMap.get(v.date) === monthYear)
      let latestValue = null

      if (monthValues.length > 0) {
        // Sort by date descending and get the latest
        latestValue = [...monthValues].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].value
      } else {
        // If no value for this month, find the latest value from previous months
        const previousValues = values.filter(v => dateToMonthMap.get(v.date) < monthYear)
        if (previousValues.length > 0) {
          latestValue = [...previousValues].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0].value
        }
      }

      // Format the month for display
      const [year, month] = monthYear.split('-')
      const displayMonth = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })

      return {
        month: `${displayMonth} ${year}`,
        contributions: cumulativeContributions,
        value: latestValue
      }
    })

    return monthlyData
  }, [contributions, values])

  // If there's no data, show a message
  if (chartData.length === 0 || (contributions.length === 0 && values.length === 0)) {
    return (
      <Card>
        <Group gap="xs" mb="xs">
          <TrendingUp size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
          <Title order={5}>Performance</Title>
        </Group>
        <Stack align="center" justify="center" mih="8rem">
          <Text c="dimmed" size="sm">Add contributions and values to see performance data</Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card>
      <Group gap="xs" mb="xs">
        <TrendingUp size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
        <Title order={5}>Performance</Title>
      </Group>
      <div style={{ height: '9rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--mantine-color-gray-5)" />
            <YAxis tick={{ fontSize: 10 }} width={50} stroke="var(--mantine-color-gray-5)" />
            <Tooltip
              formatter={(value) => {
                const numValue = typeof value === 'string' ? parseFloat(value) :
                                Array.isArray(value) ? parseFloat(value[0].toString()) :
                                Number(value);
                return [`$${numValue.toFixed(2)}`, undefined];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line
              type="monotone"
              dataKey="contributions"
              name="Contributions"
              stroke="#8884d8"
              activeDot={{ r: 4 }}
              strokeWidth={1.5}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#82ca9d"
              strokeWidth={1.5}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
