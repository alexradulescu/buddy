'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Income, IncomeCategory } from '@/stores/instantdb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'

interface IncomeOverviewProps {
  incomes: Income[]
  incomeCategories: IncomeCategory[]
  selectedYear: number
  selectedMonth: number
}

export function IncomeOverview({ incomes, incomeCategories, selectedYear, selectedMonth }: IncomeOverviewProps) {
  const router = useRouter()

  const handleCategoryClick = useCallback((categoryId: string) => {
    const params = new URLSearchParams()
    params.set('categoryIncome', categoryId)
    router.push(`/incomes?${params.toString()}`)
  }, [router])
  const calculateCategoryAmount = (
    items: Income[],
    categoryId: string,
    isAnnual: boolean = false,
    isYearToDate: boolean = false
  ): number => {
    return items
      .filter((item) => {
        const itemDate = new Date(item.date)
        if (isAnnual) {
          return itemDate.getFullYear() === selectedYear && item.categoryId === categoryId
        }
        if (isYearToDate) {
          return (
            itemDate.getFullYear() === selectedYear &&
            itemDate.getMonth() <= selectedMonth &&
            item.categoryId === categoryId
          )
        }
        return (
          itemDate.getFullYear() === selectedYear &&
          itemDate.getMonth() === selectedMonth &&
          item.categoryId === categoryId
        )
      })
      .reduce((total, item) => total + (item.amount || 0), 0)
  }

  const formatCurrency = (amount: number | undefined): string => {
    return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Categories</CardTitle>
        <CardDescription>Overview of your income categories for the selected month</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Income</TableHead>
              <TableHead className="text-right">Year-to-Date Income</TableHead>
              <TableHead className="text-right">Annual Income</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeCategories.map((category) => {
              const currentMonthlyIncome = calculateCategoryAmount(incomes, category.id)
              const currentYearToDateIncome = calculateCategoryAmount(incomes, category.id, false, true)
              const currentAnnualIncome = calculateCategoryAmount(incomes, category.id, true)

              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCategoryClick(category.id)
                      }}
                    >
                      {category.title}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMonthlyIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentYearToDateIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentAnnualIncome)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
