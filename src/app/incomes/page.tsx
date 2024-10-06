'use client'

import React from 'react'

import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useSharedQueryParams()

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Incomes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <IncomeList
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
        <div>
          <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>
    </>
  )
}
