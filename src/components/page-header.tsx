'use client'

import React, { FC } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Popover } from '@mantine/core'
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
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h1>
          {description && <p style={{ color: 'var(--mantine-color-dimmed)' }}>{description}</p>}
        </div>
        {action ? (
          <div>{action}</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => handleMonthChange(-1)} aria-label="Previous month">
              <ChevronLeft size={16} />
            </Button>
            <MonthPickerInput
              value={selectedDate}
              onChange={(value) => {
                if (value) {
                  const date = new Date(value)
                  setSelectedMonth(date.getMonth())
                  setSelectedYear(date.getFullYear())
                }
              }}
              valueFormat="MMMM YYYY"
              style={{ width: '240px' }}
            />
            <Button variant="outline" onClick={() => handleMonthChange(1)} aria-label="Next month">
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
