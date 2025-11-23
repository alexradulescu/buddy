'use client'

import React, { useState } from 'react'
import { useAccountBalances, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { PageHeader } from '@/components/page-header'
import { Button, Card, Modal } from '@mantine/core'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader title="Accounts" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}
      >
        <Card shadow="sm" padding="0" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Summary</h3>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mantine-color-dimmed)' }}>Total Account Balances</span>
                <span>${currentMonthBalance.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mantine-color-dimmed)' }}>Total Expenses</span>
                <span>${currentMonthExpenses.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mantine-color-dimmed)' }}>Total Income</span>
                <span>${currentMonthIncome.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mantine-color-dimmed)' }}>Expected Accounts Total</span>
                <span>${expectedAccountsTotal.toFixed(2)}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mantine-color-dimmed)' }}>Real Accounts Total</span>
                <span>${realAccountsTotal.toFixed(2)}</span>
              </li>
            </ul>
          </Card.Section>
          <Card.Section
            withBorder
            inheritPadding
            py="xs"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--mantine-color-gray-0)'
            }}
          >
            <span style={{ color: 'var(--mantine-color-dimmed)' }}>Discrepancy</span>
            <span
              style={{
                color: discrepancy > 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)',
                fontWeight: 600
              }}
            >
              ${discrepancy.toFixed(2)}
            </span>
          </Card.Section>
        </Card>

        <Card shadow="sm" padding="0" radius="md" withBorder>
          <Card.Section
            withBorder
            inheritPadding
            py="xs"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--mantine-color-gray-0)'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Account Balances</h3>
            <Button size="sm" onClick={() => setIsAddAccountDialogOpen(true)}>
              Add
            </Button>
          </Card.Section>
          <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Card>
      </div>

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
    </div>
  )
}
