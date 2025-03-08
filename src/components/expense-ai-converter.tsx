'use client'

import React, { useMemo, useState } from 'react'
import { Expense, ExpenseCategory, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { useCompletion, experimental_useObject as useObject } from '@ai-sdk/react'
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

const getKvExpenseCategories = (expenseCategories: ExpenseCategory[]): Record<string, string> => {
  const kvExpenseCategories: Record<string, string> = {}
  expenseCategories.forEach((category) => {
    kvExpenseCategories[category.id] = category.name
  })
  return kvExpenseCategories
}

export const ExpenseAiConverter: React.FC<ExpenseAiConverterProps> = ({ onExpensesGenerated }) => {
  const { toast } = useToast()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const [aiGeneratedExpenses, setAiGeneratedExpenses] = useState<Expense[]>([])

  const historicalExpenses = useMemo(() => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const historicalExpenses: Record<string, string> = {}

    expenses.forEach(({ description, categoryId, date }) => {
      if (new Date(date) >= threeMonthsAgo) {
        historicalExpenses[description] = categoryId
      }
    })

    return historicalExpenses
  }, [expenses])

  const { input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/completion',
    streamProtocol: 'text',
    body: {
      expenseCategories: getKvExpenseCategories(expenseCategories),
      historicalExpenses
    },
    onFinish: (prompt: string, completion: string) => {
      try {
        // The API returns an array of objects directly
        const expenses = isJsonString(completion) ? JSON.parse(completion) : completion

        const processedExpenses = Array.isArray(expenses)
          ? expenses.map((expense: Expense) => ({ ...expense, id: crypto.randomUUID() }))
          : []

        setAiGeneratedExpenses(processedExpenses)

        toast({
          title: 'Expenses processed',
          description: `${processedExpenses.length} expenses have been processed and are ready for review.`
        })
      } catch (error) {
        console.error('Error processing completion:', error)
        toast({
          title: 'Error processing expenses',
          description: 'Failed to process the AI response',
          variant: 'destructive'
        })
      }
    },
    onError: (error: Error) => {
      console.error('Error processing completion:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleExpenseChange = (
    index: number,
    field: 'amount' | 'categoryId' | 'date' | 'description',
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
