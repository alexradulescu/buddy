'use client'

import React, { useEffect, useState } from 'react'

import { useCategoryStore } from '@/stores/category-store'
import { useExpenseStore } from '@/stores/expense-store'

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const categoryHydrated = useCategoryStore((state) => state.isHydrated)
  const expenseHydrated = useExpenseStore((state) => state.isHydrated)

  useEffect(() => {
    if (categoryHydrated && expenseHydrated) {
      setIsHydrated(true)
    }
  }, [categoryHydrated, expenseHydrated])

  if (!isHydrated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
