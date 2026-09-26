import { i, id, init, type InstaQLEntity } from '@instantdb/react'

const schema = i.schema({
  entities: {
    accountBalances: i.entity({
      id: i.string(),
      title: i.string(),
      amount: i.number(),
      year: i.number(),
      month: i.number(),
      createdAt: i.number()
    }),
    expenses: i.entity({
      id: i.string(),
      date: i.string(),
      amount: i.number(),
      description: i.string(),
      category: i.string().optional(),
      categoryId: i.string(),
      createdAt: i.number()
    }),
    expenseCategories: i.entity({
      id: i.string(),
      name: i.string(),
      maxBudget: i.number(),
      maxAnnualBudget: i.number(),
      isArchived: i.boolean()
    }),
    incomes: i.entity({
      id: i.string(),
      date: i.string(),
      amount: i.number(),
      description: i.string(),
      category: i.string().optional(),
      categoryId: i.string(),
      createdAt: i.number()
    }),
    incomeCategories: i.entity({
      id: i.string(),
      title: i.string(),
      targetAmount: i.number(),
      isArchived: i.boolean()
    }),
    investments: i.entity({
      id: i.string(),
      name: i.string(),
      description: i.string().optional(),
      createdDate: i.string(),
      isActive: i.boolean()
    }),
    investmentContributions: i.entity({
      id: i.string(),
      investmentId: i.string(),
      amount: i.number(),
      date: i.string(),
      description: i.string().optional()
    }),
    investmentValues: i.entity({
      id: i.string(),
      investmentId: i.string(),
      value: i.number(),
      date: i.string(),
      description: i.string().optional()
    })
  }
})

export const db = init({ appId: import.meta.env.VITE_INSTANTDB_APP_ID || '', schema })

type Schema = typeof schema
type Entities = Schema['entities']
type EntityName = keyof Entities

export type Expense = InstaQLEntity<Schema, 'expenses'>
export type Income = InstaQLEntity<Schema, 'incomes'>
export type ExpenseCategory = InstaQLEntity<Schema, 'expenseCategories'>
export type IncomeCategory = InstaQLEntity<Schema, 'incomeCategories'>
export type AccountBalance = InstaQLEntity<Schema, 'accountBalances'>
export type Investment = InstaQLEntity<Schema, 'investments'>
export type InvestmentContribution = InstaQLEntity<Schema, 'investmentContributions'>
export type InvestmentValue = InstaQLEntity<Schema, 'investmentValues'>

const stampsCreatedAt: EntityName[] = ['expenses', 'incomes', 'accountBalances']

// Update the row if it has an id, otherwise create it
export function save<E extends EntityName>(entity: E, row: Partial<InstaQLEntity<Schema, E>>) {
  const { id: rowId, ...fields } = row as { id?: string } & Record<string, unknown>
  const isNew = !rowId
  const data = isNew && stampsCreatedAt.includes(entity) ? { ...fields, createdAt: Date.now() } : fields
  return db.transact(db.tx[entity][rowId || id()].update(data as never))
}

export function remove(entity: EntityName, rowId: string) {
  return db.transact(db.tx[entity][rowId].delete())
}
