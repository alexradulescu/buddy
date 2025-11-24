'use client'

import React, { useMemo, useState } from 'react'
import { Expense, ExpenseCategory, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { ExpenseTable } from '@/components/expense-table'
import { Button, Stack, Text, Textarea, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { z } from 'zod'

interface ExpenseAiConverterProps {
  onExpensesGenerated: (expenses: Expense[]) => void
}

// Schema for a single expense
const expenseSchema = z.object({
  amount: z.number().nonnegative(),
  categoryId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string()
})

export const ExpenseAiConverter: React.FC<ExpenseAiConverterProps> = ({ onExpensesGenerated }) => {
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const [aiGeneratedExpenses, setAiGeneratedExpenses] = useState<Expense[]>([])
  const [inputText, setInputText] = useState('')

  const historicalExpenses = useMemo(() => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    return expenses
      .filter(({ date }) => new Date(date) >= threeMonthsAgo)
      .map(({ description, categoryId }) => ({
        description,
        categoryId,
        amount: 0
      }))
  }, [expenses])

  const { object, submit, isLoading, error } = useObject({
    api: '/api/completion',
    schema: z.array(expenseSchema),
    onFinish: ({ object: expenses }) => {
      if (expenses && Array.isArray(expenses)) {
        const processedExpenses = expenses.map((expense) => ({
          ...expense,
          id: crypto.randomUUID()
        }))

        setAiGeneratedExpenses(processedExpenses)

        notifications.show({
          title: 'Expenses processed',
          message: `${processedExpenses.length} expenses have been processed and are ready for review.`,
          color: 'green'
        })
      } else {
        notifications.show({
          title: 'No expenses found',
          message: 'The AI did not find any expenses to process.',
          color: 'yellow'
        })
      }
    },
    onError: (error) => {
      console.error('Error processing completion:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to process expenses',
        color: 'red'
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputText.trim()) {
      notifications.show({
        title: 'Empty input',
        message: 'Please enter transaction data to convert',
        color: 'yellow'
      })
      return
    }

    submit({
      prompt: inputText,
      expenseCategories: expenseCategories.map(cat => ({ id: cat.id, name: cat.name })),
      historicalExpenses
    })
  }

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
    <Stack gap="md">
      {error && <Text c="red" mt="md">Error: {error.message}</Text>}
      {aiGeneratedExpenses.length > 0 ? (
        <Stack gap="md">
          <Title order={3} size="h5">AI Generated Expenses</Title>
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
        </Stack>
      ) : (
        <Stack component="form" onSubmit={handleSubmit} gap="md">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your expense details here..."
            minRows={4}
            maxRows={10}
            readOnly={isLoading}
          />
          <Button type="submit" disabled={isLoading} fullWidth loading={isLoading}>
            {isLoading ? 'Converting...' : 'Convert'}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
