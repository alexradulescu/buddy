'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { SelectSingleEventHandler } from 'react-day-picker'
import { DatePickerInput } from '@mantine/dates'

interface DatePickerProps {
  date: Date
  onDateChange: SelectSingleEventHandler
  className?: string
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  return (
    <DatePickerInput
      value={date}
      onChange={(value) => {
        const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : new Date()
        onDateChange(dateValue, dateValue, {}, {} as any)
      }}
      valueFormat="YYYY-MM-DD"
      className={className}
    />
  )
}
