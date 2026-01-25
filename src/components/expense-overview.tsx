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

  // Art deco muted colors
  if (percentageDifference > 20) return { backgroundColor: 'rgba(74, 124, 89, 0.08)' }
  if (percentageDifference >= 0) return { backgroundColor: 'rgba(196, 160, 82, 0.08)' }
  return { backgroundColor: 'rgba(166, 93, 87, 0.08)' }
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
    <ScrollArea className="scrollable-zone">
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
                        underline="hover"
                        style={{
                          color: '#C4A052',
                          fontWeight: 500,
                        }}
                      >
                        {category.name}
                      </Anchor>
                    </Table.Td>
                    <Table.Td
                      ta="right"
                      className="numeric-value"
                      style={{
                        color: currentMonthlyExpense > (category.maxBudget || 0) ? '#A65D57' : undefined
                      }}
                    >
                      {formatCurrency(currentMonthlyExpense)}
                    </Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {monthlyDifference !== undefined && (
                        <Badge
                          size="xs"
                          variant="light"
                          mr="xs"
                          styles={{
                            root: {
                              backgroundColor: monthlyDifference >= 0 ? 'rgba(74, 124, 89, 0.12)' : 'rgba(166, 93, 87, 0.12)',
                              color: monthlyDifference >= 0 ? '#4A7C59' : '#A65D57',
                            }
                          }}
                        >
                          {monthlyDifference >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(monthlyDifference))}
                        </Badge>
                      )}
                      {formatCurrency(category.maxBudget)}
                    </Table.Td>

                    <Table.Td ta="right" className="numeric-value">{formatCurrency(currentYearToDateExpense)}</Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {yearToDateDifference !== undefined && (
                        <Badge
                          size="xs"
                          variant="light"
                          mr="xs"
                          styles={{
                            root: {
                              backgroundColor: yearToDateDifference >= 0 ? 'rgba(74, 124, 89, 0.12)' : 'rgba(166, 93, 87, 0.12)',
                              color: yearToDateDifference >= 0 ? '#4A7C59' : '#A65D57',
                            }
                          }}
                        >
                          {yearToDateDifference >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(yearToDateDifference))}
                        </Badge>
                      )}
                      {formatCurrency(yearToDateBudget)}
                    </Table.Td>
                    <Table.Td ta="right" className="numeric-value">
                      {annualDifference !== undefined && (
                        <Badge
                          size="xs"
                          variant="light"
                          mr="xs"
                          styles={{
                            root: {
                              backgroundColor: annualDifference >= 0 ? 'rgba(74, 124, 89, 0.12)' : 'rgba(166, 93, 87, 0.12)',
                              color: annualDifference >= 0 ? '#4A7C59' : '#A65D57',
                            }
                          }}
                        >
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
