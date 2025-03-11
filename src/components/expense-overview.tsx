'use client'

import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { Card, Table, Text, Badge, Group, Tooltip } from '@mantine/core'

// Utility functions moved outside component to prevent recreation
const formatCurrency = (amount: number | undefined): string => {
  return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
}

const getRowBackgroundColor = (currentAmount: number, budget: number | undefined): string => {
  if (!budget || !currentAmount) return ''
  const difference = budget - currentAmount
  const percentageDifference = (difference / budget) * 100

  if (percentageDifference > 20) return 'green.1'
  if (percentageDifference >= 0) return 'orange.1'
  return 'red.1'
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
          const itemYear = itemDate.getFullYear()
          const itemMonth = itemDate.getMonth()

          if (isAnnual) {
            return item.categoryId === categoryId && itemYear === selectedYear
          }

          if (isYearToDate) {
            return (
              item.categoryId === categoryId &&
              itemYear === selectedYear &&
              itemMonth <= selectedMonth
            )
          }

          return (
            item.categoryId === categoryId &&
            itemYear === selectedYear &&
            itemMonth === selectedMonth
          )
        })
        .reduce((total, item) => total + item.amount, 0)
    },
    [selectedYear, selectedMonth]
  )

  const categoryData = useMemo(() => {
    return expenseCategories.map((category) => {
      const currentMonthlyExpense = calculateCategoryAmount(expenses, category.id)
      const currentYearToDateExpense = calculateCategoryAmount(expenses, category.id, false, true)
      const currentAnnualExpense = calculateCategoryAmount(expenses, category.id, true)

      const monthlyBudget = category.maxBudget
      const yearToDateBudget = monthlyBudget ? monthlyBudget * (selectedMonth + 1) : undefined
      const annualBudget = monthlyBudget ? monthlyBudget * 12 : undefined

      const monthlyDifference = monthlyBudget ? monthlyBudget - currentMonthlyExpense : undefined
      const yearToDateDifference = yearToDateBudget
        ? yearToDateBudget - currentYearToDateExpense
        : undefined
      const annualDifference = annualBudget ? annualBudget - currentAnnualExpense : undefined

      const rowColor = getRowBackgroundColor(currentMonthlyExpense, monthlyBudget)

      return {
        category,
        currentMonthlyExpense,
        currentYearToDateExpense,
        currentAnnualExpense,
        monthlyBudget,
        yearToDateBudget,
        annualBudget,
        monthlyDifference,
        yearToDateDifference,
        annualDifference,
        rowColor
      }
    })
  }, [expenses, expenseCategories, calculateCategoryAmount, selectedMonth])

  const totalMonthlyExpense = useMemo(
    () => expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === selectedYear &&
          expenseDate.getMonth() === selectedMonth
        )
      })
      .reduce((total, expense) => total + expense.amount, 0),
    [expenses, selectedYear, selectedMonth]
  )

  const totalYearToDateExpense = useMemo(
    () => expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === selectedYear &&
          expenseDate.getMonth() <= selectedMonth
        )
      })
      .reduce((total, expense) => total + expense.amount, 0),
    [expenses, selectedYear, selectedMonth]
  )

  const totalAnnualExpense = useMemo(
    () => expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === selectedYear
      })
      .reduce((total, expense) => total + expense.amount, 0),
    [expenses, selectedYear]
  )

  const totalMonthlyBudget = useMemo(
    () => expenseCategories.reduce((total, category) => total + (category.maxBudget || 0), 0),
    [expenseCategories]
  )

  const totalYearToDateBudget = totalMonthlyBudget * (selectedMonth + 1)
  const totalAnnualBudget = totalMonthlyBudget * 12

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section p="md" bg="gray.1">
        <Text fw={500} size="lg">Expense Overview</Text>
      </Card.Section>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Category</Table.Th>
            <Table.Th ta="right">Monthly</Table.Th>
            <Table.Th ta="right">Budget</Table.Th>
            <Table.Th ta="right">YTD</Table.Th>
            <Table.Th ta="right">YTD Budget</Table.Th>
            <Table.Th ta="right">Annual</Table.Th>
            <Table.Th ta="right">Annual Budget</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categoryData.map(({ 
              category, 
              currentMonthlyExpense, 
              currentYearToDateExpense, 
              currentAnnualExpense, 
              monthlyBudget, 
              yearToDateBudget,
              annualBudget,
              monthlyDifference,
              yearToDateDifference,
              annualDifference,
              rowColor
            }) => (
              <Table.Tr key={category.id} bg={rowColor}>
                <Table.Td fw={500}>{category.name}</Table.Td>
                <Table.Td ta="right">
                  <Text data-numeric={true}>{formatCurrency(currentMonthlyExpense)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  {monthlyDifference !== undefined && (
                    <Badge color={monthlyDifference >= 0 ? 'gray' : 'red'} variant="outline" mr="xs">
                      <Text data-numeric={true} span>
                        {monthlyDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(monthlyDifference))}
                      </Text>
                    </Badge>
                  )}
                  <Text data-numeric={true} span>{formatCurrency(category.maxBudget)}</Text>
                </Table.Td>

                <Table.Td ta="right">
                  <Text data-numeric={true}>{formatCurrency(currentYearToDateExpense)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  {yearToDateDifference !== undefined && (
                    <Badge color={yearToDateDifference >= 0 ? 'gray' : 'red'} variant="outline" mr="xs">
                      <Text data-numeric={true} span>
                        {yearToDateDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(yearToDateDifference))}
                      </Text>
                    </Badge>
                  )}
                  <Text data-numeric={true} span>{formatCurrency(yearToDateBudget)}</Text>
                </Table.Td>

                <Table.Td ta="right">
                  <Text data-numeric={true}>{formatCurrency(currentAnnualExpense)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  {annualDifference !== undefined && (
                    <Badge color={annualDifference >= 0 ? 'gray' : 'red'} variant="outline" mr="xs">
                      <Text data-numeric={true} span>
                        {annualDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(annualDifference))}
                      </Text>
                    </Badge>
                  )}
                  <Text data-numeric={true} span>{formatCurrency(annualBudget)}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          <Table.Tr fw={700}>
            <Table.Td>Total</Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalMonthlyExpense)}</Text></Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalMonthlyBudget)}</Text></Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalYearToDateExpense)}</Text></Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalYearToDateBudget)}</Text></Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalAnnualExpense)}</Text></Table.Td>
            <Table.Td ta="right"><Text data-numeric={true}>{formatCurrency(totalAnnualBudget)}</Text></Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  )
}
