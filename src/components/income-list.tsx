'use client'

import React, { useMemo, useState } from 'react'
import { Income, useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { DeleteConfirmation } from './delete-confirmation'
import { TransactionForm } from './transaction-form'

interface IncomeListProps {
  selectedYear: number
  selectedMonth: number
}

export const IncomeList: React.FC<IncomeListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { incomes = [] } = {}, removeIncome, updateIncome } = useIncomeStore()
  const { data: { incomeCategories = [] } = {} } = useCategoryStore()
  const { toast } = useToast()
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
          category: category?.title || 'Uncategorized' // Using title instead of name to match the type
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

    toast({
      title: 'Income deleted',
      description: 'The income has been successfully removed.',
      variant: 'default'
    })
  }

  const handleSaveIncome = async (data: { amount: number; description: string; date: string; categoryId: string }) => {
    if (editingIncome?.id) {
      await updateIncome(editingIncome.id, data)
      toast({
        title: 'Income updated',
        description: 'The income has been successfully updated.',
        variant: 'default'
      })
    }
    setEditingIncome(null)
  }

  // Get unique categories for the filter dropdown
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
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incomes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by category:</span>
          <Select
            value={selectedCategoryId || undefined}
            onValueChange={(value) => setSelectedCategoryId(value || null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {uniqueCategories.map((category: { id: string; name: string }) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedIncomes.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No incomes found for this period.</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filteredAndSortedIncomes.map((income, index) => (
                <li key={income.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{income.description}</h3>
                      <p className="text-sm text-muted-foreground">{income.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${income.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(income.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIncome(income)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(income)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
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
