import { id, init } from '@instantdb/react'

export interface AccountBalance {
  id: string
  title: string
  amount: number
  year: number
  month: number
  createdAt: number
}

export interface Expense {
  id: string
  date: string
  amount: number
  description: string
  category: string
  categoryId: string
  createdAt: number
}

export interface ExpenseCategory {
  id: string
  name: string
  maxBudget?: number
  maxAnnualBudget?: number
  isArchived?: boolean
}

export interface Income {
  id: string
  date: string
  amount: number
  description: string
  category: string
  categoryId: string
  createdAt: number
}

export interface IncomeCategory {
  id: string
  title: string
  targetAmount?: number
  isArchived?: boolean
}

export interface Schema {
  accountBalances: AccountBalance
  expenses: Expense
  expenseCategories: ExpenseCategory
  incomes: Income
  incomeCategories: IncomeCategory
}

console.info(process.env.NEXT_PUBLIC_INSTANTDB_APP_ID)
export const db = init<Schema>({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || ''
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
        ...category,
        createdAt: Date.now()
      })
    ])
  }

  const addIncomeCategory = async (category: Partial<IncomeCategory>) => {
    await db.transact([
      db.tx.incomeCategories[id()].update({
        ...category,
        createdAt: Date.now()
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
