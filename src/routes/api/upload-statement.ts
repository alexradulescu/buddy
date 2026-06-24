import { createFileRoute } from '@tanstack/react-router'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'
import type { ExpenseCategory, HistoricalExpense } from '@/types/ai'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

function buildStatementPrompt({
  extractedText,
  expenseCategories,
  historicalExpenses
}: {
  extractedText: string
  expenseCategories: ExpenseCategory[]
  historicalExpenses: HistoricalExpense[]
}): string {
  const categoryList = expenseCategories.map((c) => `- ${c.id}: ${c.name}`).join('\n')

  const historyContext =
    historicalExpenses.length > 0
      ? `\n\nHere are recent expenses for context on categorization patterns:\n${JSON.stringify(historicalExpenses.slice(0, 50), null, 2)}`
      : ''

  return `You are processing a bank statement to extract EXPENSE transactions only.

IMPORTANT RULES:
1. Only extract EXPENSES (debits, purchases, payments, withdrawals)
2. IGNORE all income/credits (salary, refunds, transfers IN)
3. IGNORE internal transfers between accounts
4. IGNORE refunds (transactions with "REFUND" in description)
5. Include ATM/cash withdrawals
6. All amounts should be POSITIVE numbers
7. Dates must be in yyyy-MM-dd format
8. Match each expense to the most appropriate category from the list below

Available categories:
${categoryList}
${historyContext}

Bank statement content:
---
${extractedText}
---

Extract all expense transactions as a JSON array. For each expense include: date, amount (positive), description, categoryId.`
}

async function streamAIResponse(prompt: string): Promise<Response> {
  try {
    console.log('[AI] Using Gemini 3 Flash')
    const result = streamObject({
      model: google('gemini-3-flash-preview'),
      output: 'array',
      schema: expenseSchema,
      prompt,
      maxRetries: 2
    })
    return result.toTextStreamResponse()
  } catch (geminiError) {
    console.warn('[AI] Gemini failed, falling back to GPT-4o-mini:', geminiError)

    try {
      console.log('[AI] Using GPT-4o-mini (fallback)')
      const result = streamObject({
        model: openai('gpt-4o-mini'),
        output: 'array',
        schema: expenseSchema,
        prompt,
        maxRetries: 2
      })
      return result.toTextStreamResponse()
    } catch (openaiError) {
      console.error('[AI] Both providers failed:', { gemini: geminiError, openai: openaiError })
      throw new Error('AI categorization failed with all providers')
    }
  }
}

export const Route = createFileRoute('/api/upload-statement')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData()
          const file = formData.get('file') as File | null
          const expenseCategoriesJson = formData.get('expenseCategories') as string | null
          const historicalExpensesJson = formData.get('historicalExpenses') as string | null

          if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 })
          }

          if (file.size > MAX_FILE_SIZE) {
            return Response.json(
              { error: 'File is too large. Maximum size is 5MB.' },
              { status: 400 }
            )
          }

          const fileType = file.type
          const fileName = file.name.toLowerCase()
          const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
          const isCsv = fileType === 'text/csv' || fileName.endsWith('.csv')

          if (!isPdf && !isCsv) {
            return Response.json(
              { error: 'Unsupported file type. Please upload a PDF or CSV file.' },
              { status: 400 }
            )
          }

          let extractedText: string

          try {
            if (isPdf) {
              const { PDFParse } = await import('pdf-parse')
              const arrayBuffer = await file.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              const parser = new PDFParse({ data: buffer })
              const pdfData = await parser.getText()
              extractedText = pdfData.text

              console.log('[upload-statement] PDF extracted, length:', extractedText.length)

              if (!extractedText || extractedText.trim().length < 50) {
                return Response.json(
                  { error: 'Could not extract text from PDF. Please try CSV format.' },
                  { status: 422 }
                )
              }
            } else {
              extractedText = await file.text()
              console.log('[upload-statement] CSV content length:', extractedText.length)

              if (!extractedText || extractedText.trim().length < 10) {
                return Response.json({ error: 'CSV file appears to be empty.' }, { status: 422 })
              }
            }
          } catch (error) {
            console.error('[upload-statement] Extraction error:', error)
            return Response.json(
              { error: 'Failed to read file. Please try a different file.' },
              { status: 422 }
            )
          }

          const expenseCategories = JSON.parse(expenseCategoriesJson || '[]')
          const historicalExpenses = JSON.parse(historicalExpensesJson || '[]')

          const prompt = buildStatementPrompt({ extractedText, expenseCategories, historicalExpenses })
          console.log('[upload-statement] Sending to AI, prompt length:', prompt.length)

          const streamResponse = await streamAIResponse(prompt)

          const headers = new Headers(streamResponse.headers)
          headers.set('X-Extracted-Text', encodeURIComponent(extractedText))

          return new Response(streamResponse.body, {
            status: streamResponse.status,
            statusText: streamResponse.statusText,
            headers
          })
        } catch (error) {
          console.error('[upload-statement] Request processing error:', error)
          return Response.json(
            {
              error: 'Failed to process bank statement',
              message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
          )
        }
      }
    }
  }
})
