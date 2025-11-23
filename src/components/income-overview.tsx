'use client'

import { useMemo } from 'react'
import { Income, IncomeCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Card, Table } from '@mantine/core'

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
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="md">
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Income Categories</h3>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--mantine-color-dimmed)' }}>
          Overview of your income categories for the selected month
        </p>
      </Card.Section>
      <Card.Section>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Category</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Current Income</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Year-to-Date Income</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Annual Income</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {incomeCategories.map((category) => {
              const data = categoryData[category.id] || { monthlyIncome: 0, yearToDateIncome: 0, annualIncome: 0 }

              return (
                <Table.Tr key={category.id}>
                  <Table.Td style={{ fontWeight: 500 }}>
                    <NavLink
                      to={{
                        pathname: '/incomes',
                        search: `?month=${selectedMonth}&year=${selectedYear}&categoryIncome=${category.id}`
                      }}
                      prefetch="intent"
                      style={{ color: 'var(--mantine-color-green-filled)', textDecoration: 'none' }}
                    >
                      {category.title}
                    </NavLink>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(data.monthlyIncome)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(data.yearToDateIncome)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(data.annualIncome)}</Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Card.Section>
    </Card>
  )
}
