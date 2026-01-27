import React from 'react'
import { useCategoryStore } from '@/stores/instantdb'
import { CategorySpreadsheet } from '@/components/category-spreadsheet'
import { Stack } from '@mantine/core'

export default function SettingsPage() {
  const {
    data: { expenseCategories = [], incomeCategories = [] } = {},
    addExpenseCategory,
    addIncomeCategory,
    updateExpenseCategory,
    updateIncomeCategory,
    removeExpenseCategory,
    removeIncomeCategory
  } = useCategoryStore()

  return (
    <Stack gap="md">
      <CategorySpreadsheet
        type="expense"
        categories={expenseCategories}
        onAdd={addExpenseCategory}
        onUpdate={updateExpenseCategory}
        onDelete={removeExpenseCategory}
      />
      <CategorySpreadsheet
        type="income"
        categories={incomeCategories}
        onAdd={addIncomeCategory}
        onUpdate={updateIncomeCategory}
        onDelete={removeIncomeCategory}
      />
    </Stack>
  )
}
