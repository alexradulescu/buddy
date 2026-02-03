/**
 * Shared types for API routes
 * Provides type safety across Vercel serverless functions
 */

/** Category for organizing expenses */
export interface ExpenseCategory {
  id: string
  name: string
}

/** Historical expense for AI context */
export interface HistoricalExpense {
  description: string
  categoryId: string
  amount: number
}

/** Parsed expense from AI output */
export interface ParsedExpense {
  amount: number
  categoryId: string
  date: string
  description: string
}
