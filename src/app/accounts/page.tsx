'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useState } from 'react'

import { AccountForm } from '@/components/account-form'
import { AccountList } from '@/components/account-list'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'
import { useAccountStore } from '@/stores/account-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useIncomeStore } from '@/stores/income-store'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function OverviewPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const { getAccountBalances } = useAccountStore()
  const { expenses } = useExpenseStore()
  const { incomes } = useIncomeStore()
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)

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
      <PageHeader title="Accounts" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start bg-muted/50 py-3">
            <CardTitle className="group flex items-center gap-1 text-md">Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Account Balances</span>
                <span>${currentMonthBalance.toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Expenses</span>
                <span>${currentMonthExpenses.toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Income</span>
                <span>${currentMonthIncome.toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Expected Accounts Total</span>
                <span>${expectedAccountsTotal.toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Real Accounts Total</span>
                <span>${realAccountsTotal.toFixed(2)}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-row items-center justify-between border-t bg-muted/50 px-6 py-3">
            <span className="text-muted-foreground">Discrepancy</span>
            <span className={cn(discrepancy > 0 ? 'text-green-600' : 'text-red-600', 'font-semibold')}>
              ${discrepancy.toFixed(2)}
            </span>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Account Balances</CardTitle>
              <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size={'sm'}>Add</Button>
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
          </CardHeader>
          <CardContent className="p-6">
            <AccountList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
