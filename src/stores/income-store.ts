import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Income {
  id: string
  date: string
  amount: number
  description: string
  category: string
}

interface IncomeStore {
  incomes: Income[]
  isHydrated: boolean
  addIncome: (income: Omit<Income, 'id'>) => void
  removeIncome: (id: string) => void
  setIncomes: (incomes: Income[]) => void
  setHydrated: () => void
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set) => ({
      incomes: [],
      isHydrated: false,
      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: crypto.randomUUID() }]
        })),
      removeIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id)
        })),
      setIncomes: (incomes) => set({ incomes }),
      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'income-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
