import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'
import type { ExpenseCategory, HistoricalExpense } from './types'

export const maxDuration = 300

/**
 * Vercel serverless function for expense categorization
 * Self-contained AI utilities for reliable deployment on Vercel
 */

// Schema for AI output
const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

function buildExpensePrompt({
  transactions,
  categories,
  historicalExpenses
}: {
  transactions: string
  categories: string
  historicalExpenses: string
}): string {
  return `You are an intelligent assistant tasked with categorizing a list of bank transactions for an expense tracker.

## Your Task

Analyze new bank transactions and categorize them based on:
1. Historical expense patterns (how similar transactions were categorized before)
2. The list of active expense categories available

## Input Data

### Historical Expenses (past categorizations for reference):
${historicalExpenses}

### Active Categories (id: name format):
${categories}

### New Transactions to Categorize:
${transactions}

## Categorization Rules

**Transaction Processing:**
- Skip/ignore any transaction containing: "Salary", "Bullish" (these are income, not expenses)
- Format amounts as decimal numbers (e.g., 45.50) without currency symbols
- If 2 amounts exist, use the one in SGD or S$ (the smaller amount is usually the transaction, larger is balance)
- Format dates as 'yyyy-MM-dd'. If no year is present, use ${new Date().getFullYear()}
- If 2 dates exist, use the later/more recent date
- Clean up descriptions minimally for readability while preserving key merchant/transaction info

**Category Matching Logic:**
1. First, check if a similar transaction exists in historical expenses
2. If found, use the same categoryId if it's still in the active categories list
3. If the historical categoryId is no longer active, find the closest matching active category by name
4. If no historical match, make your best guess based on the transaction description
5. ALWAYS use a categoryId from the active categories list - never invent new IDs

## Output Format

Return an array of categorized expenses. For each transaction, provide:
- amount: number (decimal, no currency symbol)
- categoryId: string (must be from active categories)
- date: string (yyyy-MM-dd format)
- description: string (cleaned up, readable)
`
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
    const { prompt, expenseCategories, historicalExpenses } = req.body

    // Validate required inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid or missing prompt' })
    }
    if (!Array.isArray(expenseCategories)) {
      return res.status(400).json({ error: 'Invalid expenseCategories: must be an array' })
    }
    if (!Array.isArray(historicalExpenses)) {
      return res.status(400).json({ error: 'Invalid historicalExpenses: must be an array' })
    }

    const categoriesString = expenseCategories
      .map((cat: ExpenseCategory) => `${cat.id}: ${cat.name}`)
      .join('\n')

    const historicalString = JSON.stringify(
      historicalExpenses.map(
        (e: HistoricalExpense) => ({
          description: e.description,
          categoryId: e.categoryId,
          amount: e.amount
        })
      ),
      null,
      2
    )

    const promptContent = buildExpensePrompt({
      transactions: prompt,
      categories: categoriesString,
      historicalExpenses: historicalString
    })

    const streamResponse = await streamAIResponse(promptContent)

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
    console.error('[AI] Request processing error:', error)
    res.status(500).json({
      error: 'Failed to process expense categorization request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
