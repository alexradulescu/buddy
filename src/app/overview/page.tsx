'use client'

import React, { useState } from 'react'

import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { useAccountStore } from '@/stores/account-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useIncomeStore } from '@/stores/income-store'

export default function OverviewPage() {
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useSharedQueryParams()
  const { getAccountBalances } = useAccountStore()
  const { expenses } = useExpenseStore()
  const { incomes } = useIncomeStore()
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const calculateTotalBalance = (year: number, month: number) => {
    return getAccountBalances(year, month).reduce((total, account) => total + account.amount, 0)
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

  const getPreviousMonthYear = (year: number, month: number) => {
    if (month === 0) {
      return { year: year - 1, month: 11 }
    }
    return { year, month: month - 1 }
  }

  const currentMonthBalance = calculateTotalBalance(selectedYear, selectedMonth)
  const currentMonthExpenses = calculateTotalExpenses(selectedYear, selectedMonth)
  const currentMonthIncome = calculateTotalIncome(selectedYear, selectedMonth)

  const { year: prevYear, month: prevMonth } = getPreviousMonthYear(selectedYear, selectedMonth)
  const previousMonthBalance = calculateTotalBalance(prevYear, prevMonth)

  const expectedAccountsTotal = previousMonthBalance + currentMonthIncome - currentMonthExpenses
  const realAccountsTotal = currentMonthBalance
  const discrepancy = realAccountsTotal - expectedAccountsTotal

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Financial Overview</h1>

      <div className="flex space-x-4">
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Summary</h2>
          <ul className="space-y-2">
            <li>Total Account Balances: ${currentMonthBalance.toFixed(2)}</li>
            <li>Total Expenses: ${currentMonthExpenses.toFixed(2)}</li>
            <li>Total Income: ${currentMonthIncome.toFixed(2)}</li>
            <li>Expected Accounts Total: ${expectedAccountsTotal.toFixed(2)}</li>
            <li>Real Accounts Total: ${realAccountsTotal.toFixed(2)}</li>
            <li className={`font-bold ${discrepancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Discrepancy: ${discrepancy.toFixed(2)}
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Account Balances</h2>
            <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Account Balance</DialogTitle>
                </DialogHeader>
                <AccountForm
                  onSubmit={() => setIsAddAccountDialogOpen(false)}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              </DialogContent>
            </Dialog>
          </div>
          <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>
    </div>
  )
}
