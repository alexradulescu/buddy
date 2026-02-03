import React, { useState } from 'react'
import { ExpenseList } from '@/components/expense-list'
import { Card, Stack, Group, NumberInput, Button, SimpleGrid, SegmentedControl } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { ExpenseAiConverter } from '@/components/expense-ai-converter'
import { ExpenseFileUpload } from '@/components/expense-file-upload'
import { ExpenseSpreadsheet } from '@/components/expense-spreadsheet'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import { notifications } from '@mantine/notifications'
import { SparklesIcon, TableIcon, UploadIcon } from 'lucide-react'

export default function ExpensesPage() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const [activeTab, setActiveTab] = useState('upload')
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
      const amount = Number(expense.amount)
      // Allow negative amounts for reimbursements, but not zero
      // AI converter already blocks negatives via Zod schema in the API
      if (isNaN(amount) || amount === 0) {
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
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
      {/* Left Panel - Entry Methods */}
      <Card>
        <Stack gap="sm">
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            data={[
              {
                value: 'upload',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <UploadIcon size={14} />
                    <span>Upload</span>
                  </Group>
                )
              },
              {
                value: 'ai-import',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <SparklesIcon size={14} />
                    <span>AI Import</span>
                  </Group>
                )
              },
              {
                value: 'manual-entry',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <TableIcon size={14} />
                    <span>Manual</span>
                  </Group>
                )
              }
            ]}
            fullWidth
          />

          {activeTab === 'upload' && (
            <ExpenseFileUpload onExpensesGenerated={handleAiConvertedExpenses} />
          )}

          {activeTab === 'ai-import' && (
            <ExpenseAiConverter onExpensesGenerated={handleAiConvertedExpenses} />
          )}

          {activeTab === 'manual-entry' && (
            <Stack gap="sm">
              <ExpenseSpreadsheet
                expenses={expenses}
                expenseCategories={expenseCategories}
                onInputChange={handleInputChange}
                onDeleteRow={deleteRow}
              />
              <Group gap="xs">
                <NumberInput
                  value={rowsToAdd}
                  onChange={(value) => setRowsToAdd(Number(value))}
                  min={1}
                  w={60}
                />
                <Button onClick={addRows}>Add Rows</Button>
              </Group>
              <Button onClick={handleSaveExpenses} fullWidth>Save Expenses</Button>
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Right Panel - Expense List */}
      <Card>
        <ExpenseList selectedYear={selectedYear} selectedMonth={selectedMonth} />
      </Card>
    </SimpleGrid>
  )
}
