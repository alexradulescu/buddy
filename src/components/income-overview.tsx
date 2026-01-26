'use client'

import { useMemo } from 'react'
import { Income, IncomeCategory } from '@/stores/instantdb'
import { NavLink } from 'react-router'
import { Table, Anchor, ScrollArea } from '@mantine/core'

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
  const categoryData = useMemo(() => {
    const data: CategoryData = {}

    incomeCategories.forEach((category) => {
      data[category.id] = {
        monthlyIncome: 0,
        yearToDateIncome: 0,
        annualIncome: 0
      }
    })

    incomes.forEach((income) => {
      const categoryId = income.categoryId
      const amount = income.amount || 0

      if (!data[categoryId]) return

      const itemDate = new Date(income.date)
      const itemYear = itemDate.getUTCFullYear()
      const itemMonth = itemDate.getUTCMonth()

      if (itemYear === selectedYear) {
        data[categoryId].annualIncome += amount

        if (itemMonth <= selectedMonth) {
          data[categoryId].yearToDateIncome += amount

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
    <ScrollArea className="scrollable-zone">
      <Table striped highlightOnHover miw={600} fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th pl="md">Category</Table.Th>
            <Table.Th ta="right">Current</Table.Th>
            <Table.Th ta="right">Year-to-Date</Table.Th>
            <Table.Th ta="right" pr="md">Annual</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {incomeCategories.map((category) => {
            const data = categoryData[category.id] || { monthlyIncome: 0, yearToDateIncome: 0, annualIncome: 0 }

            return (
              <Table.Tr key={category.id}>
                <Table.Td fw={500} pl="md">
                  <Anchor
                    component={NavLink}
                    to={{
                      pathname: '/incomes',
                      search: `?month=${selectedMonth}&year=${selectedYear}&categoryIncome=${category.id}`
                    }}
                    underline="hover"
                    style={{ color: '#1B4332', fontWeight: 500 }}
                  >
                    {category.title}
                  </Anchor>
                </Table.Td>
                <Table.Td
                  ta="right"
                  className="numeric-value"
                  style={{ color: data.monthlyIncome > 0 ? '#2D6A4F' : undefined }}
                >
                  {formatCurrency(data.monthlyIncome)}
                </Table.Td>
                <Table.Td
                  ta="right"
                  className="numeric-value"
                  style={{ color: data.yearToDateIncome > 0 ? '#2D6A4F' : undefined }}
                >
                  {formatCurrency(data.yearToDateIncome)}
                </Table.Td>
                <Table.Td
                  ta="right"
                  className="numeric-value"
                  pr="md"
                  style={{ color: data.annualIncome > 0 ? '#2D6A4F' : undefined }}
                >
                  {formatCurrency(data.annualIncome)}
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
