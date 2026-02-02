import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 300

interface PromptProps {
  transactions: string
  categories: string
  historicalExpenses: string
}

const buildPrompt = ({ transactions, categories, historicalExpenses }: PromptProps) =>
  `You are an intelligent assistant tasked with categorizing a list of bank transactions for an expense tracker.

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
- Format dates as 'yyyy-MM-dd'. If no year is present, use 2025
- If 2 dates exist, use the later/more recent date
- Clean up descriptions minimally for readability while preserving key merchant/transaction info

**Category Matching Logic:**
1. First, check if a similar transaction exists in historical expenses
2. If found, use the same categoryId if it's still in the active categories list
3. If the historical categoryId is no longer active, find the closest matching active category by name
   - Example: If historical used "Food [2024]" but active has "Food & Dining", use the active category
4. If no historical match, make your best guess based on the transaction description
5. ALWAYS use a categoryId from the active categories list - never invent new IDs

## Example

Given:
- Historical: "Starbucks Coffee" was categorized as "cat-123" (Food [2024])
- Active categories: "cat-456" = "Food & Dining" (active), "cat-123" = "Food [2024]" (not in active list)
- New transaction: "STARBUCKS #1234 $5.50"

Result: Categorize as "cat-456" (Food & Dining) because:
- Historical shows Starbucks → Food category
- Old category not active, so use closest active match

## Output Format

Return an array of categorized expenses. For each transaction, provide:
- amount: number (decimal, no currency symbol)
- categoryId: string (must be from active categories)
- date: string (yyyy-MM-dd format)
- description: string (cleaned up, readable)
`

const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

/**
 * Vercel serverless function using Node.js (req, res) pattern.
 * Streams the AI response by piping the ReadableStream to res.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { prompt, expenseCategories, historicalExpenses } = req.body

    const categoriesString = expenseCategories
      .map((cat: { id: string; name: string }) => `${cat.id}: ${cat.name}`)
      .join('\n')

    const historicalString = JSON.stringify(
      historicalExpenses.map((e: { description: string; categoryId: string; amount: number }) => ({
        description: e.description,
        categoryId: e.categoryId,
        amount: e.amount
      })),
      null,
      2
    )

    const promptContent = buildPrompt({
      transactions: prompt,
      categories: categoriesString,
      historicalExpenses: historicalString
    })

    let streamResponse: Response

    try {
      console.log('[AI] Using Gemini 3 Flash')
      const result = streamObject({
        model: google('gemini-3-flash-preview'),
        output: 'array',
        schema: expenseSchema,
        prompt: promptContent,
        maxRetries: 2
      })
      streamResponse = result.toTextStreamResponse()
    } catch (geminiError) {
      console.warn('[AI] Gemini failed, falling back to GPT-4o-mini:', geminiError)

      try {
        console.log('[AI] Using GPT-4o-mini (fallback)')
        const result = streamObject({
          model: openai('gpt-4o-mini'),
          output: 'array',
          schema: expenseSchema,
          prompt: promptContent,
          maxRetries: 2
        })
        streamResponse = result.toTextStreamResponse()
      } catch (openaiError) {
        console.error('[AI] Both providers failed:', { gemini: geminiError, openai: openaiError })
        res.status(500).json({ error: 'AI categorization failed with all providers' })
        return
      }
    }

    // Forward headers from the AI SDK streaming response
    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Pipe the ReadableStream to the Node.js response
    const reader = streamResponse.body?.getReader()
    if (!reader) {
      res.status(500).json({ error: 'No response stream available' })
      return
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
