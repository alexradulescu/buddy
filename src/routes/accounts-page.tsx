'use client'

import React, { useState } from 'react'
import { useAccountBalances, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { Button, Card, Modal, Stack, SimpleGrid, Group, Text, Title } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { Calculator, Wallet } from 'lucide-react'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const getPreviousMonthYear = (year: number, month: number) => {
  if (month === 0) {
    return { year: year - 1, month: 11 }
  }
  return { year, month: month - 1 }
}

export default function AccountsPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const { year: prevYear, month: prevMonth } = getPreviousMonthYear(selectedYear, selectedMonth)
  const { data: { accountBalances = [] } = {} } = useAccountBalances(selectedYear, selectedMonth)
  const { data: { accountBalances: previousMonthAccountBalances = [] } = {} } = useAccountBalances(prevYear, prevMonth)

  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()

  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)

  const calculateTotalBalance = () => {
    return accountBalances.reduce((total, account) => total + account.amount, 0)
  }

  const calculateTotalPreviousMonthBalance = () => {
    return previousMonthAccountBalances.reduce((total, account) => total + account.amount, 0)
  }

  const calculateTotalExpenses = (year: number, month: number) => {
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
      })
      .reduce((total, expense) => total + expense.amount, 0)
  }

  const calculateTotalIncome = (year: number, month: number) => {
    return incomes
      .filter((income) => {
        const incomeDate = new Date(income.date)
        return incomeDate.getFullYear() === year && incomeDate.getMonth() === month
      })
      .reduce((total, income) => total + income.amount, 0)
  }

  const currentMonthBalance = calculateTotalBalance()
  const currentMonthExpenses = calculateTotalExpenses(selectedYear, selectedMonth)
  const currentMonthIncome = calculateTotalIncome(selectedYear, selectedMonth)

  const previousMonthBalance = calculateTotalPreviousMonthBalance()

  const expectedAccountsTotal = previousMonthBalance + currentMonthIncome - currentMonthExpenses
  const realAccountsTotal = currentMonthBalance
  const discrepancy = realAccountsTotal - expectedAccountsTotal

  const summaryMetrics = [
    { label: 'Total Account Balances', value: currencyFormatter.format(currentMonthBalance) },
    { label: 'Total Expenses', value: currencyFormatter.format(currentMonthExpenses) },
    { label: 'Total Income', value: currencyFormatter.format(currentMonthIncome) },
    { label: 'Expected Accounts Total', value: currencyFormatter.format(expectedAccountsTotal) },
    { label: 'Real Accounts Total', value: currencyFormatter.format(realAccountsTotal) },
    { label: 'Discrepancy', value: currencyFormatter.format(discrepancy), color: discrepancy >= 0 ? 'green.6' : 'red.6' }
  ]

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Summary Card - matches YTD style */}
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <Calculator size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Title order={4} c="dimmed">Summary</Title>
            </Group>
            <Stack gap="xs">
              {summaryMetrics.map((metric) => (
                <Group key={metric.label} justify="space-between">
                  <Text size="sm" c="dimmed">{metric.label}</Text>
                  <Text size="sm" fw={600} className="numeric-value" c={metric.color}>
                    {metric.value}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* Account Balances Card - matches YTD style */}
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs" justify="space-between">
              <Group gap="xs">
                <Wallet size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Title order={4} c="dimmed">Account Balances</Title>
              </Group>
              <Button size="xs" onClick={() => setIsAddAccountDialogOpen(true)}>
                Add
              </Button>
            </Group>
            <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Stack>
        </Card>
      </SimpleGrid>

      <Modal
        opened={isAddAccountDialogOpen}
        onClose={() => setIsAddAccountDialogOpen(false)}
        title="Add New Account Balance"
        centered
      >
        <AccountForm
          onSubmit={() => setIsAddAccountDialogOpen(false)}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </Modal>
    </Stack>
  )
}
