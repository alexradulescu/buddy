'use client'

import React from 'react'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { Card, SimpleGrid } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      {/* Left Panel - Add Income Form */}
      <Card withBorder p="lg">
        <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
      </Card>

      {/* Right Panel - Income List */}
      <Card withBorder p="lg">
        <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
      </Card>
    </SimpleGrid>
  )
}
