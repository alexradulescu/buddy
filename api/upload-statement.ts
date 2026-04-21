import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'
import type { ExpenseCategory, HistoricalExpense } from './types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const maxDuration = 300

// Schema for AI output
const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

function buildInstructions(expenseCategories: ExpenseCategory[], historicalExpenses: HistoricalExpense[]): string {
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

Extract all expense transactions as a JSON array. For each expense include: date, amount (positive), description, categoryId.`
}

function buildStatementPrompt({
  extractedText,
  expenseCategories,
  historicalExpenses
}: {
  extractedText: string
  expenseCategories: ExpenseCategory[]
  historicalExpenses: HistoricalExpense[]
}): string {
  return `${buildInstructions(expenseCategories, historicalExpenses)}

Bank statement content:
---
${extractedText}
---`
}

// PDF path: send file directly to Gemini — no pdfjs/canvas dependency needed
async function streamAIResponseWithPDF(
  pdfData: Uint8Array,
  expenseCategories: ExpenseCategory[],
  historicalExpenses: HistoricalExpense[]
): Promise<Response> {
  console.log('[AI] Using Gemini with native PDF support')
  const result = streamObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    output: 'array',
    schema: expenseSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'file', data: pdfData, mediaType: 'application/pdf' },
          { type: 'text', text: buildInstructions(expenseCategories, historicalExpenses) }
        ]
      }
    ],
    maxRetries: 2
  })
  return result.toTextStreamResponse()
}

// CSV / text path: extract text first then pass as prompt with Gemini + OpenAI fallback
async function streamAIResponseWithText(prompt: string): Promise<Response> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = await getFormData(req)
    const file = formData.get('file') as File | null
    const expenseCategoriesJson = formData.get('expenseCategories') as string | null
    const historicalExpensesJson = formData.get('historicalExpenses') as string | null

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isCsv = fileType === 'text/csv' || fileName.endsWith('.csv')

    if (!isPdf && !isCsv) {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or CSV file.' })
    }

    const expenseCategories: ExpenseCategory[] = JSON.parse(expenseCategoriesJson || '[]')
    const historicalExpenses: HistoricalExpense[] = JSON.parse(historicalExpensesJson || '[]')

    let streamResponse: Response

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer()
      console.log('[upload-statement] Processing PDF natively, size:', arrayBuffer.byteLength)
      streamResponse = await streamAIResponseWithPDF(
        new Uint8Array(arrayBuffer),
        expenseCategories,
        historicalExpenses
      )
    } else {
      let extractedText: string
      try {
        extractedText = await file.text()
        console.log('[upload-statement] CSV content length:', extractedText.length)
        if (!extractedText || extractedText.trim().length < 10) {
          return res.status(422).json({ error: 'CSV file appears to be empty.' })
        }
      } catch (error) {
        console.error('[upload-statement] CSV read error:', error)
        return res.status(422).json({ error: 'Failed to read file. Please try a different file.' })
      }
      const prompt = buildStatementPrompt({ extractedText, expenseCategories, historicalExpenses })
      console.log('[upload-statement] Sending to AI, prompt length:', prompt.length)
      streamResponse = await streamAIResponseWithText(prompt)
      streamResponse.headers.set('X-Extracted-Text', encodeURIComponent(extractedText))
    }

    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const reader = streamResponse.body?.getReader()
    if (!reader) {
      return res.status(500).json({ error: 'No response stream available' })
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }

    res.end()
  } catch (error) {
    console.error('[upload-statement] Request processing error:', error)
    res.status(500).json({
      error: 'Failed to process bank statement',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Parse FormData from Vercel request.
 * Vercel's body parsing doesn't handle multipart/form-data, so we do it manually.
 */
async function getFormData(req: VercelRequest): Promise<FormData> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(req.body)) {
      formData.append(key, value as any)
    }
    return formData
  }

  const busboy = await import('busboy')
  const contentType = req.headers['content-type'] || ''

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    const bb = busboy.default({ headers: { 'content-type': contentType } })

    bb.on('file', (name, file, info) => {
      const chunks: Buffer[] = []
      file.on('data', (chunk: Buffer) => chunks.push(chunk))
      file.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const blob = new Blob([buffer.buffer], { type: info.mimeType })
        formData.append(name, blob as any, info.filename)
      })
    })

    bb.on('field', (name, value) => {
      formData.append(name, value)
    })

    bb.on('finish', () => resolve(formData))
    bb.on('error', reject)

    if (req.readable) {
      req.pipe(bb)
    } else {
      bb.end()
    }
  })
}
