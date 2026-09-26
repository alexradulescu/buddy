import { notifications } from '@mantine/notifications'
import { ConvexReactClient, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'

import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import type { Table } from '@convex/rows'

export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Rows keep an `id` (Convex's _id) so components don't deal with system fields
export type Row<T extends Table> = Omit<Doc<T>, '_id' | '_creationTime' | 'legacyId'> & { id: string }

export type Expense = Row<'expenses'>
export type Income = Row<'incomes'>
export type ExpenseCategory = Row<'expenseCategories'>
export type IncomeCategory = Row<'incomeCategories'>
export type AccountBalance = Row<'accountBalances'>
export type Investment = Row<'investments'>
export type InvestmentContribution = Row<'investmentContributions'>
export type InvestmentValue = Row<'investmentValues'>

export const toRow = <T extends Table>({ _id, _creationTime, legacyId: _legacyId, ...doc }: Doc<T>) =>
  ({ ...doc, id: _id }) as unknown as Row<T>

// Whole tables, live. `data` is undefined while loading.
export function useTables<T extends Table>(...tables: T[]) {
  const result = useQuery(api.rows.list, { tables })
  if (!result) return { data: undefined }
  const data = Object.fromEntries(tables.map((t) => [t, (result[t] ?? []).map(toRow)])) as { [K in T]: Row<K>[] }
  return { data }
}

// Writes resolve to true on success; failures are shown as a notification
async function write(run: () => Promise<unknown>) {
  try {
    await run()
    return true
  } catch (e) {
    const message = e instanceof ConvexError ? String(e.data) : 'Could not save your changes, please try again'
    notifications.show({ title: 'Error', message, color: 'red' })
    return false
  }
}

// Update the row if it has an id, otherwise create it
export const save = <T extends Table>(table: T, row: Partial<Row<T>>) =>
  write(() => convex.mutation(api.rows.save, { table, row }))

// All rows or none
export const saveMany = <T extends Table>(table: T, rows: Partial<Row<T>>[]) =>
  write(() => convex.mutation(api.rows.saveMany, { table, rows }))

export const remove = (table: Table, id: string) => write(() => convex.mutation(api.rows.remove, { table, id }))
