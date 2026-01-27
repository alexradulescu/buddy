import { i, id, init, InstaQLEntity } from '@instantdb/react'

export const schema = i.schema({
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

export type Income = InstaQLEntity<typeof schema, 'incomes'>
export type Expense = InstaQLEntity<typeof schema, 'expenses'>
export type ExpenseCategory = InstaQLEntity<typeof schema, 'expenseCategories'>
export type AccountBalance = InstaQLEntity<typeof schema, 'accountBalances'>
export type IncomeCategory = InstaQLEntity<typeof schema, 'incomeCategories'>

export const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID || '',
  schema
})

export const { useQuery, transact, tx } = db
export { id } from '@instantdb/react'

export function useAccountBalances(year: number, month: number) {
  const query = useQuery({
    accountBalances: {
      $: {
        where: {
          year,
          month
        }
      }
    }
  })

  const addAccountBalance = async (account: Omit<AccountBalance, 'id'>) => {
    await transact([
      tx.accountBalances[id()].update({
        ...account,
        createdAt: Date.now()
      })
    ])
  }

  const updateAccountBalance = async (accountId: string, updates: Partial<AccountBalance>) => {
    await transact([tx.accountBalances[accountId].update(updates)])
  }

  const removeAccountBalance = async (accountId: string) => {
    await transact([tx.accountBalances[accountId].delete()])
  }

  return {
    ...query,
    addAccountBalance,
    updateAccountBalance,
    removeAccountBalance
  }
}

// Category Hooks
export function useCategoryStore() {
  const query = db.useQuery({
    expenseCategories: {},
    incomeCategories: {}
  })

  const addExpenseCategory = async (category: Partial<ExpenseCategory>) => {
    await db.transact([
      db.tx.expenseCategories[id()].update({
        ...category
      })
    ])
  }

  const addIncomeCategory = async (category: Partial<IncomeCategory>) => {
    await db.transact([
      db.tx.incomeCategories[id()].update({
        ...category
      })
    ])
  }

  const removeExpenseCategory = async (categoryId: string) => {
    await db.transact([db.tx.expenseCategories[categoryId].delete()])
  }

  const removeIncomeCategory = async (categoryId: string) => {
    await db.transact([db.tx.incomeCategories[categoryId].delete()])
  }

  const updateExpenseCategory = async (categoryId: string, category: Partial<ExpenseCategory>) => {
    await db.transact([db.tx.expenseCategories[categoryId].update(category)])
  }

  const updateIncomeCategory = async (categoryId: string, category: Partial<IncomeCategory>) => {
    await db.transact([db.tx.incomeCategories[categoryId].update(category)])
  }

  return {
    ...query,
    addExpenseCategory,
    addIncomeCategory,
    removeExpenseCategory,
    removeIncomeCategory,
    updateExpenseCategory,
    updateIncomeCategory
  }
}

// Expense Hooks
export function useExpenseStore() {
  const query = db.useQuery({
    expenses: {}
  })

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    await db.transact([
      db.tx.expenses[id()].update({
        ...expense,
        createdAt: Date.now()
      })
    ])
  }

  const removeExpense = async (expenseId: string) => {
    await db.transact([db.tx.expenses[expenseId].delete()])
  }

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    await db.transact([db.tx.expenses[expenseId].update(updates)])
  }

  return {
    ...query,
    addExpense,
    removeExpense,
    updateExpense
  }
}

// Income Hooks
export function useIncomeStore() {
  const query = db.useQuery({
    incomes: {}
  })

  const addIncome = async (income: Omit<Income, 'id' | 'createdAt'>) => {
    await db.transact([
      db.tx.incomes[id()].update({
        ...income,
        createdAt: Date.now()
      })
    ])
  }

  const removeIncome = async (incomeId: string) => {
    await db.transact([db.tx.incomes[incomeId].delete()])
  }

  const updateIncome = async (incomeId: string, updates: Partial<Income>) => {
    await db.transact([db.tx.incomes[incomeId].update(updates)])
  }

  return {
    ...query,
    addIncome,
    removeIncome,
    updateIncome
  }
}
