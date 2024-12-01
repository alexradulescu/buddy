'use client'

import React, { useMemo, useState } from 'react'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { useCompletion, experimental_useObject as useObject } from 'ai/react'
import { Loader2 } from 'lucide-react'
import { ExpenseTable } from '@/components/expense-table'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

function isJsonString(input: string): boolean {
  try {
    JSON.parse(input)
  } catch (e) {
    return false
  }
  return true
}

interface ExpenseAiConverterProps {
  onExpensesGenerated: (expenses: Expense[]) => void
}

export interface HistoricalExpense extends Omit<Expense, 'amount' | 'id' | 'date'> {}

export const ExpenseAiConverter: React.FC<ExpenseAiConverterProps> = ({ onExpensesGenerated }) => {
  const { toast } = useToast()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const [aiGeneratedExpenses, setAiGeneratedExpenses] = useState<Expense[]>([])

  const historicalExpenses = useMemo(() => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const historicalExpenses: Record<string, string> = {}

    expenses.forEach(({ description, category, date }) => {
      if (new Date(date) >= threeMonthsAgo) {
        historicalExpenses[description] = category
      }
    })

    return historicalExpenses
  }, [expenses])

  const { input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/completion',
    body: {
      expenseCategories: expenseCategories.map((category) => category.name),
      historicalExpenses
    },
    onFinish: (prompt: string, completion: string) => {
      if (isJsonString(completion)) {
        setAiGeneratedExpenses(
          JSON.parse(completion).map((expense: Expense) => ({ ...expense, id: crypto.randomUUID() }))
        )
        toast({
          title: 'Expenses processed',
          description: `${aiGeneratedExpenses.length} expenses have been processed and are ready for review.`
        })
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleExpenseChange = (
    index: number,
    field: 'amount' | 'category' | 'date' | 'description',
    value: string | number | Date
  ) => {
    const updatedExpenses = [...aiGeneratedExpenses]
    if (field === 'date' && value instanceof Date) {
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: value.toISOString().split('T')[0]
      }
    } else {
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: value
      }
    }
    setAiGeneratedExpenses(updatedExpenses)
  }

  const handleDeleteExpense = (id: string) => {
    setAiGeneratedExpenses(aiGeneratedExpenses.filter((expense) => expense.id !== id))
  }

  const handleSaveExpenses = () => {
    onExpensesGenerated(aiGeneratedExpenses)
  }

  const handleReset = () => {
    setAiGeneratedExpenses([])
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 mt-4">Error: {error.message}</div>}
      {aiGeneratedExpenses.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Generated Expenses</h3>
          <ExpenseTable
            expenses={aiGeneratedExpenses}
            expenseCategories={expenseCategories}
            onInputChange={handleExpenseChange}
            onDeleteRow={handleDeleteExpense}
          />
          <Button onClick={handleSaveExpenses}>Save Processed Expenses</Button>
          <Button variant={'destructive'} onClick={handleReset}>
            Reset
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your expense details here..."
            className="min-h-[100px] max-h-96 overflow-auto"
            readOnly={isLoading}
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
      )}
    </div>
  )
}
