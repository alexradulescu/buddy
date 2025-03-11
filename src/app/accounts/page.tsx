'use client'

import React, { useState } from 'react'
import { useAccountBalances, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { 
  Card, 
  Text, 
  Group, 
  Stack, 
  Grid, 
  Button, 
  Modal,
  List,
  Divider,
  Box
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

const getPreviousMonthYear = (year: number, month: number) => {
  if (month === 0) {
    return { year: year - 1, month: 11 }
  }
  return { year, month: month - 1 }
}

export default function OverviewPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const { year: prevYear, month: prevMonth } = getPreviousMonthYear(selectedYear, selectedMonth)
  const { data: { accountBalances = [] } = {} } = useAccountBalances(selectedYear, selectedMonth)
  const { data: { accountBalances: previousMonthAccountBalances = [] } = {} } = useAccountBalances(prevYear, prevMonth)

  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()

  const [opened, { open, close }] = useDisclosure(false)

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
    <div className="space-y-8">
      <PageHeader title="Accounts" />

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" bg="gray.1">
              <Text fw={500} size="lg">Summary</Text>
            </Card.Section>
            
            <Stack gap="sm" p="md">
              <List spacing="xs" size="sm">
                <List.Item>
                  <Group justify="space-between">
                    <Text c="dimmed">Total Account Balances</Text>
                    <Text>${currentMonthBalance.toFixed(2)}</Text>
                  </Group>
                </List.Item>
                <List.Item>
                  <Group justify="space-between">
                    <Text c="dimmed">Total Expenses</Text>
                    <Text>${currentMonthExpenses.toFixed(2)}</Text>
                  </Group>
                </List.Item>
                <List.Item>
                  <Group justify="space-between">
                    <Text c="dimmed">Total Income</Text>
                    <Text>${currentMonthIncome.toFixed(2)}</Text>
                  </Group>
                </List.Item>
                <List.Item>
                  <Group justify="space-between">
                    <Text c="dimmed">Expected Accounts Total</Text>
                    <Text>${expectedAccountsTotal.toFixed(2)}</Text>
                  </Group>
                </List.Item>
                <List.Item>
                  <Group justify="space-between">
                    <Text c="dimmed">Real Accounts Total</Text>
                    <Text>${realAccountsTotal.toFixed(2)}</Text>
                  </Group>
                </List.Item>
              </List>
            </Stack>
            
            <Card.Section p="md" bg="gray.1">
              <Group justify="space-between">
                <Text c="dimmed">Discrepancy</Text>
                <Text c={discrepancy > 0 ? 'green.6' : 'red.6'} fw={600}>
                  ${discrepancy.toFixed(2)}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" bg="gray.1">
              <Group justify="space-between">
                <Text fw={500} size="lg">Account Balances</Text>
                <Button size="xs" onClick={open}>Add</Button>
              </Group>
            </Card.Section>
            
            <Box p="md">
              <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
            </Box>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={close} title="Add New Account Balance">
        <AccountForm
          onSubmit={close}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </Modal>
    </div>
  )
}
