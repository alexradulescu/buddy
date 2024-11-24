import { z } from 'zod'

export const expensesSchema = z.object({
  expenses: z.array(
    z.object({
      amount: z.number().positive().describe('The expense amount. Must be positive, with 2 decimals precision'),
      category: z.string().describe('The expense category. Must be of the predefined list'),
      date: z.string().describe('Date in string format, yyyy-MM-dd'),
      description: z.string().describe('Expense description as it comes from the bank.')
    })
  )
})
