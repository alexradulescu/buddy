import { buildTOONContext } from '@/lib/toon-helpers'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Type assertion to handle LanguageModelV2 compatibility
type AnyLanguageModel = any

interface BasePromptProps {
  transactions?: string
  contextData?: string
  useTOON?: boolean
}

/**
 * System prompt for AI expense categorization
 * Updated to handle TOON format input
 */
const systemPrompt = `You are an intelligent expense categorization assistant.

Your task is to categorize bank transactions based on historical expense patterns and active categories.

IMPORTANT RULES:
- Skip/ignore transactions containing: "Salary", "Bullish" (these are income, not expenses)
- Format amounts as decimal numbers (e.g., 45.50) without currency symbols
- If 2 amounts exist, always use the one in SGD OR S$.
- Format dates as 'yyyy-MM-dd'. If no year, default to 2025
- If 2 dates exist, use the later date, usuallynthe first of the 2
- Clean up descriptions for readability while preserving key information
- Only use categoryId from the provided active categories list
- Match historical patterns for consistent categorization
- If old category name differs from active name, map to closest active category

Context will be provided in TOON format (Token-Oriented Object Notation) or JSON format.
TOON format is a compact tabular representation optimized for LLMs.

Example TOON format:
historicalExpenses[3]{description,categoryId,amount}:
  Starbucks Coffee,abc-123,5.50
  Shell Gas Station,def-456,45.00
  Cinema Ticket,ghi-789,25.00
activeCategories[3]{id,name}:
  abc-123,Food & Dining
  def-456,Transportation
  ghi-789,Entertainment`

/**
 * Builds the user prompt with context and transactions
 */
const buildPrompt = ({ transactions, contextData, useTOON }: BasePromptProps) => {
  const formatLabel = useTOON ? 'TOON format' : 'JSON format'

  return `Historical expense context (${formatLabel}):
${contextData}

New transactions to categorize:
${transactions}

Analyze the context above and categorize each transaction.
Return ONLY the categorized expenses without any additional text.`
}

/**
 * Expense schema for validation
 * Note: Using lenient validation - strict UUID validation happens client-side
 */
const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense'),
  categoryId: z.string().min(1).describe('categoryId from active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

/**
 * Repair malformed JSON from AI responses
 */
const repairJson = async ({ text }: { text: string }) => {
  return text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/'/g, '"')
}

export const maxDuration = 60

/**
 * Categorize expenses with Gemini 2.5 Flash (primary provider)
 */
async function categorizeWithGemini(contextData: string, transactions: string, useTOON: boolean) {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash') as AnyLanguageModel,
    output: 'array',
    schema: expenseSchema,
    system: systemPrompt,
    prompt: buildPrompt({
      transactions,
      contextData,
      useTOON
    }),
    maxRetries: 3,
    experimental_repairText: repairJson
  })

  return object
}

/**
 * Categorize expenses with OpenAI GPT-5-nano (fallback provider)
 */
async function categorizeWithOpenAI(contextData: string, transactions: string, useTOON: boolean) {
  const { object } = await generateObject({
    model: openai('gpt-5-nano') as AnyLanguageModel,
    output: 'array',
    schema: expenseSchema,
    system: systemPrompt,
    prompt: buildPrompt({
      transactions,
      contextData,
      useTOON
    }),
    maxRetries: 3,
    experimental_repairText: repairJson
  })

  return object
}

/**
 * POST handler for expense categorization
 *
 * Multi-provider fallback strategy:
 * 1. Try OpenAI GPT-5-nano (fast, reliable) with TOON format
 * 2. Fall back to Gemini 2.5 Flash if OpenAI fails
 *
 * Expected request body:
 * {
 *   prompt: string,              // Raw transaction text to categorize
 *   expenseCategories: object[], // Active categories with id and name
 *   historicalExpenses: object[] // Past expenses for pattern matching
 * }
 */
export async function POST(req: Request) {
  try {
    const {
      prompt,
      expenseCategories,
      historicalExpenses
    }: {
      prompt: string
      expenseCategories: Array<{ id: string; name: string }>
      historicalExpenses: Array<{ description: string; categoryId: string; amount: number }>
    } = await req.json()

    // Convert context to TOON format for 40% token reduction
    const toonContext = buildTOONContext(historicalExpenses || [], expenseCategories || [])

    // Try OpenAI first (reliable)
    try {
      console.log('[AI] Using OpenAI GPT-5-nano with TOON format')
      const expenses = await categorizeWithOpenAI(toonContext, prompt, true)
      return Response.json(expenses)
    } catch (openaiError) {
      console.warn('[AI] OpenAI failed, falling back to Gemini:', openaiError)

      // Fallback to Gemini with TOON format
      try {
        console.log('[AI] Using Gemini 2.5 Flash with TOON format (fallback)')
        const expenses = await categorizeWithGemini(toonContext, prompt, true)
        return Response.json(expenses)
      } catch (geminiError) {
        console.error('[AI] Both providers failed:', {
          openai: openaiError,
          gemini: geminiError
        })
        throw new Error('AI categorization failed with all providers')
      }
    }
  } catch (error) {
    console.error('[AI] Request processing error:', error)
    return Response.json(
      {
        error: 'Failed to process expense categorization request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
