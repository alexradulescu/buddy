'use client'

import React, { useState } from 'react'
import { useAccountBalances, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { PageHeader } from '@/components/page-header'
import { Button, Card, Modal, Stack, SimpleGrid, Group, Text, Title } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

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

  return (
    <Stack gap="xl">
      <PageHeader title="Accounts" />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Card shadow="sm" padding="0" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
            <Title order={3} size="h5">Summary</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text c="dimmed">Total Account Balances</Text>
                <Text>${currentMonthBalance.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed">Total Expenses</Text>
                <Text>${currentMonthExpenses.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed">Total Income</Text>
                <Text>${currentMonthIncome.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed">Expected Accounts Total</Text>
                <Text>${expectedAccountsTotal.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="dimmed">Real Accounts Total</Text>
                <Text>${realAccountsTotal.toFixed(2)}</Text>
              </Group>
            </Stack>
          </Card.Section>
          <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
            <Group justify="space-between">
              <Text c="dimmed">Discrepancy</Text>
              <Text fw={600} c={discrepancy > 0 ? 'green.6' : 'red.6'}>
                ${discrepancy.toFixed(2)}
              </Text>
            </Group>
          </Card.Section>
        </Card>

        <Card shadow="sm" padding="0" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
            <Group justify="space-between">
              <Title order={3} size="h5">Account Balances</Title>
              <Button size="sm" onClick={() => setIsAddAccountDialogOpen(true)}>
                Add
              </Button>
            </Group>
          </Card.Section>
          <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
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
