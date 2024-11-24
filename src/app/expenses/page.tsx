'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { PageHeader } from '@/components/page-header'
import React from 'react'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

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
    </>
  )
}
