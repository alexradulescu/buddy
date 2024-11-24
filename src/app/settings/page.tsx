'use client'

import React from 'react'
import { useCategoryStore } from '@/stores/instantdb'
import { CategoryManager } from '@/components/category-manager'
import { PageHeader } from '@/components/page-header'

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
      <div className="space-y-8">
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
      </div>
    </>
  )
}
