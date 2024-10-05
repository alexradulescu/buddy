import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Expense {
  id: string
  date: string
  amount: number
  description: string
  category: string
}

interface ExpenseStore {
  expenses: Expense[]
  isHydrated: boolean
  addExpense: (expense: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
  setHydrated: () => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      isHydrated: false,
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: Date.now().toString() }]
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id)
        })),
      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'expense-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
