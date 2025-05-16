'use client'

import React from 'react'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <>
      <PageHeader title="Incomes" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Income</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income List</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
