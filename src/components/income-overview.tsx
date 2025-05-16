'use client'

import { useCallback, useMemo } from 'react'
import { Income, IncomeCategory } from '@/stores/instantdb'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface IncomeOverviewProps {
  incomes: Income[]
  incomeCategories: IncomeCategory[]
  selectedYear: number
  selectedMonth: number
}

type CategorySummary = {
  monthlyIncome: number
  yearToDateIncome: number
  annualIncome: number
}

type CategoryData = Record<string, CategorySummary>

export function IncomeOverview({ incomes, incomeCategories, selectedYear, selectedMonth }: IncomeOverviewProps) {
  const router = useRouter()

  // Preprocess all data in a single pass
  const categoryData = useMemo(() => {
    // Initialize data structure for all categories
    const data: CategoryData = {}

    // Initialize with zero values for all categories
    incomeCategories.forEach((category) => {
      data[category.id] = {
        monthlyIncome: 0,
        yearToDateIncome: 0,
        annualIncome: 0
      }
    })

    // Process all incomes in a single loop
    incomes.forEach((income) => {
      const categoryId = income.categoryId
      const amount = income.amount || 0

      // Skip if category doesn't exist in our data structure
      if (!data[categoryId]) return

      const itemDate = new Date(income.date)
      const itemYear = itemDate.getUTCFullYear()
      const itemMonth = itemDate.getUTCMonth()

      // Only process if it's in the selected year
      if (itemYear === selectedYear) {
        // Add to annual income for this category
        data[categoryId].annualIncome += amount

        // If month is <= selected month, add to year-to-date
        if (itemMonth <= selectedMonth) {
          data[categoryId].yearToDateIncome += amount

          // If it's the exact month, add to monthly income
          if (itemMonth === selectedMonth) {
            data[categoryId].monthlyIncome += amount
          }
        }
      }
    })

    return data
  }, [incomes, incomeCategories, selectedYear, selectedMonth])

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams()
      params.set('categoryIncome', categoryId)
      router.push(`/incomes?${params.toString()}`)
    },
    [router]
  )

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`
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
              const data = categoryData[category.id] || { monthlyIncome: 0, yearToDateIncome: 0, annualIncome: 0 }

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
                  <TableCell className="text-right">{formatCurrency(data.monthlyIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.yearToDateIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.annualIncome)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
