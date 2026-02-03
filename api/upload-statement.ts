import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const maxDuration = 300

/**
 * Vercel serverless function for bank statement upload
 * Accepts PDF/CSV files, extracts text, and processes with AI
 */

// Schema for AI output
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
  expenseCategories: Array<{ id: string; name: string }>
  historicalExpenses: Array<{ date: string; amount: number; description: string; categoryId: string }>
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = await getFormData(req)
    const file = formData.get('file') as File | null
    const expenseCategoriesJson = formData.get('expenseCategories') as string | null
    const historicalExpensesJson = formData.get('historicalExpenses') as string | null

    // Validate file exists
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' })
    }

    // Validate file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isCsv = fileType === 'text/csv' || fileName.endsWith('.csv')

    if (!isPdf && !isCsv) {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or CSV file.' })
    }

    let extractedText: string

    try {
      if (isPdf) {
        const pdfParse = (await import('pdf-parse')).default
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text

        console.log('[upload-statement] PDF extracted, length:', extractedText.length)

        if (!extractedText || extractedText.trim().length < 50) {
          return res.status(422).json({ error: 'Could not extract text from PDF. Please try CSV format.' })
        }
      } else {
        extractedText = await file.text()
        console.log('[upload-statement] CSV content length:', extractedText.length)

        if (!extractedText || extractedText.trim().length < 10) {
          return res.status(422).json({ error: 'CSV file appears to be empty.' })
        }
      }
    } catch (error) {
      console.error('[upload-statement] Extraction error:', error)
      return res.status(422).json({ error: 'Failed to read file. Please try a different file.' })
    }

    // Parse categories and historical expenses
    const expenseCategories = JSON.parse(expenseCategoriesJson || '[]')
    const historicalExpenses = JSON.parse(historicalExpensesJson || '[]')

    // Build prompt for AI
    const prompt = buildStatementPrompt({ extractedText, expenseCategories, historicalExpenses })
    console.log('[upload-statement] Sending to AI, prompt length:', prompt.length)

    // Get streaming AI response
    const streamResponse = await streamAIResponse(prompt)

    // Add extracted text to response headers
    streamResponse.headers.set('X-Extracted-Text', encodeURIComponent(extractedText))

    // Forward headers from streaming response
    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Pipe the stream to response
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
 * Parse FormData from Vercel request
 * Vercel's body parsing doesn't handle multipart/form-data properly
 * so we need to parse it manually
 */
async function getFormData(req: VercelRequest): Promise<FormData> {
  // Vercel might have already parsed the body
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    // Body was parsed as JSON, need to reconstruct FormData
    const formData = new FormData()
    for (const [key, value] of Object.entries(req.body)) {
      formData.append(key, value as any)
    }
    return formData
  }

  // Read raw body and parse FormData
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
