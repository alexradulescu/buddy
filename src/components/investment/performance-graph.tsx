import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Add contributions and values to see performance data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => {
                  // Ensure value is a number
                  const numValue = typeof value === 'string' ? parseFloat(value) : 
                                  Array.isArray(value) ? parseFloat(value[0].toString()) : 
                                  Number(value);
                  return [`$${numValue.toFixed(2)}`, undefined];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="contributions" 
                name="Contributions" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Value" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
