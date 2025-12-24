'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { Card, Title, Stack, Group, Text } from '@mantine/core'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

export function YTDOverview() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-indexed

  const { data: { expenseCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()
  const { investments, investmentContributions, getLatestValue } = useInvestmentStore()

  const ytdData = useMemo(() => {
    // YTD Income: All income from Jan 1 to current month of current year
    const ytdIncome = incomes
      .filter((income) => {
        const incomeDate = new Date(income.date)
        return (
          incomeDate.getFullYear() === currentYear &&
          incomeDate.getMonth() <= currentMonth
        )
      })
      .reduce((total, income) => total + (income.amount || 0), 0)

    // YTD Expenses: All expenses from Jan 1 to current month of current year
    const ytdExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === currentYear &&
          expenseDate.getMonth() <= currentMonth
        )
      })
      .reduce((total, expense) => total + (expense.amount || 0), 0)

    // YTD Investment Contributions (to exclude from spent)
    const ytdInvestmentContributions = investmentContributions
      .filter((contribution) => {
        const contributionDate = new Date(contribution.date)
        return (
          contributionDate.getFullYear() === currentYear &&
          contributionDate.getMonth() <= currentMonth
        )
      })
      .reduce((total, contribution) => total + (contribution.amount || 0), 0)

    // YTD Spent: Expenses minus investments (money moved to investments isn't "spent")
    const ytdSpent = ytdExpenses - ytdInvestmentContributions

    // YTD Budget: Sum of all non-archived category monthly budgets × (current month + 1)
    const monthsElapsed = currentMonth + 1
    const ytdBudget = expenseCategories
      .filter((category) => !category.isArchived)
      .reduce((total, category) => total + (category.maxBudget || 0), 0) * monthsElapsed

    // All-time investment contributions
    const totalInvested = investmentContributions.reduce(
      (total, contribution) => total + (contribution.amount || 0),
      0
    )

    // Latest investment values (sum of latest value for each active investment)
    const totalInvestmentValue = investments
      .filter((investment) => investment.isActive)
      .reduce((total, investment) => {
        const latestValue = getLatestValue(investment.id)
        return total + (latestValue || 0)
      }, 0)

    // YTD Savings
    const ytdSavings = ytdIncome - ytdSpent

    // YTD Savings Rate
    const ytdSavingsRate = ytdIncome > 0 ? ytdSavings / ytdIncome : 0

    return {
      ytdIncome,
      ytdSpent,
      ytdBudget,
      totalInvested,
      totalInvestmentValue,
      ytdSavings,
      ytdSavingsRate
    }
  }, [
    incomes,
    expenses,
    expenseCategories,
    investments,
    investmentContributions,
    getLatestValue,
    currentYear,
    currentMonth
  ])

  const formatCurrency = (amount: number): string => {
    return currencyFormatter.format(amount)
  }

  const formatPercent = (value: number): string => {
    return percentFormatter.format(value)
  }

  const metrics = [
    { label: 'YTD Budget', value: formatCurrency(ytdData.ytdBudget) },
    { label: 'YTD Spent', value: formatCurrency(ytdData.ytdSpent) },
    { label: 'YTD Income', value: formatCurrency(ytdData.ytdIncome) },
    { label: 'Total Invested', value: formatCurrency(ytdData.totalInvested) },
    { label: 'Investment Value', value: formatCurrency(ytdData.totalInvestmentValue) },
    { label: 'YTD Savings', value: formatCurrency(ytdData.ytdSavings) },
    { label: 'Savings Rate', value: formatPercent(ytdData.ytdSavingsRate) }
  ]

  return (
    <Card>
      <Group gap="xs" mb="xs">
        <Calendar size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
        <Title order={5}>Year to Date ({currentYear})</Title>
      </Group>
      <Stack gap={4}>
        {metrics.map((metric) => (
          <Group key={metric.label} justify="space-between" gap="xs">
            <Text size="sm" c="dimmed">{metric.label}</Text>
            <Text size="sm" fw={600} className="numeric-value">{metric.value}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  )
}
