'use client'

import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Badge, Card, Table, Tooltip } from '@mantine/core'

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
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="md">
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Expense Categories</h3>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--mantine-color-dimmed)' }}>
          Overview of your expense categories for the selected month
        </p>
      </Card.Section>
      <Card.Section>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Tooltip label="Category of the expense">
                <Table.Th>Category</Table.Th>
              </Tooltip>
              <Tooltip label="Current expenses for this month.">
                <Table.Th style={{ textAlign: 'right' }}>Current Expense</Table.Th>
              </Tooltip>
              <Tooltip label="Monthly budget set for this category.">
                <Table.Th style={{ textAlign: 'right' }}>Monthly Budget</Table.Th>
              </Tooltip>
              <Tooltip label="Expenses for this category, so far this year.">
                <Table.Th style={{ textAlign: 'right' }}>Year-to-Date Expense</Table.Th>
              </Tooltip>
              <Tooltip label="Year to date budget for this category.">
                <Table.Th style={{ textAlign: 'right' }}>Year-to-Date Budget</Table.Th>
              </Tooltip>
              <Tooltip label="Annual budget for this category.">
                <Table.Th style={{ textAlign: 'right' }}>Annual Budget</Table.Th>
              </Tooltip>
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
                <Table.Tr key={category.id} style={rowColor}>
                  <Table.Td style={{ fontWeight: 500 }}>
                    <NavLink
                      to={{
                        pathname: '/expenses',
                        search: `?month=${selectedMonth}&year=${selectedYear}&categoryExpense=${category.id}`
                      }}
                      prefetch="intent"
                      style={{ color: 'var(--mantine-color-green-filled)', textDecoration: 'none' }}
                    >
                      {category.name}
                    </NavLink>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(currentMonthlyExpense)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {monthlyDifference !== undefined && (
                      <Badge color={monthlyDifference >= 0 ? 'gray' : 'red'} variant="light">
                        {monthlyDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(monthlyDifference))}
                      </Badge>
                    )}
                    {' '}
                    {formatCurrency(category.maxBudget)}
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(currentYearToDateExpense)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {yearToDateDifference !== undefined && (
                      <Badge color={yearToDateDifference >= 0 ? 'gray' : 'red'} variant="light">
                        {yearToDateDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(yearToDateDifference))}
                      </Badge>
                    )}
                    {' '}
                    {formatCurrency(yearToDateBudget)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {annualDifference !== undefined && (
                      <Badge color={annualDifference >= 0 ? 'gray' : 'red'} variant="light">
                        {annualDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(annualDifference))}
                      </Badge>
                    )}
                    {' '}
                    {formatCurrency(annualBudget)}
                  </Table.Td>
                </Table.Tr>
              )
            )}
          </Table.Tbody>
        </Table>
      </Card.Section>
    </Card>
  )
}
