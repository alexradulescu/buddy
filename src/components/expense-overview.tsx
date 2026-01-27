import { useCallback, useMemo } from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { Link } from '@tanstack/react-router'
import { Anchor, Badge, Table, ScrollArea, Stack, Text } from '@mantine/core'

const formatCurrency = (amount: number | undefined): string => {
  return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
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
          }
        }),
    [expenseCategories, expenses, calculateCategoryAmount, calculateAnnualBudget, calculateYearToDateBudget]
  )

  return (
    <ScrollArea className="scrollable-zone">
      <Table striped highlightOnHover miw={800} fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th pl="md">Category</Table.Th>
            <Table.Th ta="right">Current</Table.Th>
            <Table.Th ta="right">Monthly Budget</Table.Th>
            <Table.Th ta="right">Year-to-Date</Table.Th>
            <Table.Th ta="right">YTD Budget</Table.Th>
            <Table.Th ta="right" pr="md">Annual Budget</Table.Th>
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
            }) => (
              <Table.Tr key={category.id}>
                <Table.Td fw={500} pl="md">
                  <Anchor
                    component={Link}
                    to="/expenses"
                    search={{ month: selectedMonth, year: selectedYear, categoryExpense: category.id } as any}
                    underline="hover"
                    fz="sm"
                    fw={500}
                    c="forest.7"
                  >
                    {category.name}
                  </Anchor>
                </Table.Td>
                <Table.Td
                  ta="right"
                  className="numeric-value"
                  style={{
                    color: currentMonthlyExpense > (category.maxBudget || 0) ? '#D64550' : undefined
                  }}
                >
                  {formatCurrency(currentMonthlyExpense)}
                </Table.Td>
                <Table.Td ta="right" className="numeric-value">
                  <Stack gap={0} align="flex-end">
                    <Text fz="sm">{formatCurrency(category.maxBudget)}</Text>
                    {monthlyDifference !== undefined && (
                      <Badge
                        size="xs"
                        variant="light"
                        styles={{
                          root: {
                            backgroundColor: monthlyDifference >= 0 ? 'rgba(45, 106, 79, 0.1)' : 'rgba(214, 69, 80, 0.1)',
                            color: monthlyDifference >= 0 ? '#2D6A4F' : '#D64550',
                          }
                        }}
                      >
                        {monthlyDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(monthlyDifference))}
                      </Badge>
                    )}
                  </Stack>
                </Table.Td>

                <Table.Td ta="right" className="numeric-value">{formatCurrency(currentYearToDateExpense)}</Table.Td>
                <Table.Td ta="right" className="numeric-value">
                  <Stack gap={0} align="flex-end">
                    <Text fz="sm">{formatCurrency(yearToDateBudget)}</Text>
                    {yearToDateDifference !== undefined && (
                      <Badge
                        size="xs"
                        variant="light"
                        styles={{
                          root: {
                            backgroundColor: yearToDateDifference >= 0 ? 'rgba(45, 106, 79, 0.1)' : 'rgba(214, 69, 80, 0.1)',
                            color: yearToDateDifference >= 0 ? '#2D6A4F' : '#D64550',
                          }
                        }}
                      >
                        {yearToDateDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(yearToDateDifference))}
                      </Badge>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td ta="right" className="numeric-value" pr="md">
                  <Stack gap={0} align="flex-end">
                    <Text fz="sm">{formatCurrency(annualBudget)}</Text>
                    {annualDifference !== undefined && (
                      <Badge
                        size="xs"
                        variant="light"
                        styles={{
                          root: {
                            backgroundColor: annualDifference >= 0 ? 'rgba(45, 106, 79, 0.1)' : 'rgba(214, 69, 80, 0.1)',
                            color: annualDifference >= 0 ? '#2D6A4F' : '#D64550',
                          }
                        }}
                      >
                        {annualDifference >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(annualDifference))}
                      </Badge>
                    )}
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
