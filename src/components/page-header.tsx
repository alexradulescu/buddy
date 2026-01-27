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
    <Stack gap="xs" mb="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={2}>
          <Title order={1} size="h2">{title}</Title>
          {description && <Text size="sm" c="dimmed">{description}</Text>}
        </Stack>
        {action || (
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
        )}
      </Group>
    </Stack>
  )
}
