import React, { useMemo, useState } from 'react'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button, Group, Stack, Text, TextInput, Select, Table, ScrollArea, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { DeleteConfirmation } from './delete-confirmation'
import { TransactionForm } from './transaction-form'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
}

type SortColumn = 'date' | 'description' | 'category' | 'amount'
type SortDirection = 'asc' | 'desc'

export const ExpenseList: React.FC<ExpenseListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { expenses = [] } = {}, removeExpense, updateExpense } = useExpenseStore()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useQueryState('categoryExpense')
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses
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
      .sort((a, b) => {
        const dir = sortDirection === 'asc' ? 1 : -1
        switch (sortColumn) {
          case 'date':
            return a.date.localeCompare(b.date) * dir
          case 'description':
            return a.description.localeCompare(b.description) * dir
          case 'category':
            return (a.category ?? '').localeCompare(b.category ?? '') * dir
          case 'amount':
            return (a.amount - b.amount) * dir
          default:
            return 0
        }
      })
  }, [expenses, expenseCategories, selectedYear, selectedMonth, searchTerm, selectedCategoryId, sortColumn, sortDirection])

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
    <Stack gap="sm">
      <Stack gap="xs">
        <TextInput
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={14} />}
        />
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>Filter:</Text>
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
            flex={1}
          />
        </Group>
      </Stack>
      {filteredExpenses.length === 0 ? (
        <Text ta="center" c="dimmed" py="md" size="sm">No expenses found for this period.</Text>
      ) : (
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'item' : 'items'}
          </Text>
          <ScrollArea mah={500}>
            <Table miw={450} stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={80}>
                    <SortableHeader column="date" label="Date" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader column="description" label="Description" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                  </Table.Th>
                  <Table.Th>
                    <SortableHeader column="category" label="Category" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                  </Table.Th>
                  <Table.Th ta="right" w={70}>
                    <SortableHeader column="amount" label="Amount" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} justify="flex-end" />
                  </Table.Th>
                  <Table.Th w={60}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredExpenses.map((expense) => (
                  <Table.Tr key={expense.id}>
                    <Table.Td>{format(new Date(expense.date), 'dd MMM yyyy')}</Table.Td>
                    <Table.Td>{expense.description}</Table.Td>
                    <Table.Td c="dimmed">{expense.category}</Table.Td>
                    <Table.Td ta="right" className="numeric-value" c={expense.amount < 0 ? 'green.6' : undefined}>
                      ${Number(expense.amount).toFixed(2)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setEditingExpense(expense)}>
                          <Edit size={12} />
                        </Button>
                        <Button size="compact-xs" variant="subtle" color="red" onClick={() => handleDeleteClick(expense)}>
                          <Trash size={12} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
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

const SortableHeader: React.FC<{
  column: SortColumn
  label: string
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
  justify?: 'flex-start' | 'flex-end'
}> = ({ column, label, sortColumn, sortDirection, onSort, justify = 'flex-start' }) => {
  const isActive = sortColumn === column
  const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <UnstyledButton onClick={() => onSort(column)} style={{ width: '100%' }}>
      <Group gap={4} wrap="nowrap" justify={justify}>
        <Text fw={700} size="sm">{label}</Text>
        <Icon size={14} opacity={isActive ? 1 : 0.4} />
      </Group>
    </UnstyledButton>
  )
}
