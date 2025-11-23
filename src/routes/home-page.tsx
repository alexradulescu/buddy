'use client'

import React from 'react'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ExpenseOverview } from '@/components/expense-overview'
import { HomeOverview } from '@/components/home-overview'
import { IncomeOverview } from '@/components/income-overview'
import { InvestmentOverview } from '@/components/investment/investment-overview'
import { PageHeader } from '@/components/page-header'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { Stack } from '@mantine/core'

export default function HomePage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  const { data: { expenseCategories = [], incomeCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()
  const { investments, getLatestValue } = useInvestmentStore()

  const totalMonthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
    })
    .reduce((total, expense) => total + (expense.amount || 0), 0)

  const totalMonthlyIncomes = incomes
    .filter((income) => {
      const incomeDate = new Date(income.date)
      return incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
    })
    .reduce((total, income) => total + (income.amount || 0), 0)

  const netIncome = totalMonthlyIncomes - totalMonthlyExpenses

  // Calculate total investment value from active investments
  const totalInvestmentValue = investments
    .filter(investment => investment.isActive)
    .reduce((total, investment) => {
      const latestValue = getLatestValue(investment.id)
      return total + (latestValue || 0)
    }, 0)

  return (
    <Stack gap="xl">
      <PageHeader title="Budget Overview" />

      <HomeOverview
        totalMonthlyIncomes={totalMonthlyIncomes}
        totalMonthlyExpenses={totalMonthlyExpenses}
        netIncome={netIncome}
        totalInvestmentValue={totalInvestmentValue}
      />

      <ExpenseOverview
        expenses={expenses}
        expenseCategories={expenseCategories}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />

      <IncomeOverview
        incomes={incomes}
        incomeCategories={incomeCategories}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />

      <InvestmentOverview />
    </Stack>
  )
}
