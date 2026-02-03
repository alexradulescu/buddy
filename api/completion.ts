import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildExpensePrompt, streamAIResponse } from './_lib/expense-ai'

export const maxDuration = 300

/**
 * Vercel serverless function for expense categorization
 * Uses shared AI utilities for consistent processing
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, expenseCategories, historicalExpenses } = req.body

    const categoriesString = expenseCategories
      .map((cat: { id: string; name: string }) => `${cat.id}: ${cat.name}`)
      .join('\n')

    const historicalString = JSON.stringify(
      historicalExpenses.map(
        (e: { description: string; categoryId: string; amount: number }) => ({
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
