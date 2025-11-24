'use client'

import { useMemo } from 'react'
import { Income, IncomeCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Card, Table, Title, Text, Anchor, ScrollArea } from '@mantine/core'

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

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <Card withBorder shadow="sm" radius="md" padding="0">
      <Card.Section withBorder inheritPadding py="md">
        <Title order={3} size="h4" mb={4}>Income Categories</Title>
        <Text size="sm" c="dimmed">
          Overview of your income categories for the selected month
        </Text>
      </Card.Section>
      <Card.Section>
        <ScrollArea>
          <Table style={{ minWidth: 600 }}>
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
              const data = categoryData[category.id] || { monthlyIncome: 0, yearToDateIncome: 0, annualIncome: 0 }

              return (
                <Table.Tr key={category.id}>
                  <Table.Td fw={500}>
                    <Anchor
                      component={NavLink}
                      to={{
                        pathname: '/incomes',
                        search: `?month=${selectedMonth}&year=${selectedYear}&categoryIncome=${category.id}`
                      }}
                      c="green.6"
                      underline="hover"
                    >
                      {category.title}
                    </Anchor>
                  </Table.Td>
                  <Table.Td ta="right" className="numeric-value">{formatCurrency(data.monthlyIncome)}</Table.Td>
                  <Table.Td ta="right" className="numeric-value">{formatCurrency(data.yearToDateIncome)}</Table.Td>
                  <Table.Td ta="right" className="numeric-value">{formatCurrency(data.annualIncome)}</Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card.Section>
    </Card>
  )
}
