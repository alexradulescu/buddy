'use client'

import React from 'react'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { PageHeader } from '@/components/page-header'
import { Card, Text, Group, SimpleGrid } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <>
      <PageHeader title="Incomes" />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <Text fw={500} size="lg">Add Income</Text>
          </Group>
          <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <Text fw={500} size="lg">Income List</Text>
          </Group>
          <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Card>
      </SimpleGrid>
    </>
  )
}
