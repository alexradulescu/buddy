import { streamText } from 'ai'

import { HistoricalExpense } from '@/components/expense-ai-converter'
import { openai } from '@ai-sdk/openai'

interface BasePromptProps {
  transactions?: string
  categories?: string
  historicalExpenses?: string
}

const basePrompt = ({
  transactions,
  categories,
  historicalExpenses
}: BasePromptProps) => `I will paste a list of transactions at the end of the chat.
Please format those transactions as such:
1. Amount should be formatted to be just the number, to 2 decimals, no currency needed
2. Date should be formatted to \`yyyy-MM-dd\`
3. Description should be the description from the pasted content without any numeric or \`Singapore SG\` references.
4. Using only the following past expenses which include descriptions and categories try your best to guess the correct category for the new expenses based on past ones.
<pastExpenses>
${historicalExpenses}
</pastExpenses>
5. Furthermore for expense categories which are unclear, and cannot be infered from the past do your best to guess based on the following categories and only those: ${categories}. Do not invent or use other categories than the ones mentioned.


You should return the list in the following format:
\`\`\`
<amount>, <category>, <date>, <title>
\`\`\`
<transactionList>
${transactions}
</transactionList>
`

/** Based on the first user and openai messages, generates a title for the conversation */
export async function POST(req: Request) {
  const {
    prompt,
    expenseCategories,
    historicalExpenses
  }: { prompt: string; expenseCategories: string[]; historicalExpenses: HistoricalExpense } = await req.json()

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
