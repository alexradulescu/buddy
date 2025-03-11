'use client'

import { Box, Button, Group, Loader, Text, Textarea } from '@mantine/core'
import { Expense, ExpenseCategory, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import React, { useMemo, useState } from 'react'

import { ExpenseTable } from '@/components/expense-table'
import { useCompletion } from '@ai-sdk/react'
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
    <Box>
      {error && <Text c="red" mt="md">Error: {error.message}</Text>}
      {aiGeneratedExpenses.length > 0 ? (
        <Box>
          <Text fw={600} size="md" mb="md">AI Generated Expenses</Text>
          <ExpenseTable
            expenses={aiGeneratedExpenses}
            expenseCategories={expenseCategories}
            onInputChange={handleExpenseChange}
            onDeleteRow={handleDeleteExpense}
          />
          <Group mt="md">
            <Button onClick={handleSaveExpenses}>Save Processed Expenses</Button>
            <Button variant="filled" color="red" onClick={handleReset}>Reset</Button>
          </Group>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your expense details here..."
            minRows={4}
            maxRows={12}
            style={{ overflow: 'auto' }}
            readOnly={isLoading}
            mb="md"
          />
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? (
              <Group gap="xs" justify="center">
                <Loader size="xs" color="white" />
                <span>Converting...</span>
              </Group>
            ) : (
              'Convert'
            )}
          </Button>
        </form>
      )}
    </Box>
  )
}
