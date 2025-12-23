'use client'

import { useMemo } from 'react'
import { Calendar, CreditCard, DollarSign, PiggyBank, TrendingUp, Wallet, BarChart2 } from 'lucide-react'
import { SimpleGrid, Title, Stack } from '@mantine/core'
import { OverviewCard } from '@/components/overview-card'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'

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

    // YTD Spent: All expenses from Jan 1 to current month of current year
    const ytdSpent = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === currentYear &&
          expenseDate.getMonth() <= currentMonth
        )
      })
      .reduce((total, expense) => total + (expense.amount || 0), 0)

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
    const ytdSavingsRate = ytdIncome > 0 ? (ytdSavings / ytdIncome) * 100 : 0

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
    return `$${amount.toFixed(2)}`
  }

  return (
    <Stack gap="sm">
      <Title order={4} c="dimmed">
        <Calendar size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
        Year to Date ({currentYear})
      </Title>
      <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4, lg: 7 }} spacing="md">
        <OverviewCard
          title="YTD Budget"
          value={formatCurrency(ytdData.ytdBudget)}
          icon={<Wallet size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="YTD Spent"
          value={formatCurrency(ytdData.ytdSpent)}
          icon={<CreditCard size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="YTD Income"
          value={formatCurrency(ytdData.ytdIncome)}
          icon={<DollarSign size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="Total Invested"
          value={formatCurrency(ytdData.totalInvested)}
          icon={<PiggyBank size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="Investment Value"
          value={formatCurrency(ytdData.totalInvestmentValue)}
          icon={<TrendingUp size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="YTD Savings"
          value={formatCurrency(ytdData.ytdSavings)}
          icon={<PiggyBank size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
        <OverviewCard
          title="Savings Rate"
          value={`${ytdData.ytdSavingsRate.toFixed(1)}%`}
          icon={<BarChart2 size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
        />
      </SimpleGrid>
    </Stack>
  )
}
