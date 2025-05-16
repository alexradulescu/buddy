'use client'

import React, { useState } from 'react'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Search, Trash } from 'lucide-react'
import { DeleteConfirmation } from './delete-confirmation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

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

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
  }

  const handleConfirmDelete = () => {
    if (!expenseToDelete?.id) return
    
    removeExpense(expenseToDelete.id)
    setExpenseToDelete(null)
    
    toast({
      title: 'Expense deleted',
      description: 'The expense has been successfully removed.'
    })
  }

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </label>
      {filteredExpenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No expenses found for this period.</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[60dvh] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right w-[100px]">Amount</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">${Number(expense.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteClick(expense)}
                      >
                        <Trash size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      <DeleteConfirmation
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        recordDetails={expenseToDelete ? {
          date: expenseToDelete.date ? format(new Date(expenseToDelete.date), 'dd MMM yyyy') : '',
          description: expenseToDelete.description,
          amount: `$${Number(expenseToDelete.amount).toFixed(2)}`,
          category: expenseToDelete.category || 'Uncategorized',
        } : undefined}
      />
    </div>
  )
}
