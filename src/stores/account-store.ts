import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AccountBalance {
  id: string
  title: string
  amount: number
  year: number
  month: number
}

interface AccountStore {
  accountBalances: AccountBalance[]
  isHydrated: boolean
  addAccountBalance: (accountBalance: Omit<AccountBalance, 'id'>) => void
  updateAccountBalance: (id: string, updatedBalance: Partial<AccountBalance>) => void
  removeAccountBalance: (id: string) => void
  getAccountBalances: (year: number, month: number) => AccountBalance[]
  setAccountBalances: (accountBalances: AccountBalance[]) => void
  setHydrated: () => void
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accountBalances: [],
      isHydrated: false,
      addAccountBalance: (accountBalance) =>
        set((state) => ({
          accountBalances: [...state.accountBalances, { ...accountBalance, id: crypto.randomUUID() }]
        })),
      updateAccountBalance: (id, updatedBalance) =>
        set((state) => ({
          accountBalances: state.accountBalances.map((balance) =>
            balance.id === id ? { ...balance, ...updatedBalance } : balance
          )
        })),
      removeAccountBalance: (id) =>
        set((state) => ({
          accountBalances: state.accountBalances.filter((balance) => balance.id !== id)
        })),
      getAccountBalances: (year, month) => {
        const state = get()
        return state.accountBalances.filter((balance) => balance.year === year && balance.month === month)
      },
      setAccountBalances: (accountBalances) => set({ accountBalances }),
      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'account-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
