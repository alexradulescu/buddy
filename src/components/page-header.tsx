'use client'

import React, { FC } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ActionIcon, Group, Stack, Title, Text } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

interface Props {
  title: string
  description?: string
  action?: React.ReactNode
}

export const PageHeader: FC<Props> = ({ title, description, action }) => {
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

  return (
    <Stack mb="xl">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">{title}</Title>
          {description && <Text c="dimmed">{description}</Text>}
        </Stack>
        {action || (
          <Group gap={0}>
            <ActionIcon
              variant="outline"
              onClick={() => handleMonthChange(-1)}
              aria-label="Previous month"
              size="lg"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
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
              style={{ width: '100px' }}
              styles={{
                input: {
                  borderRadius: 0,
                  borderLeft: 0,
                  borderRight: 0
                }
              }}
            />
            <ActionIcon
              variant="outline"
              onClick={() => handleMonthChange(1)}
              aria-label="Next month"
              size="lg"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <ChevronRight size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Stack>
  )
}
