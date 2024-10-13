'use client'

import { useCompletion } from 'ai/react'
import { Loader2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { ExpenseTable } from '@/components/expense-table'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCategoryStore } from '@/stores/category-store'
import { Expense, useExpenseStore } from '@/stores/expense-store'

interface ExpenseAiConverterProps {
  onExpensesGenerated: (expenses: Expense[]) => void
}

export interface HistoricalExpense extends Omit<Expense, 'amount' | 'id' | 'date'> {}

export const ExpenseAiConverter: React.FC<ExpenseAiConverterProps> = ({ onExpensesGenerated }) => {
  const { toast } = useToast()
  const expenseCategories = useCategoryStore((state) => state.expenseCategories)
  const { expenses } = useExpenseStore()
  const [aiGeneratedExpenses, setAiGeneratedExpenses] = useState<Expense[]>([])

  const historicalExpenses = useMemo(() => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentExpenses = expenses
      .filter((expense) => new Date(expense.date) >= threeMonthsAgo)
      .map(
        ({ description, category }): HistoricalExpense => ({
          description,
          category
        })
      )

    return recentExpenses
  }, [expenses])

  const { input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/completion',
    body: {
      expenseCategories: expenseCategories.map((category) => category.name),
      historicalExpenses
    },
    onFinish: (prompt: string, completion: string) => {
      const parsedExpenses = parseAiResponse(completion)
      setAiGeneratedExpenses(parsedExpenses)
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const parseAiResponse = (response: string): Expense[] => {
    const lines = response.split('\n').filter((line) => line.trim() !== '')
    return lines.map((line) => {
      const [amount, category, date, description] = line.split(',').map((item) => item.trim())
      return {
        id: crypto.randomUUID(),
        amount: parseFloat(amount),
        category: category || 'Uncategorized',
        date: date || new Date().toISOString().split('T')[0],
        description: description || ''
      }
    })
  }

  const handleExpenseChange = (index: number, field: keyof Expense, value: string | number) => {
    const updatedExpenses = [...aiGeneratedExpenses]
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value }
    setAiGeneratedExpenses(updatedExpenses)
  }

  const handleDeleteExpense = (id: string) => {
    setAiGeneratedExpenses(aiGeneratedExpenses.filter((expense) => expense.id !== id))
  }

  const handleSaveExpenses = () => {
    onExpensesGenerated(aiGeneratedExpenses)
    toast({
      title: 'Expenses processed',
      description: `${aiGeneratedExpenses.length} expenses have been processed and are ready for review.`
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your expense details here..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            'Convert'
          )}
        </Button>
      </form>
      {error && <div className="text-red-500 mt-4">Error: {error.message}</div>}
      {aiGeneratedExpenses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Generated Expenses</h3>
          <ExpenseTable
            expenses={aiGeneratedExpenses}
            expenseCategories={expenseCategories}
            onInputChange={handleExpenseChange}
            onDeleteRow={handleDeleteExpense}
          />
          <Button onClick={handleSaveExpenses}>Save Processed Expenses</Button>
        </div>
      )}
    </div>
  )
}
