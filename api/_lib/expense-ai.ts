import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

/**
 * Shared AI utilities for expense processing
 * Used by both completion and upload-statement endpoints
 */

export const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

export type ExpenseSchema = z.infer<typeof expenseSchema>

interface PromptProps {
  transactions: string
  categories: string
  historicalExpenses: string
}

export function buildExpensePrompt({ transactions, categories, historicalExpenses }: PromptProps): string {
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
- Format dates as 'yyyy-MM-dd'. If no year is present, use 2025
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

interface StatementPromptProps {
  extractedText: string
  expenseCategories: Array<{ id: string; name: string }>
  historicalExpenses: Array<{ date: string; amount: number; description: string; categoryId: string }>
}

export function buildStatementPrompt({
  extractedText,
  expenseCategories,
  historicalExpenses
}: StatementPromptProps): string {
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

/**
 * Stream AI response with multi-provider fallback
 * Returns a Response object that can be streamed to the client
 */
export async function streamAIResponse(prompt: string): Promise<Response> {
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
