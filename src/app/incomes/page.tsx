'use client'

import React from 'react'

import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { PageHeader } from '@/components/page-header'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <>
      <PageHeader title="Incomes" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
        <div>
          <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>
    </>
  )
}
