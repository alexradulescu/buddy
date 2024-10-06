'use client'

import { parseAsInteger, useQueryState } from 'nuqs'

export function useSharedQueryParams() {
  const currentDate = new Date()

  const [selectedYear, setSelectedYear] = useQueryState('year', parseAsInteger.withDefault(currentDate.getFullYear()))
  const [selectedMonth, setSelectedMonth] = useQueryState('month', parseAsInteger.withDefault(currentDate.getMonth()))

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth
  }
}
