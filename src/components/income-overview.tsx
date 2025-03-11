'use client'

import { Card, Table, Text, Group } from '@mantine/core'
import { Income, IncomeCategory } from '@/stores/instantdb'

interface IncomeOverviewProps {
  incomes: Income[]
  incomeCategories: IncomeCategory[]
  selectedYear: number
  selectedMonth: number
}

export function IncomeOverview({ incomes, incomeCategories, selectedYear, selectedMonth }: IncomeOverviewProps) {
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md">
        <div>
          <Text fw={500} size="lg">Income Categories</Text>
          <Text size="sm" c="dimmed">Overview of your income categories for the selected month</Text>
        </div>
      </Group>
      
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Category</Table.Th>
            <Table.Th ta="right">Current Income</Table.Th>
            <Table.Th ta="right">Year-to-Date Income</Table.Th>
            <Table.Th ta="right">Annual Income</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {incomeCategories.map((category) => {
            const currentMonthlyIncome = calculateCategoryAmount(incomes, category.id)
            const currentYearToDateIncome = calculateCategoryAmount(incomes, category.id, false, true)
            const currentAnnualIncome = calculateCategoryAmount(incomes, category.id, true)

            return (
              <Table.Tr key={category.id}>
                <Table.Td fw={500}>{category.title}</Table.Td>
                <Table.Td ta="right">{formatCurrency(currentMonthlyIncome)}</Table.Td>
                <Table.Td ta="right">{formatCurrency(currentYearToDateIncome)}</Table.Td>
                <Table.Td ta="right">{formatCurrency(currentAnnualIncome)}</Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Card>
  )
}
