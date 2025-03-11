'use client'

import React from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { IconTrash } from '@tabler/icons-react'
import { Table, NumberInput, Select, ActionIcon, Box, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'

interface ExpenseTableProps {
  expenses: Expense[]
  expenseCategories: ExpenseCategory[]
  onInputChange: (
    index: number,
    field: 'amount' | 'categoryId' | 'date' | 'description',
    value: string | number | Date
  ) => void
  onDeleteRow: (id: string) => void
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  expenseCategories,
  onInputChange,
  onDeleteRow
}) => {
  return (
    <Box style={{ overflow: 'auto' }}>
      <Box style={{ maxHeight: '50vh', overflow: 'auto' }}>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 80 }}>Amount</Table.Th>
              <Table.Th style={{ width: 130 }}>Category</Table.Th>
              <Table.Th style={{ width: 130 }}>Date</Table.Th>
              <Table.Th style={{ width: 220 }}>Description</Table.Th>
              <Table.Th style={{ width: 50 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.map((expense, index) => {
              return (
                <Table.Tr key={expense.id}>
                  <Table.Td p="xs">
                    <NumberInput
                      value={expense.amount}
                      onChange={(value) => onInputChange(index, 'amount', value || 0)}
                      step={0.01}
                      min={0}
                      required
                      style={{ width: '100%' }}
                      hideControls
                    />
                  </Table.Td>
                  <Table.Td p="xs">
                    <Select
                      value={expense.categoryId}
                      onChange={(value) => onInputChange(index, 'categoryId', value || '')}
                      data={expenseCategories
                        .filter((category) => !category.isArchived)
                        .map((category) => ({
                          value: category.id,
                          label: category.name
                        }))}
                      placeholder="Select Category"
                      style={{ width: '100%' }}
                      searchable
                      clearable
                    />
                  </Table.Td>
                  <Table.Td p="xs">
                    <DatePickerInput
                      value={new Date(expense.date)}
                      onChange={(date) => date && onInputChange(index, 'date', date)}
                      style={{ width: '100%' }}
                    />
                  </Table.Td>
                  <Table.Td p="xs">
                    <Textarea
                      value={expense.description}
                      onChange={(e) => onInputChange(index, 'description', e.target.value)}
                      style={{ width: '100%' }}
                      autosize
                      minRows={1}
                    />
                  </Table.Td>
                  <Table.Td p="xs">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => onDeleteRow(expense.id)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  )
}
