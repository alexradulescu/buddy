import { useSearch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export type SharedSearchParams = {
  year?: number
  month?: number
  categoryExpense?: string
  categoryIncome?: string
}

export function validateSearch(search: Record<string, unknown>): SharedSearchParams {
  return {
    year: search.year !== undefined ? Number(search.year) : undefined,
    month: search.month !== undefined ? Number(search.month) : undefined,
    categoryExpense: typeof search.categoryExpense === 'string' ? search.categoryExpense : undefined,
    categoryIncome: typeof search.categoryIncome === 'string' ? search.categoryIncome : undefined,
  }
}

export function useSharedQueryParams() {
  const currentDate = new Date()
  const search = useSearch({ strict: false }) as SharedSearchParams
  const navigate = useNavigate()

  const selectedYear = search.year ?? currentDate.getFullYear()
  const selectedMonth = search.month ?? currentDate.getMonth()

  const setSelectedYear = useCallback(
    (year: number) => {
      void (navigate as any)({ search: (prev: SharedSearchParams) => ({ ...prev, year }) })
    },
    [navigate]
  )

  const setSelectedMonth = useCallback(
    (month: number) => {
      void (navigate as any)({ search: (prev: SharedSearchParams) => ({ ...prev, month }) })
    },
    [navigate]
  )

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
  }
}
