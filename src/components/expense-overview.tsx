'use client'

import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Utility functions moved outside component to prevent recreation
const formatCurrency = (amount: number | undefined): string => {
  return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
}

const getRowBackgroundColor = (currentAmount: number, budget: number | undefined): string => {
  if (!budget || !currentAmount) return ''
  const difference = budget - currentAmount
  const percentageDifference = (difference / budget) * 100

  if (percentageDifference > 20) return 'bg-green-100 dark:bg-green-950'
  if (percentageDifference >= 0) return 'bg-orange-100 dark:bg-orange-950'
  return 'bg-red-100 dark:bg-red-950'
}

interface ExpenseOverviewProps {
  expenses: Expense[]
  expenseCategories: ExpenseCategory[]
  selectedYear: number
  selectedMonth: number
}

export function ExpenseOverview({ expenses, expenseCategories, selectedYear, selectedMonth }: ExpenseOverviewProps) {
  const calculateCategoryAmount = useCallback(
    (items: Expense[], categoryId: string, isAnnual: boolean = false, isYearToDate: boolean = false): number => {
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
    },
    [selectedYear, selectedMonth]
  )

  const calculateAnnualBudget = useCallback(
    (maxBudget: number | undefined, maxAnnualBudget: number | undefined): number | undefined => {
      if (maxAnnualBudget !== undefined) return maxAnnualBudget
      if (maxBudget !== undefined) return maxBudget * 12
      return undefined
    },
    []
  )

  const calculateYearToDateBudget = useCallback(
    (maxBudget: number | undefined): number | undefined => {
      if (maxBudget === undefined) return undefined
      return maxBudget * (selectedMonth + 1)
    },
    [selectedMonth]
  )

  const expenseCategoriesData = useMemo(
    () =>
      expenseCategories
        .filter((expense) => !expense.isArchived)
        .map((category) => {
          const currentMonthlyExpense = calculateCategoryAmount(expenses, category.id)
          const currentAnnualExpense = calculateCategoryAmount(expenses, category.id, true)
          const currentYearToDateExpense = calculateCategoryAmount(expenses, category.id, false, true)
          const annualBudget = calculateAnnualBudget(category.maxBudget, category.maxAnnualBudget)
          const yearToDateBudget = calculateYearToDateBudget(category.maxBudget)

          return {
            category,
            currentMonthlyExpense,
            currentAnnualExpense,
            currentYearToDateExpense,
            annualBudget,
            yearToDateBudget,
            monthlyDifference:
              category.maxBudget !== undefined ? category.maxBudget - currentMonthlyExpense : undefined,
            annualDifference: annualBudget !== undefined ? annualBudget - currentAnnualExpense : undefined,
            yearToDateDifference:
              yearToDateBudget !== undefined ? yearToDateBudget - currentYearToDateExpense : undefined,
            rowColor: getRowBackgroundColor(currentMonthlyExpense, category.maxBudget)
          }
        }),
    [expenseCategories, expenses, calculateCategoryAmount, calculateAnnualBudget, calculateYearToDateBudget]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>Overview of your expense categories for the selected month</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead>Category</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Category of the expense</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-right">Current Expense</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Current expenses for this month.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-right">Monthly Budget</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Monthly budget set for this category.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-right">Year-to-Date Expense</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Expenses for this category, so far this year.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-right">Year-to-Date Budget</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Year to date budget for this category.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-right">Annual Budget</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>Annual budget for this category.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableRow>
          </TableHeader>

          <TableBody>
            {expenseCategoriesData.map(
              ({
                category,
                currentMonthlyExpense,
                currentYearToDateExpense,
                yearToDateBudget,
                annualBudget,
                monthlyDifference,
                yearToDateDifference,
                annualDifference,
                rowColor
              }) => (
                <TableRow key={category.id} className={rowColor}>
                  <TableCell className="font-medium">
                    <NavLink
                      to={{
                        pathname: '/expenses',
                        search: `?month=${selectedMonth}&year=${selectedYear}&categoryExpense=${category.id}`
                      }}
                      prefetch="intent"
                      className="text-green-600 hover:underline"
                    >
                      {category.name}
                    </NavLink>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMonthlyExpense)}</TableCell>
                  <TableCell className="text-right">
                    {monthlyDifference !== undefined && (
                      <Badge variant={monthlyDifference >= 0 ? 'outline' : 'destructive'}>
                        {monthlyDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(monthlyDifference))}
                      </Badge>
                    )}
                    {formatCurrency(category.maxBudget)}
                  </TableCell>

                  <TableCell className="text-right">{formatCurrency(currentYearToDateExpense)}</TableCell>
                  <TableCell className="text-right">
                    {yearToDateDifference !== undefined && (
                      <Badge variant={yearToDateDifference >= 0 ? 'outline' : 'destructive'}>
                        {yearToDateDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(yearToDateDifference))}
                      </Badge>
                    )}
                    {formatCurrency(yearToDateBudget)}
                  </TableCell>
                  <TableCell className="text-right">
                    {annualDifference !== undefined && (
                      <Badge variant={annualDifference >= 0 ? 'outline' : 'destructive'}>
                        {annualDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(annualDifference))}
                      </Badge>
                    )}
                    {formatCurrency(annualBudget)}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
