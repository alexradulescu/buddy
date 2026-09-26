import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Same shapes as the InstantDB entities. References (categoryId, investmentId) stay strings for now:
// uncategorized rows use '' and the data migration needs to remap ids.
// legacyId holds the InstantDB id of migrated rows.
const legacy = { legacyId: v.optional(v.string()) }

const transaction = {
  date: v.string(),
  amount: v.number(),
  description: v.string(),
  category: v.optional(v.string()),
  categoryId: v.string(),
  createdAt: v.number(),
  ...legacy
}

export const tables = {
  accountBalances: defineTable({
    title: v.string(),
    amount: v.number(),
    year: v.number(),
    month: v.number(),
    createdAt: v.number(),
    ...legacy
  })
    .index('by_year_month', ['year', 'month'])
    .index('by_legacyId', ['legacyId']),
  expenses: defineTable(transaction)
    .index('by_date', ['date'])
    .index('by_categoryId', ['categoryId'])
    .index('by_legacyId', ['legacyId']),
  expenseCategories: defineTable({
    name: v.string(),
    maxBudget: v.number(),
    maxAnnualBudget: v.number(),
    isArchived: v.boolean(),
    ...legacy
  }).index('by_legacyId', ['legacyId']),
  incomes: defineTable(transaction)
    .index('by_date', ['date'])
    .index('by_categoryId', ['categoryId'])
    .index('by_legacyId', ['legacyId']),
  incomeCategories: defineTable({
    title: v.string(),
    targetAmount: v.number(),
    isArchived: v.boolean(),
    ...legacy
  }).index('by_legacyId', ['legacyId']),
  investments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdDate: v.string(),
    isActive: v.boolean(),
    ...legacy
  }).index('by_legacyId', ['legacyId']),
  investmentContributions: defineTable({
    investmentId: v.string(),
    amount: v.number(),
    date: v.string(),
    description: v.optional(v.string()),
    ...legacy
  })
    .index('by_investment', ['investmentId'])
    .index('by_legacyId', ['legacyId']),
  investmentValues: defineTable({
    investmentId: v.string(),
    value: v.number(),
    date: v.string(),
    description: v.optional(v.string()),
    ...legacy
  })
    .index('by_investment', ['investmentId'])
    .index('by_legacyId', ['legacyId'])
}

export const importedExpense = v.object({
  date: v.string(),
  amount: v.number(),
  description: v.string(),
  categoryId: v.string()
})

export default defineSchema({
  ...authTables,
  ...tables,
  // One AI import at a time: rows are appended as the model streams them
  importJobs: defineTable({
    status: v.union(v.literal('running'), v.literal('done'), v.literal('error')),
    error: v.optional(v.string()),
    rows: v.array(importedExpense),
    fileId: v.optional(v.id('_storage'))
  })
})
