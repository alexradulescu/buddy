import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query, type MutationCtx } from './_generated/server'
import { requireUser } from './auth'
import { tables } from './schema'

// Generic read/write for the app tables; field validation comes from the schema on insert/patch
export type Table = keyof typeof tables
const tableNames = Object.keys(tables) as Table[]
const table = v.union(...tableNames.map((t) => v.literal(t)))
type Row = Record<string, unknown> & { id?: string }

const stampsCreatedAt: Table[] = ['expenses', 'incomes', 'accountBalances']

export const list = query({
  args: { tables: v.array(table) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const result: Partial<Record<Table, Doc<Table>[]>> = {}
    for (const t of args.tables) result[t] = await ctx.db.query(t).collect()
    return result
  }
})

export const investment = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireUser(ctx)
    const investmentId = ctx.db.normalizeId('investments', id)
    const doc = investmentId && (await ctx.db.get(investmentId))
    if (!doc) return { investment: null, contributions: [], values: [] }
    return {
      investment: doc,
      contributions: await ctx.db
        .query('investmentContributions')
        .withIndex('by_investment', (q) => q.eq('investmentId', id))
        .collect(),
      values: await ctx.db
        .query('investmentValues')
        .withIndex('by_investment', (q) => q.eq('investmentId', id))
        .collect()
    }
  }
})

async function upsert(ctx: MutationCtx, t: Table, row: Row) {
  const { id, _id, _creationTime, ...fields } = row
  const existing = id ? ctx.db.normalizeId(t, id) : null
  if (existing) return ctx.db.patch(existing, fields as never)
  if (id) throw new Error(`No ${t} row with id ${id}`)
  if (stampsCreatedAt.includes(t)) fields.createdAt = Date.now()
  await ctx.db.insert(t, fields as never)
}

// Update the row if it has an id, otherwise create it
export const save = mutation({
  args: { table, row: v.any() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    await upsert(ctx, args.table, args.row)
  }
})

// All rows or none (a mutation is one transaction)
export const saveMany = mutation({
  args: { table, rows: v.array(v.any()) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    for (const row of args.rows) await upsert(ctx, args.table, row)
  }
})

// Categories still in use can't be deleted (archive them instead); investments take their entries with them
export const remove = mutation({
  args: { table, id: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const id = ctx.db.normalizeId(args.table, args.id)
    if (!id) return

    const usedBy = { expenseCategories: 'expenses', incomeCategories: 'incomes' } as const
    if (args.table === 'expenseCategories' || args.table === 'incomeCategories') {
      const rows = await ctx.db
        .query(usedBy[args.table])
        .withIndex('by_categoryId', (q) => q.eq('categoryId', args.id))
        .collect()
      if (rows.length) throw new ConvexError(`Still used by ${rows.length} ${usedBy[args.table]}. Archive it instead.`)
    }

    if (args.table === 'investments') {
      for (const t of ['investmentContributions', 'investmentValues'] as const) {
        const entries = await ctx.db
          .query(t)
          .withIndex('by_investment', (q) => q.eq('investmentId', args.id))
          .collect()
        for (const e of entries) await ctx.db.delete(e._id)
      }
    }

    await ctx.db.delete(id)
  }
})
