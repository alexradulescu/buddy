'use client'

import { format } from 'date-fns'
import { MoreHorizontal, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useExpenseStore } from '@/stores/expense-store'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ selectedMonth, selectedYear }) => {
  const { expenses, removeExpense } = useExpenseStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const matchesDate = expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.amount.toString().includes(searchTerm)
    return matchesDate && matchesSearch
  })

  const handleDelete = (id: string) => {
    removeExpense(id)
    toast({
      title: 'Expense deleted',
      description: 'The expense has been successfully removed.'
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl text-muted-foreground mb-2">
        {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
      </h2>

      <label className="relative d-block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </label>
      {filteredExpenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No expenses found for this period.</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDelete(expense.id)}>Delete</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
