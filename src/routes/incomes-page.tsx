'use client'

import React from 'react'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { Card, Stack, SimpleGrid, Title } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

export default function IncomesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md">
            <Title order={2} size="h4">Add Income</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <IncomeForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md">
            <Title order={2} size="h4">Income List</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <IncomeList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card.Section>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}
