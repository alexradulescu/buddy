import { streamText } from 'ai'

import { openai } from '@ai-sdk/openai'

const basePrompt = (
  transactions: string,
  categories: string
) => `I will paste a list of transactions at the end of the chat.
Please format those transactions as such:
1. Amount should be formatted to be just the number, to 2 decimals, no currency needed
2. For categories do your best to guess based only on the following categories and none other: ${categories}. Do not invent or use other categories than the ones mentioned.
3. Date should be formatted to \`yyyy-MM-dd\`
4. Description should be the description from the pasted content without any numeric or \`Singapore SG\` references.

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
  const { prompt, expenseCategories }: { prompt: string; expenseCategories: string[] } = await req.json()

  console.info(basePrompt(prompt, expenseCategories.join(', ')))

  /** Using plain generate, not streaming data as the whole response is very vast and short */
  const result = await streamText({
    /** Using gpt 4o mini as it is cheaper and yet fast, for limited task like a conversation title */
    model: openai('gpt-4o-mini'),
    prompt: basePrompt(prompt, expenseCategories.join(', '))
  })

  console.info(result)

  return result.toDataStreamResponse()
}
