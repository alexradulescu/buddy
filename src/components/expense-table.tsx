'use client'

import React from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { TrashIcon } from 'lucide-react'
import { Button, NumberInput, Select, Table, Text, Textarea, ScrollArea } from '@mantine/core'
import { DateInput } from '@mantine/dates'

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
    <div>
      <Text size="sm" c="dimmed" mb="xs">
        Total: {expenses.length} item{expenses.length !== 1 ? 's' : ''}
      </Text>
      <ScrollArea h="50vh">
        <Table style={{ minWidth: 600 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '50px' }}>#</Table.Th>
              <Table.Th style={{ width: '80px' }}>Amount</Table.Th>
              <Table.Th style={{ width: '130px' }}>Category</Table.Th>
              <Table.Th style={{ width: '130px' }}>Date</Table.Th>
              <Table.Th style={{ width: '220px' }}>Description</Table.Th>
              <Table.Th style={{ width: '50px' }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.map((expense, index) => (
              <Table.Tr key={expense.id}>
                <Table.Td ta="center" c="dimmed" style={{ padding: '4px' }}>
                  {index + 1}
                </Table.Td>
                <Table.Td style={{ padding: '4px' }}>
                  <NumberInput
                    value={expense.amount}
                    onChange={(value) => onInputChange(index, 'amount', Number(value))}
                    decimalScale={2}
                    min={0}
                    required
                    styles={{ input: { borderRadius: 0, padding: '8px' } }}
                  />
                </Table.Td>
                <Table.Td style={{ padding: '4px' }}>
                  <Select
                    value={expense.categoryId}
                    onChange={(value) => onInputChange(index, 'categoryId', value || '')}
                    placeholder="Select Category"
                    data={expenseCategories
                      .filter((category) => !category.isArchived)
                      .map((category) => ({
                        value: category.id,
                        label: category.name
                      }))}
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td style={{ padding: '4px' }}>
                  <DateInput
                    value={new Date(expense.date)}
                    onChange={(date) => onInputChange(index, 'date', date!)}
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td style={{ padding: '4px' }}>
                  <Textarea
                    value={expense.description}
                    onChange={(e) => onInputChange(index, 'description', e.target.value)}
                    styles={{ input: { borderRadius: 0, padding: '8px' } }}
                  />
                </Table.Td>
                <Table.Td style={{ padding: '4px' }}>
                  <Button
                    variant="subtle"
                    onClick={() => onDeleteRow(expense.id)}
                    styles={{ root: { borderRadius: 0, width: '100%', height: '100%' } }}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  )
}
