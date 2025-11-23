'use client'

import React from 'react'
import { useCategoryStore } from '@/stores/instantdb'
import { CategoryManager } from '@/components/category-manager'
import { PageHeader } from '@/components/page-header'
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
    <>
      <PageHeader title="Settings" />
      <Stack gap="xl">
        <CategoryManager
          type="expense"
          categories={expenseCategories}
          onAdd={addExpenseCategory}
          onUpdate={updateExpenseCategory}
          onDelete={removeExpenseCategory}
        />
        <CategoryManager
          type="income"
          categories={incomeCategories}
          onAdd={addIncomeCategory}
          onUpdate={updateIncomeCategory}
          onDelete={removeIncomeCategory}
        />
        {/* <BackupRestore /> */}
      </Stack>
    </>
  )
}
