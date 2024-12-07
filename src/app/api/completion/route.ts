import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

interface BasePromptProps {
  transactions?: string
  categories?: string
  historicalExpenses?: string
}

const basePrompt = ({
  transactions,
  categories,
  historicalExpenses
}: BasePromptProps) => `You are an intelligent assistant tasked with categorizing a list of bank transactions. The user has provided two key inputs:
1. A list of past transactions, each with a description and its assigned category.
2. A user-defined list of categories that must be strictly followed.

- Use the past transactions to help infer the correct categories for new transactions.
- Only assign categories from the provided list of categories.
- If a new transaction's description or context closely matches a past transaction, use the same category.
- If no clear match exists, make your best guess based on the description while adhering strictly to the category list.
- Format the amount as a number with two decimal places, without including the currency symbol.
- Format the date as 'yyyy-MM-dd'. If no year is present on the date of an expense, set current year, 2024.
- Keep the original description, exactly as it was.
- Return the results in the following format strictly as stringified array of JSON objects: [{amount, category, date, description}, ...]. Each entry on a new line. No other text, no other info, intro or markings.

Here are examples of past expenses:
${historicalExpenses}

The user-defined categories are:
${categories}

Now, categorize the following new transactions:
${transactions}
`

export const maxDuration = 60

/** Based on the first user and openai messages, generates a title for the conversation */
export async function POST(req: Request) {
  const {
    prompt,
    expenseCategories,
    historicalExpenses
  }: { prompt: string; expenseCategories: string[]; historicalExpenses: Record<string, string> } = await req.json()

  /** Using plain generate, not streaming data as the whole response is very vast and short */
  const result = await streamText({
    /** Using gpt 4o mini as it is cheaper and yet fast, for limited task like a conversation title */
    model: openai('gpt-4o-mini'),
    prompt: basePrompt({
      transactions: prompt,
      categories: expenseCategories.join(', '),
      historicalExpenses: JSON.stringify(historicalExpenses)
    })
  })

  return result.toDataStreamResponse()
}
