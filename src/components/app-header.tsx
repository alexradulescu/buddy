'use client'

import React from 'react'
import { useLocation } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ActionIcon, Group, Title, Box } from '@mantine/core'
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
      <Title order={1} size="h4" fw={600}>
        {title}
      </Title>

      {/* Month picker */}
      <Group gap={0} wrap="nowrap">
        <ActionIcon
          variant="subtle"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous month"
          size="lg"
          radius={0}
          styles={{
            root: {
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              border: '1px solid #E5E9EB',
              borderRight: 'none',
              backgroundColor: '#FFFFFF',
              color: '#6F767E',
              '&:hover': {
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                color: '#1B4332',
              },
            }
          }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </ActionIcon>

        <Box
          style={{
            borderTop: '1px solid #E5E9EB',
            borderBottom: '1px solid #E5E9EB',
          }}
        >
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
            w={76}
            styles={{
              input: {
                border: 'none',
                borderRadius: 0,
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1A1D1F',
                backgroundColor: '#FFFFFF',
                height: '34px',
                minHeight: '34px',
                padding: '0 4px',
              }
            }}
          />
        </Box>

        <ActionIcon
          variant="subtle"
          onClick={() => handleMonthChange(1)}
          aria-label="Next month"
          size="lg"
          radius={0}
          styles={{
            root: {
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              border: '1px solid #E5E9EB',
              borderLeft: 'none',
              backgroundColor: '#FFFFFF',
              color: '#6F767E',
              '&:hover': {
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                color: '#1B4332',
              },
            }
          }}
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </ActionIcon>
      </Group>
    </Group>
  )
}
