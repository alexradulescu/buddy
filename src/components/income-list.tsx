'use client'

import React, { useMemo, useState } from 'react'
import { Income, useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button, Group, Stack, Text, TextInput, Select, Table, ScrollArea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { DeleteConfirmation } from './delete-confirmation'
import { TransactionForm } from './transaction-form'

interface IncomeListProps {
  selectedYear: number
  selectedMonth: number
}

export const IncomeList: React.FC<IncomeListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { incomes = [] } = {}, removeIncome, updateIncome } = useIncomeStore()
  const { data: { incomeCategories = [] } = {} } = useCategoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useQueryState('categoryIncome')
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  const filteredAndSortedIncomes = useMemo(() => {
    return incomes
      .map((income) => {
        const category = incomeCategories.find((incomeCategory) => incomeCategory.id === income.categoryId)
        return {
          ...income,
          category: category?.title || 'Uncategorized'
        }
      })
      .filter((income) => {
        const incomeDate = new Date(income.date)
        const matchesDate = incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
        const matchesSearch =
          searchTerm === '' ||
          income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.amount.toString().includes(searchTerm) ||
          income.category?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory =
          !selectedCategoryId || selectedCategoryId === 'all' || income.categoryId === selectedCategoryId
        return matchesDate && matchesSearch && matchesCategory
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [incomes, incomeCategories, selectedYear, selectedMonth, searchTerm, selectedCategoryId])

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income)
  }

  const handleConfirmDelete = () => {
    if (!incomeToDelete?.id) return

    removeIncome(incomeToDelete.id)
    setIncomeToDelete(null)

    notifications.show({
      title: 'Income deleted',
      message: 'The income has been successfully removed.',
      color: 'green'
    })
  }

  const handleSaveIncome = async (data: { amount: number; description: string; date: string; categoryId: string }) => {
    if (editingIncome?.id) {
      await updateIncome(editingIncome.id, data)
      notifications.show({
        title: 'Income updated',
        message: 'The income has been successfully updated.',
        color: 'green'
      })
    }
    setEditingIncome(null)
  }

  const uniqueCategories = useMemo(() => {
    const categoryMap = new Map<string, string>()
    incomeCategories.forEach((cat) => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat.title)
      }
    })
    return Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }))
  }, [incomeCategories])

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <TextInput
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
        />
        <Group gap="sm" align="center">
          <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>Filter:</Text>
          <Select
            value={selectedCategoryId || 'all'}
            onChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)}
            placeholder="All categories"
            data={[
              { value: 'all', label: 'All categories' },
              ...uniqueCategories.map((category) => ({
                value: category.id,
                label: category.name
              }))
            ]}
            flex={1}
          />
        </Group>
      </Stack>

      {filteredAndSortedIncomes.length === 0 ? (
        <Text ta="center" c="dimmed" py="xl">No incomes found for this period.</Text>
      ) : (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {filteredAndSortedIncomes.length} {filteredAndSortedIncomes.length === 1 ? 'item' : 'items'}
          </Text>
          <ScrollArea>
            <Table highlightOnHover striped withTableBorder miw={500} fz="xs" verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={90}>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th ta="right" w={80}>Amount</Table.Th>
                  <Table.Th w={70}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredAndSortedIncomes.map((income) => (
                  <Table.Tr key={income.id}>
                    <Table.Td>{format(new Date(income.date), 'dd MMM yyyy')}</Table.Td>
                    <Table.Td>{income.description}</Table.Td>
                    <Table.Td c="dimmed">{income.category}</Table.Td>
                    <Table.Td ta="right" className="numeric-value">${Number(income.amount).toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Button size="compact-xs" variant="subtle" onClick={() => setEditingIncome(income)}>
                          <Edit size={12} />
                        </Button>
                        <Button size="compact-xs" variant="subtle" color="red" onClick={() => handleDeleteClick(income)}>
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
        isOpen={!!incomeToDelete}
        onClose={() => setIncomeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Income"
        description="Are you sure you want to delete this income? This action cannot be undone."
        recordDetails={
          incomeToDelete
            ? {
                description: incomeToDelete.description,
                amount: `$${Number(incomeToDelete.amount).toFixed(2)}`,
                category: incomeToDelete.category || 'Uncategorized',
                date: incomeToDelete.date ? format(new Date(incomeToDelete.date), 'dd MMM yyyy') : ''
              }
            : undefined
        }
      />
      <TransactionForm
        type="income"
        open={!!editingIncome}
        onOpenChange={(open) => !open && setEditingIncome(null)}
        onSubmit={handleSaveIncome}
        categories={incomeCategories}
        initialData={editingIncome || undefined}
      />
    </Stack>
  )
}
