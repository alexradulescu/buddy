'use client'

import React from 'react'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { ExpenseOverview } from '@/components/expense-overview'
import { HomeOverview } from '@/components/home-overview'
import { IncomeOverview } from '@/components/income-overview'
import { PageHeader } from '@/components/page-header'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function HomePage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  const { data: { expenseCategories = [], incomeCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()

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

  return (
    <div className="d-flex flex-col space-y-8 gap-4">
      <PageHeader title="Budget Overview" />

      <HomeOverview
        totalMonthlyIncomes={totalMonthlyIncomes}
        totalMonthlyExpenses={totalMonthlyExpenses}
        netIncome={netIncome}
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
    </div>
  )
}
