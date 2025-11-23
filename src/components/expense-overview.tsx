'use client'

import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Anchor, Badge, Card, Table, Title, Text, Tooltip } from '@mantine/core'

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
        <Title order={3} size="h4" mb={4}>Expense Categories</Title>
        <Text size="sm" c="dimmed">
          Overview of your expense categories for the selected month
        </Text>
      </Card.Section>
      <Card.Section>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Tooltip label="Category of the expense">
                <Table.Th>Category</Table.Th>
              </Tooltip>
              <Tooltip label="Current expenses for this month.">
                <Table.Th ta="right">Current Expense</Table.Th>
              </Tooltip>
              <Tooltip label="Monthly budget set for this category.">
                <Table.Th ta="right">Monthly Budget</Table.Th>
              </Tooltip>
              <Tooltip label="Expenses for this category, so far this year.">
                <Table.Th ta="right">Year-to-Date Expense</Table.Th>
              </Tooltip>
              <Tooltip label="Year to date budget for this category.">
                <Table.Th ta="right">Year-to-Date Budget</Table.Th>
              </Tooltip>
              <Tooltip label="Annual budget for this category.">
                <Table.Th ta="right">Annual Budget</Table.Th>
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
                  <Table.Td fw={500}>
                    <Anchor
                      component={NavLink}
                      to={{
                        pathname: '/expenses',
                        search: `?month=${selectedMonth}&year=${selectedYear}&categoryExpense=${category.id}`
                      }}
                      c="green.6"
                      underline="hover"
                    >
                      {category.name}
                    </Anchor>
                  </Table.Td>
                  <Table.Td ta="right">{formatCurrency(currentMonthlyExpense)}</Table.Td>
                  <Table.Td ta="right">
                    {monthlyDifference !== undefined && (
                      <Badge color={monthlyDifference >= 0 ? 'gray' : 'red'} variant="light">
                        {monthlyDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(monthlyDifference))}
                      </Badge>
                    )}
                    {' '}
                    {formatCurrency(category.maxBudget)}
                  </Table.Td>

                  <Table.Td ta="right">{formatCurrency(currentYearToDateExpense)}</Table.Td>
                  <Table.Td ta="right">
                    {yearToDateDifference !== undefined && (
                      <Badge color={yearToDateDifference >= 0 ? 'gray' : 'red'} variant="light">
                        {yearToDateDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(yearToDateDifference))}
                      </Badge>
                    )}
                    {' '}
                    {formatCurrency(yearToDateBudget)}
                  </Table.Td>
                  <Table.Td ta="right">
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
