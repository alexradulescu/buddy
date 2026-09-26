import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, internalQuery, mutation, query, type MutationCtx } from './_generated/server'
import { requireUser } from './auth'
import { importedExpense } from './schema'

const MAX_HISTORY = 200

// The current AI import (at most one), so its rows survive a reload
export const current = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db.query('importJobs').order('desc').first()
  }
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.storage.generateUploadUrl()
  }
})

// Pass pasted text, or a PDF/CSV uploaded through generateUploadUrl
export const start = mutation({
  args: { text: v.optional(v.string()), fileId: v.optional(v.id('_storage')), fileName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    await clearJobs(ctx)
    const jobId = await ctx.db.insert('importJobs', { status: 'running', rows: [], fileId: args.fileId })
    await ctx.scheduler.runAfter(0, internal.categorize.run, { jobId, ...args })
    return jobId
  }
})

// Discard or finished saving
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    await clearJobs(ctx)
  }
})

async function clearJobs(ctx: MutationCtx) {
  for (const job of await ctx.db.query('importJobs').collect()) {
    if (job.fileId) await ctx.storage.delete(job.fileId).catch(() => {})
    await ctx.db.delete(job._id)
  }
}

// --- used by the categorize action ---

export const context = internalQuery({
  args: {},
  handler: async (ctx) => {
    const categories = (await ctx.db.query('expenseCategories').collect())
      .filter((c) => !c.isArchived)
      .map((c) => ({ id: c._id as string, name: c.name }))
    const history = (await ctx.db.query('expenses').withIndex('by_date').order('desc').take(MAX_HISTORY)).map(
      ({ description, categoryId, amount }) => ({ description, categoryId, amount })
    )
    return { categories, history }
  }
})

export const append = internalMutation({
  args: { jobId: v.id('importJobs'), row: importedExpense },
  handler: async (ctx, { jobId, row }) => {
    const job = await ctx.db.get(jobId)
    if (job?.status === 'running') await ctx.db.patch(jobId, { rows: [...job.rows, row] })
  }
})

export const finish = internalMutation({
  args: { jobId: v.id('importJobs'), error: v.optional(v.string()) },
  handler: async (ctx, { jobId, error }) => {
    const job = await ctx.db.get(jobId)
    if (!job) return
    if (job.fileId) await ctx.storage.delete(job.fileId).catch(() => {})
    await ctx.db.patch(jobId, { status: error ? 'error' : 'done', error, fileId: undefined })
  }
})
