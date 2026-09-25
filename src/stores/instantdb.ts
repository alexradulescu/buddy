import { db, id, type AccountBalance, type Expense, type ExpenseCategory, type Income, type IncomeCategory } from '@/db'

export { db, id, schema } from '@/db'
export type { AccountBalance, Expense, ExpenseCategory, Income, IncomeCategory } from '@/db'

export const { useQuery, transact, tx } = db

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
