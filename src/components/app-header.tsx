'use client'

import React from 'react'
import { useLocation } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ActionIcon, Group, Title } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

const pageTitle: Record<string, string> = {
  '/': 'Budget Overview',
  '/expenses': 'Expenses',
  '/incomes': 'Incomes',
  '/investments': 'Investments',
  '/accounts': 'Accounts',
  '/settings': 'Settings'
}

export function AppHeader() {
  const location = useLocation()
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useSharedQueryParams()

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment
    let newYear = selectedYear

    if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    } else if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    }

    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  const selectedDate = new Date(selectedYear, selectedMonth)
  const title = pageTitle[location.pathname] || 'Buddy'

  return (
    <Group justify="space-between" h="100%" px="md">
      <Title order={1} size="h3">{title}</Title>

      <Group gap={0} wrap="nowrap">
        <ActionIcon
          variant="default"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous month"
          size="lg"
          radius={0}
          styles={{
            root: {
              borderTopLeftRadius: 'var(--mantine-radius-default)',
              borderBottomLeftRadius: 'var(--mantine-radius-default)'
            }
          }}
        >
          <ChevronLeft size={16} />
        </ActionIcon>
        <MonthPickerInput
          value={selectedDate}
          onChange={(value) => {
            if (value) {
              const date = new Date(value)
              setSelectedMonth(date.getMonth())
              setSelectedYear(date.getFullYear())
            }
          }}
          valueFormat="MMM YY"
          w={80}
          styles={{
            input: {
              borderRadius: 0,
              borderLeft: 0,
              borderRight: 0,
              textAlign: 'center'
            }
          }}
        />
        <ActionIcon
          variant="default"
          onClick={() => handleMonthChange(1)}
          aria-label="Next month"
          size="lg"
          radius={0}
          styles={{
            root: {
              borderTopRightRadius: 'var(--mantine-radius-default)',
              borderBottomRightRadius: 'var(--mantine-radius-default)'
            }
          }}
        >
          <ChevronRight size={16} />
        </ActionIcon>
      </Group>
    </Group>
  )
}
