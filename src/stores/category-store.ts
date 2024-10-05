import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Category {
  name: string
  maxBudget: number
}

interface CategoryStore {
  categories: Category[]
  isHydrated: boolean
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  removeCategory: (name: string) => void
  updateCategory: (name: string, updatedCategory: Category) => void
  setHydrated: () => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      isHydrated: false,
      setCategories: (categories) => set({ categories }),
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category]
        })),
      removeCategory: (name) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.name !== name)
        })),
      updateCategory: (name, updatedCategory) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.name === name ? updatedCategory : c))
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
