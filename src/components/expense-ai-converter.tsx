'use client'

import React, { useMemo, useState } from 'react'
import { Expense, ExpenseCategory, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { useCompletion, experimental_useObject as useObject } from '@ai-sdk/react'
import { Loader2 } from 'lucide-react'
import { ExpenseTable } from '@/components/expense-table'
import { Button, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'

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

        notifications.show({
          title: 'Expenses processed',
          message: `${processedExpenses.length} expenses have been processed and are ready for review.`,
          color: 'green'
        })
      } catch (error) {
        console.error('Error processing completion:', error)
        notifications.show({
          title: 'Error processing expenses',
          message: 'Failed to process the AI response',
          color: 'red'
        })
      }
    },
    onError: (error: Error) => {
      console.error('Error processing completion:', error)
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div style={{ color: 'var(--mantine-color-red-filled)', marginTop: '16px' }}>Error: {error.message}</div>}
      {aiGeneratedExpenses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>AI Generated Expenses</h3>
          <ExpenseTable
            expenses={aiGeneratedExpenses}
            expenseCategories={expenseCategories}
            onInputChange={handleExpenseChange}
            onDeleteRow={handleDeleteExpense}
          />
          <Button onClick={handleSaveExpenses}>Save Processed Expenses</Button>
          <Button color="red" onClick={handleReset}>
            Reset
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your expense details here..."
            minRows={4}
            maxRows={10}
            readOnly={isLoading}
          />
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? (
              <>
                <Loader2 style={{ marginRight: '8px' }} size={16} className="animate-spin" />
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
