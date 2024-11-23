'use client'

import { useCompletion, experimental_useObject as useObject } from 'ai/react'
import { Loader2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

// import { expensesSchema } from '@/app/api/expenses/route'
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
      setAiGeneratedExpenses(
        JSON.parse(completion).map((expense: Expense) => ({ ...expense, id: crypto.randomUUID() }))
      )
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // const { object, submit } = useObject({
  //   api: '/api/expenses',
  //   schema: expensesSchema,
  //   onFinish: ({ object }) => {
  //     if (object?.expenses.length) {
  //       setAiGeneratedExpenses(object.expenses.map((expense) => ({ id: crypto.randomUUID(), ...expense })))
  //     }
  //   }
  // })

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
          className="min-h-[100px] max-h-96 overflow-auto"
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
      {/* <Button
        onClick={(e) => {
          submit({
            expenseCategories: expenseCategories.map((category) => category.name),
            historicalExpenses,
            bankExpenses: e.currentTarget.value
          })
        }}
      >
        Save Object Processed Expenses
      </Button> */}
      {/* {object ? <pre>{JSON.stringify(object, null, 2)}</pre> : null} */}
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
