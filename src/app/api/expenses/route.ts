import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { expensesSchema } from './schema'

interface BasePromptProps {
  transactions?: string
  categories?: string
  historicalExpenses?: string
}

const basePrompt = ({
  transactions,
  categories,
  historicalExpenses
}: BasePromptProps) => `You are an intelligent assistant tasked with categorizing a list of bank transactions for an expense tracker. The user has provided two key inputs:
1. A list of past transactions, each with a description and its assigned category.
2. A user-defined, id-label list of categories that must be strictly followed.

- Use the past transactions to help infer the correct categories for new transactions.
- Only assign categories from the provided list of categories.
- If a new transaction's description or context closely matches a past transaction, use the same category if available. If the category is not available, use the category with the closest label to the category label in the past transactions.
- If no clear match exists, make your best guess based on the description while adhering strictly to the category list.
- Return the categoryId for the selected category.
- Format the amount as a number with two decimal places, without including the currency symbol.
- Format the date as 'yyyy-MM-dd'.
- Use the transaction description from the provided data, but remove any numeric values and the text "Singapore SG."
- Return the results in the following format: '<amount>, <categoryId>, <date>, <description>'. Each entry on a new line. No other text, no other info, intro or markings.

Here are examples of past expenses:
${historicalExpenses}

The user-defined categories are:
${categories}

Now, categorize the following new transactions:
${transactions}`

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    rawTransactions,
    expenseCategories,
    historicalExpenses
  }: {
    rawTransactions: string
    expenseCategories: Record<string, string>
    historicalExpenses: Record<string, string>
  } = await req.json()

  console.info('INPUT')
  console.info({ rawTransactions, expenseCategories, historicalExpenses })

  // const result = await streamObject({
  //   model: openai('gpt-4o-mini'),
  //   schema: expensesSchema,
  //   // prompt: `Generate 3 notifications for a messages app in this context:` + context
  //   prompt: basePrompt({
  //     transactions: rawTransactions,
  //     categories: JSON.stringify(expenseCategories),
  //     historicalExpenses: JSON.stringify(historicalExpenses)
  //   })
  // })

  // return result.toTextStreamResponse()
}
