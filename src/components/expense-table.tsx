'use client'

import React from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { Button, NumberInput, ScrollArea, Select, Stack, Table, Text, Textarea } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { TrashIcon } from 'lucide-react'

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
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
      </Text>
      <ScrollArea h="50vh">
        <Table withColumnBorders miw={700}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50}>#</Table.Th>
              <Table.Th w={100}>Date</Table.Th>
              <Table.Th miw={200}>Description</Table.Th>
              <Table.Th w={100}>Amount</Table.Th>
              <Table.Th w={150}>Category</Table.Th>
              <Table.Th w={60}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.map((expense, index) => (
              <Table.Tr key={expense.id}>
                <Table.Td ta="center" c="dimmed" p={0}>
                  {index + 1}
                </Table.Td>
                <Table.Td p={0}>
                  <DateInput
                    value={new Date(expense.date)}
                    onChange={(date) => onInputChange(index, 'date', date ?? new Date())}
                    valueFormat="DD MMM YY"
                    clearable={false}
                    styles={{ input: { borderRadius: 0, padding: '8px' } }}
                  />
                </Table.Td>
                <Table.Td p={0}>
                  <Textarea
                    value={expense.description}
                    onChange={(e) => onInputChange(index, 'description', e.target.value)}
                    autosize
                    minRows={1}
                    styles={{ input: { borderRadius: 0, padding: '8px' } }}
                  />
                </Table.Td>
                <Table.Td p={0}>
                  <NumberInput
                    value={expense.amount}
                    onChange={(value) => onInputChange(index, 'amount', Number(value))}
                    decimalScale={2}
                    allowNegative
                    required
                    styles={{ input: { borderRadius: 0, padding: '8px' } }}
                  />
                </Table.Td>
                <Table.Td p={0}>
                  <Select
                    value={expense.categoryId}
                    onChange={(value) => onInputChange(index, 'categoryId', value || '')}
                    placeholder="Category"
                    data={expenseCategories
                      .filter((category) => !category.isArchived)
                      .map((category) => ({
                        value: category.id,
                        label: category.name
                      }))}
                    styles={{ input: { borderRadius: 0 } }}
                    searchable
                  />
                </Table.Td>
                <Table.Td p={0}>
                  <Button variant="subtle" color="red" onClick={() => onDeleteRow(expense.id)} w="100%" h="100%" p={0}>
                    <TrashIcon size={16} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  )
}
