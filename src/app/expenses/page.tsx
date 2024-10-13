'use client'

import React from 'react'

import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { PageHeader } from '@/components/page-header'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <>
      <PageHeader title="Expenses" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
        <div>
          <ExpenseForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>
    </>
  )
}
