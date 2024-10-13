'use client'

import React, { useEffect, useState } from 'react'

import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { ExpenseTable } from '@/components/expense-table'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { useCategoryStore } from '@/stores/category-store'
import { Expense, useExpenseStore } from '@/stores/expense-store'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const { expenses, addExpense } = useExpenseStore()
  const { expenseCategories } = useCategoryStore()
  const [filteredExpenses, setFilteredExpenses] = useState(expenses)

  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
    })
    setFilteredExpenses(filtered)
  }, [expenses, selectedYear, selectedMonth])

  const handleExpenseAdded = (newExpenses: Omit<Expense, 'id'>[]) => {
    newExpenses.forEach((expense) => addExpense(expense))
  }

  return (
    <>
      <PageHeader title="Expenses" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm selectedYear={selectedYear} selectedMonth={selectedMonth} initialExpenses={[]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense List</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </CardContent>
        </Card>
      </div>
      {/* <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            All Expenses for{' '}
            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable
            expenses={filteredExpenses}
            expenseCategories={expenseCategories}
            onInputChange={() => {}} // This table is read-only
            onDeleteRow={() => {}} // This table is read-only
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </CardContent>
      </Card> */}
    </>
  )
}
