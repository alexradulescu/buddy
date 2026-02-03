'use client'

import React, { useMemo, useState } from 'react'
import { Expense, useCategoryStore, useExpenseStore } from '@/stores/instantdb'
import {
  Accordion,
  Alert,
  Button,
  Code,
  FileInput,
  Stack,
  Title
} from '@mantine/core'
import { Upload, FileText } from 'lucide-react'
import { notifications } from '@mantine/notifications'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { ExpenseSpreadsheet } from '@/components/expense-spreadsheet'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface ExpenseFileUploadProps {
  onExpensesGenerated: (expenses: Expense[]) => void
}

export const ExpenseFileUpload: React.FC<ExpenseFileUploadProps> = ({
  onExpensesGenerated
}) => {
  const { data: { expenseCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [aiGeneratedExpenses, setAiGeneratedExpenses] = useState<Expense[]>([])

  // Get existing expenses for the selected month to check for duplicates
  const existingMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return (
        expenseDate.getFullYear() === selectedYear &&
        expenseDate.getMonth() === selectedMonth
      )
    })
  }, [expenses, selectedYear, selectedMonth])

  // Find AI-generated expenses that might be duplicates (same date + amount)
  const duplicateIds = useMemo(() => {
    const duplicates = new Set<string>()
    aiGeneratedExpenses.forEach((aiExpense) => {
      const isDuplicate = existingMonthExpenses.some(
        (existing) =>
          existing.date === aiExpense.date && existing.amount === aiExpense.amount
      )
      if (isDuplicate) {
        duplicates.add(aiExpense.id)
      }
    })
    return duplicates
  }, [aiGeneratedExpenses, existingMonthExpenses])

  const historicalExpenses = useMemo(() => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    return expenses
      .filter(({ date }) => new Date(date) >= threeMonthsAgo)
      .map(({ description, categoryId, amount }) => ({
        description,
        categoryId,
        amount: amount || 0
      }))
  }, [expenses])

  const handleFileChange = (newFile: File | null) => {
    setError(null)
    setExtractedText(null)
    setAiGeneratedExpenses([])

    if (newFile && newFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.')
      setFile(null)
      return
    }

    setFile(newFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'expenseCategories',
      JSON.stringify(expenseCategories.map((cat) => ({ id: cat.id, name: cat.name })))
    )
    formData.append('historicalExpenses', JSON.stringify(historicalExpenses))

    try {
      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      // Get extracted text from header
      const extractedTextHeader = response.headers.get('X-Extracted-Text')
      if (extractedTextHeader) {
        setExtractedText(decodeURIComponent(extractedTextHeader))
      }

      // Parse the streaming text response
      const text = await response.text()
      const parsedExpenses = JSON.parse(text)

      if (parsedExpenses && Array.isArray(parsedExpenses) && parsedExpenses.length > 0) {
        const processedExpenses = parsedExpenses.map((expense: any) => ({
          ...expense,
          id: crypto.randomUUID()
        }))

        setAiGeneratedExpenses(processedExpenses)

        notifications.show({
          title: 'Statement processed',
          message: `${processedExpenses.length} expenses found. Please review before saving.`,
          color: 'green'
        })
      } else {
        notifications.show({
          title: 'No expenses found',
          message: 'The AI did not find any expenses in the statement.',
          color: 'yellow'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      })
    } finally {
      setIsLoading(false)
    }
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
    setExtractedText(null)
    setFile(null)
    setError(null)
  }

  return (
    <Stack gap="md">
      {aiGeneratedExpenses.length > 0 ? (
        <Stack gap="md">
          <Title order={3} size="h5">
            Processed Expenses
          </Title>

          {extractedText && (
            <Accordion>
              <Accordion.Item value="extracted-text">
                <Accordion.Control>
                  Show extracted text
                </Accordion.Control>
                <Accordion.Panel>
                  <Code
                    block
                    style={{
                      maxHeight: 300,
                      overflow: 'auto',
                      fontSize: '0.75rem'
                    }}
                  >
                    {extractedText}
                  </Code>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}

          <ExpenseSpreadsheet
            expenses={aiGeneratedExpenses}
            expenseCategories={expenseCategories}
            onInputChange={handleExpenseChange}
            onDeleteRow={handleDeleteExpense}
            duplicateIds={duplicateIds}
          />
          <Button onClick={handleSaveExpenses}>Save Expenses</Button>
          <Button color="red" onClick={handleReset}>
            Discard
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <FileInput
            label="Bank Statement"
            description="Upload PDF or CSV file (max 5MB)"
            placeholder="Select file..."
            accept=".pdf,.csv"
            value={file}
            onChange={handleFileChange}
            disabled={isLoading}
            leftSection={<Upload size={16} />}
            clearable
          />

          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          {file && (
            <Button onClick={handleUpload} disabled={isLoading} loading={isLoading} fullWidth>
              {isLoading ? 'Processing...' : 'Process File'}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  )
}
