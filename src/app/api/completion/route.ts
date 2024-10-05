import { streamText } from 'ai'

import { openai } from '@ai-sdk/openai'

const BASE_PROMPT = `I will paste a list of transactions at the end of the chat.
Please format those transactions as such:
1. Amount should be formatted to be just the number, to 2 decimals, no currency needed
2. Category should be based on the following rules
    - If description includes 'NTUC' referece, category should be 'home'
    - If description includes 'BUS/MRT' referece, category should be 'transport'
    - If description includes 'PRUDENTIAL' referece, category should be 'investment'
    - All others try your best to guess based on the following categories list: home, transport, investment, shopping
3. Date should be formatted to \`yyyy-MM-dd\`
4. Description should be the description from the pasted content without any numeric or \`Singapore SG\` references.

You should return the list in the following format:
\`\`\`
<amount>, <category>, <date>, <title>
\`\`\`
<transactionList>
<TRANSACTION_LIST>
</transactionList>
`

/** Based on the first user and openai messages, generates a title for the conversation */
export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json()

  console.info({ prompt, BASE_PROMPT })

  /** Using plain generate, not streaming data as the whole response is very vast and short */
  const result = await streamText({
    /** Using gpt 4o mini as it is cheaper and yet fast, for limited task like a conversation title */
    model: openai('gpt-4o-mini'),
    prompt: BASE_PROMPT.replace('<TRANSACTION_LIST>', prompt)
  })

  console.info(result)

  return result.toDataStreamResponse()
}
