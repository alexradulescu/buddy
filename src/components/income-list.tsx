'use client'

import React, { useMemo, useState } from 'react'
import { Income, useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button, Card, TextInput, Select } from '@mantine/core'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <TextInput
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', whiteSpace: 'nowrap' }}>
            Filter by category:
          </span>
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
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {filteredAndSortedIncomes.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--mantine-color-dimmed)', padding: '1rem 0' }}>
          No incomes found for this period.
        </p>
      ) : (
        <Card padding={0}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredAndSortedIncomes.map((income) => (
              <li key={income.id} style={{ padding: '1rem', borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, margin: 0 }}>{income.description}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', margin: 0 }}>
                      {income.category}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>${income.amount.toFixed(2)}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', margin: 0 }}>
                      {format(new Date(income.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setEditingIncome(income)}
                    color="blue"
                    leftSection={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleDeleteClick(income)}
                    color="red"
                    leftSection={<Trash size={16} />}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
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
    </div>
  )
}
