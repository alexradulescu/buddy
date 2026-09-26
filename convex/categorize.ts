'use node'

import { google } from '@ai-sdk/google'
import { Output, streamText } from 'ai'
import { v } from 'convex/values'
import { z } from 'zod'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024

type Category = { id: string; name: string }
type Past = { description: string; categoryId: string; amount: number }

const expenseSchema = z.object({
  amount: z.number().nonnegative().describe('Amount of the expense as a decimal number'),
  categoryId: z.string().min(1).describe('CategoryId from the active categories list'),
  date: z.string().min(8).describe('Date in yyyy-MM-dd format'),
  description: z.string().describe('Cleaned up description preserving key information')
})

const prompt = (transactions: string, categories: Category[], history: Past[]) => `
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

### Recent categorized expenses (categoryId | amount | description)
${history.map((h) => `${h.categoryId} | ${h.amount} | ${h.description}`).join('\n')}

### Transactions
---
${transactions}
---`

// Streams categorized expenses from the model into the import job, one row at a time
export const run = internalAction({
  args: {
    jobId: v.id('importJobs'),
    text: v.optional(v.string()),
    fileId: v.optional(v.id('_storage')),
    fileName: v.optional(v.string())
  },
  handler: async (ctx, { jobId, text, fileId, fileName }) => {
    try {
      const transactions = fileId ? await extractText(await ctx.storage.get(fileId), fileName ?? '') : (text ?? '')
      if (!transactions.trim()) throw new Error('No transactions found in the input')

      const { categories, history } = await ctx.runQuery(internal.imports.context, {})

      // streamText swallows model errors (empty stream), so capture and report them
      let failure: unknown
      const { elementStream } = streamText({
        model: google('gemini-3.5-flash-lite'),
        output: Output.array({ element: expenseSchema }),
        prompt: prompt(transactions, categories, history),
        maxRetries: 2,
        onError: ({ error }) => {
          failure = error
        }
      })
      for await (const row of elementStream) await ctx.runMutation(internal.imports.append, { jobId, row })
      if (failure) throw failure
      await ctx.runMutation(internal.imports.finish, { jobId })
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      await ctx.runMutation(internal.imports.finish, { jobId, error })
    }
  }
})

async function extractText(file: Blob | null, name: string) {
  if (!file) throw new Error('Uploaded file not found')
  if (file.size > MAX_FILE_SIZE) throw new Error('File is too large (max 5MB)')
  if (name.toLowerCase().endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) })
    return (await parser.getText()).text
  }
  return file.text()
}
