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
  setExpenses: (expenses: Expense[]) => void
  setHydrated: () => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      isHydrated: false,
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: crypto.randomUUID() }]
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id)
        })),
      setExpenses: (expenses) => set({ expenses }),
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
