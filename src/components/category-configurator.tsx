'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ExpenseCategory, IncomeCategory, useCategoryStore } from '@/stores/category-store'

export const CategoryConfigurator: React.FC = () => {
  const { expenseCategories, incomeCategories, setExpenseCategories, setIncomeCategories, isHydrated } =
    useCategoryStore()
  const [expenseTextareaContent, setExpenseTextareaContent] = useState('')
  const [incomeTextareaContent, setIncomeTextareaContent] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (isHydrated) {
      // Convert expense categories to textarea content
      const expenseContent = expenseCategories
        .map((category) => `${category.name},${category.maxBudget || ''},${category.maxAnnualBudget || ''}`)
        .join('\n')
      setExpenseTextareaContent(expenseContent)

      // Convert income categories to textarea content
      const incomeContent = incomeCategories
        .map((category) => `${category.title},${category.targetAmount || ''}`)
        .join('\n')
      setIncomeTextareaContent(incomeContent)
    }
  }, [expenseCategories, incomeCategories, isHydrated])

  const handleSaveExpenses = () => {
    try {
      const newExpenseCategories: ExpenseCategory[] = expenseTextareaContent
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          const [name, maxBudget, maxAnnualBudget] = line.split(',')
          if (!name) {
            throw new Error(`Invalid format: ${line}`)
          }
          return {
            name: name.trim(),
            maxBudget: maxBudget ? parseFloat(maxBudget.trim()) : undefined,
            maxAnnualBudget: maxAnnualBudget ? parseFloat(maxAnnualBudget.trim()) : undefined
          }
        })

      // Check for unique names
      const names = new Set<string>()
      newExpenseCategories.forEach((category) => {
        if (names.has(category.name)) {
          throw new Error(`Duplicate expense category name: ${category.name}`)
        }
        names.add(category.name)
      })

      setExpenseCategories(newExpenseCategories)
      toast({
        title: 'Expense categories saved successfully',
        description: `Saved ${newExpenseCategories.length} expense categories.`
      })
    } catch (error) {
      toast({
        title: 'Error saving expense categories',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  const handleSaveIncomes = () => {
    try {
      const newIncomeCategories: IncomeCategory[] = incomeTextareaContent
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          const [title, targetAmount] = line.split(',')
          if (!title) {
            throw new Error(`Invalid format: ${line}`)
          }
          return {
            title: title.trim(),
            targetAmount: targetAmount ? parseFloat(targetAmount.trim()) : undefined
          }
        })

      // Check for unique titles
      const titles = new Set<string>()
      newIncomeCategories.forEach((category) => {
        if (titles.has(category.title)) {
          throw new Error(`Duplicate income category title: ${category.title}`)
        }
        titles.add(category.title)
      })

      setIncomeCategories(newIncomeCategories)
      toast({
        title: 'Income categories saved successfully',
        description: `Saved ${newIncomeCategories.length} income categories.`
      })
    } catch (error) {
      toast({
        title: 'Error saving income categories',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  if (!isHydrated) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Expense Categories</h2>
        <Textarea
          value={expenseTextareaContent}
          onChange={(e) => setExpenseTextareaContent(e.target.value)}
          placeholder="Enter expense categories (name,maxBudget,maxAnnualBudget)"
          rows={10}
          className="font-mono"
        />
        <Button onClick={handleSaveExpenses}>Save Expense Categories</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Income Categories</h2>
        <Textarea
          value={incomeTextareaContent}
          onChange={(e) => setIncomeTextareaContent(e.target.value)}
          placeholder="Enter income categories (title,targetAmount)"
          rows={10}
          className="font-mono"
        />
        <Button onClick={handleSaveIncomes}>Save Income Categories</Button>
      </div>
    </div>
  )
}
