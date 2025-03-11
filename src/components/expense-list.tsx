'use client'

import { ActionIcon, Box, Group, Table, Text, TextInput } from '@mantine/core'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import React, { useState } from 'react'

import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { expenses = [] } = {}, removeExpense } = useExpenseStore()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExpenses = expenses
    .filter((expense: Expense) => {
      const expenseDate = new Date(expense.date)
      const matchesDate = expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm)
      return matchesDate && matchesSearch
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((expense) => ({
      ...expense,
      category: expenseCategories.find((expenseCategory) => expenseCategory.id === expense.categoryId)?.name
    }))

  const handleDelete = (id: string) => {
    removeExpense(id)
    toast({
      title: 'Expense deleted',
      description: 'The expense has been successfully removed.'
    })
  }

  return (
    <Box>
      <Group mb="md">
        <TextInput
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size="1rem" />}
          style={{ flexGrow: 1 }}
        />
      </Group>
      
      {filteredExpenses.length === 0 ? (
        <Text ta="center" c="dimmed" py="md">No expenses found for this period.</Text>
      ) : (
        <Box style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
          <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <Table withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 120 }}>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th style={{ width: 100, textAlign: 'right' }}>Amount</Table.Th>
                  <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredExpenses.map((expense) => (
                  <Table.Tr key={expense.id}>
                    <Table.Td>{format(new Date(expense.date), 'dd MMM yyyy')}</Table.Td>
                    <Table.Td>{expense.description}</Table.Td>
                    <Table.Td>{expense.category}</Table.Td>
                    <Table.Td ta="right">${Number(expense.amount).toFixed(2)}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="filled" 
                        color="red" 
                        size="sm" 
                        onClick={() => handleDelete(expense.id)}
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  )
}
