'use client'

import { TrashIcon } from 'lucide-react'
import React, { useState } from 'react'

import { ExpenseAiConverter } from '@/components/expense-ai-converter'
import { ExpenseTable } from '@/components/expense-table'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useCategoryStore } from '@/stores/category-store'
import { Expense, useExpenseStore } from '@/stores/expense-store'

interface ExpenseFormProps {
  selectedYear: number
  selectedMonth: number
  initialExpenses?: Expense[]
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ selectedYear, selectedMonth, initialExpenses = [] }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addExpense } = useExpenseStore()
  const expenseCategories = useCategoryStore((state) => state.expenseCategories)
  const { toast } = useToast()

  function getDefaultDate(year: number, month: number): Date {
    const currentDate = new Date()
    if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
      return currentDate
    }
    return new Date(year, month, 15)
  }

  const addExpenses = (expenses: Expense[]) => {
    let hasError = false
    expenses.forEach((expense) => {
      if (!expense.amount || isNaN(Number(expense.amount)) || Number(expense.amount) <= 0) {
        toast({
          title: 'Invalid expense',
          description: `Invalid amount for expense: ${expense.description}`,
          variant: 'destructive'
        })
        hasError = true
        return
      }

      const expenseDate = new Date(expense.date)
      if (expenseDate.getFullYear() !== selectedYear || expenseDate.getMonth() !== selectedMonth) {
        toast({
          title: 'Invalid date',
          description: `Expense ${expense.description} is not for the selected month and year`,
          variant: 'destructive'
        })
        hasError = true
        return
      }
    })

    if (!hasError) {
      expenses.forEach((expense) => addExpense(expense))
      setExpenses([])
      toast({
        title: 'Expenses added',
        description: `Added ${expenses.length} expense(s)`
      })
    }
  }

  const handleAddExpenses = () => {
    addExpenses(expenses)
  }

  const handleInputChange = (index: number, field: keyof Expense, value: string | number) => {
    const updatedExpenses = [...expenses]
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value }
    setExpenses(updatedExpenses)
  }

  const addRows = () => {
    const newRows = Array(rowsToAdd)
      .fill(null)
      .map(() => ({
        id: crypto.randomUUID(),
        amount: 0,
        category: '',
        date: getDefaultDate(selectedYear, selectedMonth).toISOString().split('T')[0],
        description: ''
      }))
    setExpenses([...expenses, ...newRows])
  }

  const deleteRow = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const handleAiConvertedExpenses = (aiExpenses: Expense[]) => {
    addExpenses(aiExpenses)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Add Expenses for{' '}
        {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <Tabs defaultValue="table-form">
        <TabsList>
          <TabsTrigger value="table-form">Table Entry</TabsTrigger>
          <TabsTrigger value="ai-converter">AI Converter</TabsTrigger>
        </TabsList>
        <TabsContent value="table-form">
          <div className="space-y-4">
            <ExpenseTable
              expenses={expenses}
              expenseCategories={expenseCategories}
              onInputChange={handleInputChange}
              onDeleteRow={deleteRow}
            />
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={rowsToAdd}
                onChange={(e) => setRowsToAdd(Number(e.target.value))}
                min="1"
                className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button onClick={addRows}>Add Rows</Button>
            </div>
            <Button onClick={handleAddExpenses}>Save Expenses</Button>
          </div>
        </TabsContent>
        <TabsContent value="ai-converter">
          <ExpenseAiConverter onExpensesGenerated={handleAiConvertedExpenses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
