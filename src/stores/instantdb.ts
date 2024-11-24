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
  createdAt: number
}

export interface ExpenseCategory {
  id: string
  name: string
  maxBudget?: number
  maxAnnualBudget?: number
}

export interface Income {
  id: string
  date: string
  amount: number
  description: string
  category: string
  createdAt: number
}

export interface IncomeCategory {
  id: string
  title: string
  targetAmount?: number
}

export interface Schema {
  accountBalances: AccountBalance
  expenses: Expense
  expenseCategories: ExpenseCategory
  incomes: Income
  incomeCategories: IncomeCategory
}

export const db = init<Schema>({
  appId: '59a9af2c-e8d2-4acd-af98-062f1d426541'
})

export const { useQuery, transact, tx } = db
export { id } from '@instantdb/react'

// import { useQuery, transact, tx, id } from '@/lib/db'

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

  const addExpenseCategory = async (category: Omit<ExpenseCategory, 'id' | 'createdAt'>) => {
    await db.transact([
      db.tx.expenseCategories[id()].update({
        ...category,
        createdAt: Date.now()
      })
    ])
  }

  const addIncomeCategory = async (category: Omit<IncomeCategory, 'id' | 'createdAt'>) => {
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

  const updateExpenseCategory = async (categoryId: string, updates: Partial<ExpenseCategory>) => {
    await db.transact([db.tx.expenseCategories[categoryId].update(updates)])
  }

  const updateIncomeCategory = async (categoryId: string, updates: Partial<IncomeCategory>) => {
    await db.transact([db.tx.incomeCategories[categoryId].update(updates)])
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
