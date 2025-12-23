'use client'

import React from 'react'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ExpenseOverview } from '@/components/expense-overview'
import { HomeOverview } from '@/components/home-overview'
import { IncomeOverview } from '@/components/income-overview'
import { InvestmentOverview } from '@/components/investment/investment-overview'
import { YTDOverview } from '@/components/ytd-overview'
import { PageHeader } from '@/components/page-header'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { Stack, Accordion, Box, Card } from '@mantine/core'

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
    <Stack gap="lg">
      {/* YTD Overview - Desktop: always visible */}
      <Box visibleFrom="sm">
        <YTDOverview />
      </Box>

      {/* YTD Overview - Mobile: collapsible inside a card */}
      <Box hiddenFrom="sm">
        <Card shadow="sm" padding={0} radius="md" withBorder>
          <Accordion>
            <Accordion.Item value="ytd" style={{ border: 'none' }}>
              <Accordion.Control>Year to Date Overview</Accordion.Control>
              <Accordion.Panel>
                <YTDOverview compact />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
      </Box>

      <HomeOverview
        totalMonthlyIncomes={totalMonthlyIncomes}
        totalMonthlyExpenses={totalMonthlyExpenses}
        netIncome={netIncome}
        totalInvestmentValue={totalInvestmentValue}
      />

      {/* Mobile view - regular stack */}
      <Box hiddenFrom="sm">
        <Stack gap="lg">
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
      </Box>

      {/* Desktop view - accordion for detailed sections */}
      <Box visibleFrom="sm">
        <Accordion multiple defaultValue={['expenses', 'incomes', 'investments']}>
          <Accordion.Item value="expenses">
            <Accordion.Control>Expense Categories</Accordion.Control>
            <Accordion.Panel>
              <ExpenseOverview
                expenses={expenses}
                expenseCategories={expenseCategories}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="incomes">
            <Accordion.Control>Income Categories</Accordion.Control>
            <Accordion.Panel>
              <IncomeOverview
                incomes={incomes}
                incomeCategories={incomeCategories}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="investments">
            <Accordion.Control>Investments</Accordion.Control>
            <Accordion.Panel>
              <InvestmentOverview />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    </Stack>
  )
}
