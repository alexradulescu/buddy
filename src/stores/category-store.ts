import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface ExpenseCategory {
  name: string
  maxBudget?: number
  maxAnnualBudget?: number
}

export interface IncomeCategory {
  title: string
  targetAmount?: number
}

interface CategoryStore {
  expenseCategories: ExpenseCategory[]
  incomeCategories: IncomeCategory[]
  isHydrated: boolean
  setExpenseCategories: (categories: ExpenseCategory[]) => void
  setIncomeCategories: (categories: IncomeCategory[]) => void
  addExpenseCategory: (category: ExpenseCategory) => void
  addIncomeCategory: (category: IncomeCategory) => void
  removeExpenseCategory: (name: string) => void
  removeIncomeCategory: (title: string) => void
  updateExpenseCategory: (name: string, updatedCategory: ExpenseCategory) => void
  updateIncomeCategory: (title: string, updatedCategory: IncomeCategory) => void
  setHydrated: () => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      expenseCategories: [],
      incomeCategories: [],
      isHydrated: false,
      setExpenseCategories: (categories) => set({ expenseCategories: categories }),
      setIncomeCategories: (categories) => set({ incomeCategories: categories }),
      addExpenseCategory: (category) =>
        set((state) => ({
          expenseCategories: [...state.expenseCategories, category]
        })),
      addIncomeCategory: (category) =>
        set((state) => ({
          incomeCategories: [...state.incomeCategories, category]
        })),
      removeExpenseCategory: (name) =>
        set((state) => ({
          expenseCategories: state.expenseCategories.filter((c) => c.name !== name)
        })),
      removeIncomeCategory: (title) =>
        set((state) => ({
          incomeCategories: state.incomeCategories.filter((c) => c.title !== title)
        })),
      updateExpenseCategory: (name, updatedCategory) =>
        set((state) => ({
          expenseCategories: state.expenseCategories.map((c) => (c.name === name ? updatedCategory : c))
        })),
      updateIncomeCategory: (title, updatedCategory) =>
        set((state) => ({
          incomeCategories: state.incomeCategories.map((c) => (c.title === title ? updatedCategory : c))
        })),
      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'category-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
