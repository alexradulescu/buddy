'use client'

import React from 'react'
import { ExpenseAiConverter } from '@/components/expense-ai-converter'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { PageHeader } from '@/components/page-header'
import { Card, Tabs } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Expenses" />

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">Expense List</Tabs.Tab>
          <Tabs.Tab value="add">Add Expense</Tabs.Tab>
          <Tabs.Tab value="ai">AI Converter</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="add" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ExpenseForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="ai" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ExpenseAiConverter onExpensesGenerated={() => {}} />
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
