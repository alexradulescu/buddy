'use client'

import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Anchor, Badge, Table, ScrollArea } from '@mantine/core'

// Utility functions moved outside component to prevent recreation
const formatCurrency = (amount: number | undefined): string => {
  return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
}

const getRowBackgroundColor = (currentAmount: number, budget: number | undefined): React.CSSProperties => {
  if (!budget || !currentAmount) return {}
  const difference = budget - currentAmount
  const percentageDifference = (difference / budget) * 100

  if (percentageDifference > 20) return { backgroundColor: 'var(--mantine-color-green-1)' }
  if (percentageDifference >= 0) return { backgroundColor: 'var(--mantine-color-orange-1)' }
  return { backgroundColor: 'var(--mantine-color-red-1)' }
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
    <ScrollArea>
      <Table striped highlightOnHover miw={800}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th ta="right">Current</Table.Th>
                <Table.Th ta="right">Monthly Budget</Table.Th>
                <Table.Th ta="right">Year-to-Date</Table.Th>
                <Table.Th ta="right">YTD Budget</Table.Th>
                <Table.Th ta="right">Annual Budget</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
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
                  <Table.Tr key={category.id}>
                    <Table.Td fw={500}>
                      <Anchor
                        component={NavLink}
                        to={{
                          pathname: '/expenses',
                          search: `?month=${selectedMonth}&year=${selectedYear}&categoryExpense=${category.id}`
                        }}
                        c="blue.6"
                        underline="hover"
                      >
                        {category.name}
                      </Anchor>
                    </Table.Td>
                    <Table.Td ta="right" className="numeric-value" c={currentMonthlyExpense > (category.maxBudget || 0) ? 'red.6' : undefined}>
                      {formatCurrency(currentMonthlyExpense)}
                    </Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {monthlyDifference !== undefined && (
                        <Badge size="xs" color={monthlyDifference >= 0 ? 'gray' : 'red'} variant="light" mr="xs">
                          {monthlyDifference >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(monthlyDifference))}
                        </Badge>
                      )}
                      {formatCurrency(category.maxBudget)}
                    </Table.Td>

                    <Table.Td ta="right" className="numeric-value">{formatCurrency(currentYearToDateExpense)}</Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {yearToDateDifference !== undefined && (
                        <Badge size="xs" color={yearToDateDifference >= 0 ? 'gray' : 'red'} variant="light" mr="xs">
                          {yearToDateDifference >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(yearToDateDifference))}
                        </Badge>
                      )}
                      {formatCurrency(yearToDateBudget)}
                    </Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {annualDifference !== undefined && (
                        <Badge size="xs" color={annualDifference >= 0 ? 'gray' : 'red'} variant="light" mr="xs">
                          {annualDifference >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(annualDifference))}
                        </Badge>
                      )}
                      {formatCurrency(annualBudget)}
                    </Table.Td>
                  </Table.Tr>
                )
              )}
            </Table.Tbody>
          </Table>
    </ScrollArea>
  )
}
