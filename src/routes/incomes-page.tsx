'use client'

import React from 'react'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { PageHeader } from '@/components/page-header'
import { Card } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Incomes" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Add Income</h2>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Income List</h2>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card.Section>
        </Card>
      </div>
    </div>
  )
}
