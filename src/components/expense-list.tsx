'use client'

import React, { useState } from 'react'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button, Group, Stack, Text, TextInput, Select, Table } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { DeleteConfirmation } from './delete-confirmation'
import { TransactionForm } from './transaction-form'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { expenses = [] } = {}, removeExpense, updateExpense } = useExpenseStore()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useQueryState('categoryExpense')
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const filteredExpenses = expenses
    .map((expense) => ({
      ...expense,
      category: expenseCategories.find((expenseCategory) => expenseCategory.id === expense.categoryId)?.name
    }))
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const matchesDate = expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
      const matchesSearch =
        searchTerm === '' ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm)
      const matchesCategory =
        !selectedCategoryId || selectedCategoryId === 'all' || expense.categoryId === selectedCategoryId
      return matchesDate && matchesSearch && matchesCategory
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
  }

  const handleConfirmDelete = () => {
    if (!expenseToDelete?.id) return

    removeExpense(expenseToDelete.id)
    setExpenseToDelete(null)

    notifications.show({
      title: 'Expense deleted',
      message: 'The expense has been successfully removed.',
      color: 'green'
    })
  }

  const handleSaveExpense = async (data: { amount: number; description: string; date: string; categoryId: string }) => {
    if (editingExpense?.id) {
      await updateExpense(editingExpense.id, data)
      notifications.show({
        title: 'Expense updated',
        message: 'The expense has been successfully updated.',
        color: 'green'
      })
    }
    setEditingExpense(null)
  }

  const uniqueCategories = expenseCategories.map(({ id, name }) => ({ id, name }))

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <TextInput
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
        />
        <Group gap="xs">
          <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>Filter by category:</Text>
          <Select
            placeholder="All categories"
            value={selectedCategoryId || 'all'}
            onChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)}
            data={[
              { value: 'all', label: 'All categories' },
              ...uniqueCategories.map((category: { id: string; name: string }) => ({
                value: category.id,
                label: category.name
              }))
            ]}
            style={{ flex: 1 }}
          />
        </Group>
      </Stack>
      {filteredExpenses.length === 0 ? (
        <Text ta="center" c="dimmed" py="md">No expenses found for this period.</Text>
      ) : (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Total: {filteredExpenses.length} item{filteredExpenses.length !== 1 ? 's' : ''}
          </Text>
          <div style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ maxHeight: '60dvh', overflow: 'auto' }}>
            <Table highlightOnHover>
              <Table.Thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--mantine-color-body)' }}>
                <Table.Tr>
                  <Table.Th style={{ width: '50px' }}>#</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th ta="right" style={{ width: '100px' }}>Amount</Table.Th>
                  <Table.Th style={{ width: '80px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredExpenses.map((expense, index) => (
                  <Table.Tr key={expense.id}>
                    <Table.Td ta="center" c="dimmed">
                      {index + 1}
                    </Table.Td>
                    <Table.Td>{format(new Date(expense.date), 'dd MMM yyyy')}</Table.Td>
                    <Table.Td>{expense.description}</Table.Td>
                    <Table.Td>{expense.category}</Table.Td>
                    <Table.Td ta="right">${Number(expense.amount).toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" variant="default" onClick={() => setEditingExpense(expense)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="xs" color="red" onClick={() => handleDeleteClick(expense)}>
                          <Trash size={14} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            </div>
          </div>
        </Stack>
      )}

      <DeleteConfirmation
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        recordDetails={
          expenseToDelete
            ? {
                date: expenseToDelete.date ? format(new Date(expenseToDelete.date), 'dd MMM yyyy') : '',
                description: expenseToDelete.description,
                amount: `$${Number(expenseToDelete.amount).toFixed(2)}`,
                category: expenseToDelete.category || 'Uncategorized'
              }
            : undefined
        }
      />
      <TransactionForm
        type="expense"
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        onSubmit={handleSaveExpense}
        categories={expenseCategories}
        initialData={editingExpense || undefined}
      />
    </Stack>
  )
}
