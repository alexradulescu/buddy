/**
 * TOON (Token-Oriented Object Notation) Helpers
 *
 * TOON format reduces token usage by ~40% compared to standard JSON
 * by using a more compact representation optimized for LLM consumption.
 *
 * Benefits:
 * - 39.6% fewer tokens than JSON
 * - 73.9% accuracy vs 69.7% for JSON
 * - Lossless round-trip conversion
 * - Easier for LLMs to parse (tabular structure)
 */

import { encode } from '@toon-format/toon'

interface Expense {
  description: string
  categoryId: string
  amount: number
  date?: string
}

interface Category {
  id: string
  name: string
}

/**
 * Builds TOON-formatted context for AI expense categorization
 *
 * Converts historical expenses and active categories into TOON format
 * to reduce token usage in AI API calls.
 *
 * @param expenses - Historical expenses for pattern matching
 * @param categories - Active expense categories
 * @returns TOON-formatted string ready for AI prompt
 */
export function buildTOONContext(expenses: Expense[], categories: Category[]): string {
  // Prepare data in simple structure for TOON conversion
  const context = {
    historicalExpenses: expenses.map((e) => ({
      description: e.description,
      categoryId: e.categoryId,
      amount: e.amount
    })),
    activeCategories: categories.map((c) => ({
      id: c.id,
      name: c.name
    }))
  }

  // Convert to TOON format
  // This will create a compact tabular representation like:
  // historicalExpenses[10]{description,categoryId,amount}:
  //   Starbucks Coffee,abc-123,5.50
  //   Shell Gas Station,def-456,45.00
  //   ...
  // activeCategories[5]{id,name}:
  //   abc-123,Food & Dining
  //   def-456,Transportation
  //   ...
  return encode(context)
}

/**
 * Example usage of token savings:
 *
 * Standard JSON (180 tokens):
 * {
 *   "categories": [
 *     {"id": "1", "name": "Food", "budget": 500},
 *     {"id": "2", "name": "Transport", "budget": 200}
 *   ]
 * }
 *
 * TOON format (~110 tokens - 39% savings):
 * categories[2]{id,name,budget}:
 *   1,Food,500
 *   2,Transport,200
 */
