'use client'

import React, { FC } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action ? (
          <div>{action}</div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleMonthChange(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  onSelect={(date) => {
                    if (date) {
                      setSelectedMonth(date.getMonth())
                      setSelectedYear(date.getFullYear())
                    }
                  }}
                  initialFocus
                  month={new Date(selectedYear, selectedMonth)}
                  defaultMonth={new Date(selectedYear, selectedMonth)}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => handleMonthChange(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
