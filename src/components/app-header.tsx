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
      {/* Title with elegant serif typography */}
      <Title
        order={1}
        size="h4"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: '#1C1C1C',
        }}
      >
        {title}
      </Title>

      {/* Month picker with refined styling */}
      <Group gap={0} wrap="nowrap">
        <ActionIcon
          variant="subtle"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous month"
          size="lg"
          radius={0}
          styles={{
            root: {
              borderTopLeftRadius: '3px',
              borderBottomLeftRadius: '3px',
              border: '1px solid rgba(28, 28, 28, 0.1)',
              borderRight: 'none',
              backgroundColor: '#FAF8F5',
              color: '#6B6B6B',
              '&:hover': {
                backgroundColor: 'rgba(196, 160, 82, 0.08)',
                color: '#C4A052',
              },
            }
          }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </ActionIcon>

        <Box
          style={{
            borderTop: '1px solid rgba(28, 28, 28, 0.1)',
            borderBottom: '1px solid rgba(28, 28, 28, 0.1)',
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
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: '#1C1C1C',
                backgroundColor: '#FAF8F5',
                height: '34px',
                minHeight: '34px',
                padding: '0 4px',
                '&:focus': {
                  backgroundColor: 'rgba(196, 160, 82, 0.08)',
                },
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
              borderTopRightRadius: '3px',
              borderBottomRightRadius: '3px',
              border: '1px solid rgba(28, 28, 28, 0.1)',
              borderLeft: 'none',
              backgroundColor: '#FAF8F5',
              color: '#6B6B6B',
              '&:hover': {
                backgroundColor: 'rgba(196, 160, 82, 0.08)',
                color: '#C4A052',
              },
            }
          }}
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </ActionIcon>
      </Group>
    </Group>
  )
}
