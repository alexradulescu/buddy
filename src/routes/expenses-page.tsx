'use client'

import React, { useState } from 'react'
import { ExpenseList } from '@/components/expense-list'
import { PageHeader } from '@/components/page-header'
import { Card, Stack, Tabs, Group, NumberInput, Button } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { ExpenseAiConverter } from '@/components/expense-ai-converter'
import { ExpenseTable } from '@/components/expense-table'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { notifications } from '@mantine/notifications'
import { ListIcon, SparklesIcon, TableIcon } from 'lucide-react'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addExpense } = useExpenseStore()
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()

  function getDefaultDate(year: number, month: number): Date {
    const currentDate = new Date()
    if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
      return currentDate
    }
    return new Date(year, month, 15)
  }

  const addExpenses = (expenses: Expense[]) => {
    let hasError = false
    const errors: string[] = []

    expenses.forEach((expense) => {
      if (!expense.amount || isNaN(Number(expense.amount)) || Number(expense.amount) <= 0) {
        errors.push(`Invalid amount for expense: ${expense.description}`)
        hasError = true
        return
      }

      const expenseDate = new Date(expense.date)
      if (expenseDate.getFullYear() !== selectedYear || expenseDate.getMonth() !== selectedMonth) {
        errors.push(`Expense ${expense.description} is not for the selected month and year`)
        hasError = true
        return
      }
    })

    if (!hasError) {
      expenses.forEach((expense) => addExpense(expense))
      setExpenses([])
      notifications.show({
        title: 'Expenses added',
        message: `Added ${expenses.length} expense(s)`,
        color: 'green'
      })
    } else {
      notifications.show({
        title: 'Error adding expenses',
        message: 'Expenses have not been added, there was an error, please check them again',
        color: 'red'
      })
      errors.forEach((errorMessage) => {
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red'
        })
      })
    }
  }

  const handleInputChange = (index: number, field: keyof Expense, value: string | number | Date) => {
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
        categoryId: '',
        date: getDefaultDate(selectedYear, selectedMonth).toISOString().split('T')[0],
        description: '',
        createdAt: Date.now()
      }))
    setExpenses([...expenses, ...newRows])
  }

  const deleteRow = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const handleSaveExpenses = () => {
    addExpenses(expenses)
  }

  const handleAiConvertedExpenses = (aiExpenses: Expense[]) => {
    addExpenses(aiExpenses)
  }

  return (
    <Stack gap="lg">
      <PageHeader title="Expenses" />

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list" leftSection={<ListIcon size={16} />}>
            View All Expenses
          </Tabs.Tab>
          <Tabs.Tab value="ai-import" leftSection={<SparklesIcon size={16} />}>
            AI-Powered Import
          </Tabs.Tab>
          <Tabs.Tab value="manual-entry" leftSection={<TableIcon size={16} />}>
            Manual Table Entry
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="md">
          <Card withBorder p="lg">
            <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="ai-import" pt="md">
          <Card withBorder p="lg">
            <ExpenseAiConverter onExpensesGenerated={handleAiConvertedExpenses} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="manual-entry" pt="md">
          <Card withBorder p="lg">
            <Stack gap="md">
              <ExpenseTable
                expenses={expenses}
                expenseCategories={expenseCategories}
                onInputChange={handleInputChange}
                onDeleteRow={deleteRow}
              />
              <Group gap="sm">
                <NumberInput
                  value={rowsToAdd}
                  onChange={(value) => setRowsToAdd(Number(value))}
                  min={1}
                  w={80}
                />
                <Button onClick={addRows}>Add Rows</Button>
              </Group>
              <Button onClick={handleSaveExpenses} fullWidth>Save Expenses</Button>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
