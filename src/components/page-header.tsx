'use client'

import React, { FC, useState } from 'react'
import { format } from 'date-fns'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button, Group, Title, Popover } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

interface Props {
  title: string
}

export const PageHeader: FC<Props> = ({ title }) => {
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useSharedQueryParams()
  const [opened, setOpened] = useState(false)
  const [date, setDate] = useState(new Date(selectedYear, selectedMonth))

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
    setDate(new Date(newYear, newMonth))
  }

  return (
    <Group justify="space-between" mb="md" wrap="nowrap">
      <Title order={2} fw={400}>{title}</Title>
      <Group gap="xs">
        <Button variant="outline" size="sm" p={0} w={36} h={36} onClick={() => handleMonthChange(-1)}>
          <IconChevronLeft size={16} />
        </Button>
        <Popover opened={opened} onChange={setOpened} position="bottom" width="auto" shadow="md">
          <Popover.Target>
            <Button 
              variant="outline" 
              size="sm" 
              leftSection={<IconCalendar size={16} />}
              onClick={() => setOpened((o) => !o)}
            >
              {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
            </Button>
          </Popover.Target>
          <Popover.Dropdown p="md">
            <DatePicker
              date={date}
              onDateChange={setDate}
              defaultLevel="month"
              size="md"
              firstDayOfWeek={0}
              value={null}
              onChange={(newDate) => {
                if (newDate) {
                  setSelectedYear(newDate.getFullYear())
                  setSelectedMonth(newDate.getMonth())
                  setDate(new Date(newDate.getFullYear(), newDate.getMonth()))
                  setOpened(false)
                }
              }}
            />
          </Popover.Dropdown>
        </Popover>
        <Button variant="outline" size="sm" p={0} w={36} h={36} onClick={() => handleMonthChange(1)}>
          <IconChevronRight size={16} />
        </Button>
      </Group>
    </Group>
  )
}
