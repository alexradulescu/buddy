import { google } from '@ai-sdk/google'
import { streamObject } from 'ai'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'

export const maxDuration = 300

const MAX_FILE_SIZE = 5 * 1024 * 1024

const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

type Category = { id: string; name: string }

const prompt = (transactions: string, categories: Category[], history: unknown[]) => `
You categorize bank transactions for a personal expense tracker.

## Rules
- Only extract EXPENSES (debits, purchases, payments, ATM/cash withdrawals).
- Ignore income and credits: salary, anything containing "Salary" or "Bullish", transfers in.
- Ignore refunds (e.g. "REFUND" in the description) and internal transfers between own accounts.
- Amounts are positive decimal numbers without currency symbols (e.g. 45.50).
- If a line has 2 amounts, use the one in SGD or S$ (the smaller one is usually the transaction, the larger the balance).
- Dates are 'yyyy-MM-dd'. If no year is present, use ${new Date().getFullYear()}. If 2 dates exist, use the later one.
- Clean up descriptions minimally, keeping the merchant/transaction info.

## Categories
1. If a similar transaction exists in the history, reuse its categoryId when it is still active.
2. If that categoryId is no longer active, pick the closest active category by name.
3. Otherwise make your best guess from the description.
4. ALWAYS use a categoryId from the active list below; never invent ids.

### Active categories (id: name)
${categories.map((c) => `${c.id}: ${c.name}`).join('\n')}

### Recent categorized expenses
${JSON.stringify(history.slice(0, 200))}

### Transactions
---
${transactions}
---`

async function extractText(file: File) {
  if (file.name.toLowerCase().endsWith('.pdf')) {
    const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) })
    return (await parser.getText()).text
  }
  return file.text()
}

// multipart form: text OR file (PDF/CSV), categories JSON, history JSON
// responds with newline-delimited JSON, one expense per line, as the model produces them
export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (file && file.size > MAX_FILE_SIZE) return Response.json({ error: 'File is too large (max 5MB)' }, { status: 400 })

  const transactions = file ? await extractText(file) : String(form.get('text') ?? '')
  if (!transactions.trim()) return Response.json({ error: 'No transactions found in the input' }, { status: 422 })

  const categories: Category[] = JSON.parse(String(form.get('categories') ?? '[]'))
  const history: unknown[] = JSON.parse(String(form.get('history') ?? '[]'))

  const { elementStream } = streamObject({
    model: google('gemini-3-flash-preview'),
    output: 'array',
    schema: expenseSchema,
    prompt: prompt(transactions, categories, history),
    maxRetries: 2
  })

  const encoder = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const expense of elementStream) controller.enqueue(encoder.encode(JSON.stringify(expense) + '\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
  return new Response(body, { headers: { 'Content-Type': 'application/x-ndjson' } })
}
