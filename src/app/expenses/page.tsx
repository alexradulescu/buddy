'use client'

import { Card, Group, SimpleGrid, Text } from '@mantine/core'

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
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <Text fw={500} size="lg">Add Expenses</Text>
          </Group>
          <ExpenseForm selectedYear={selectedYear} selectedMonth={selectedMonth} initialExpenses={[]} />
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <Text fw={500} size="lg">Expense List</Text>
          </Group>
          <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Card>
      </SimpleGrid>
    </>
  )
}
