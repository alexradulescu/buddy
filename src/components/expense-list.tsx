'use client'

import React, { useState } from 'react'
import { Search, Trash } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useExpenseStore } from '@/stores/expense-store'
import { useToast } from '@/hooks/use-toast'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ selectedMonth, selectedYear }) => {
  const { expenses, removeExpense } = useExpenseStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const matchesDate = expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm)
      return matchesDate && matchesSearch
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleDelete = (id: string) => {
    removeExpense(id)
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
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>
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
    </div>
  )
}
