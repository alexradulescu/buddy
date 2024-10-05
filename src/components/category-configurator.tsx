'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Category, useCategoryStore } from '@/stores/category-store'

export const CategoryConfigurator: React.FC = () => {
  const { categories, setCategories, isHydrated } = useCategoryStore()
  const [textareaContent, setTextareaContent] = useState('')

  useEffect(() => {
    if (isHydrated) {
      // Convert categories to textarea content once hydrated
      const content = categories.map((category) => `${category.name},${category.maxBudget}`).join('\n')
      setTextareaContent(content)
    }
  }, [categories, isHydrated])

  const handleSave = () => {
    try {
      const newCategories: Category[] = textareaContent
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          const [name, maxBudget] = line.split(',')
          if (!name || !maxBudget) {
            throw new Error(`Invalid format: ${line}`)
          }
          return {
            name: name.trim(),
            maxBudget: parseFloat(maxBudget.trim())
          }
        })

      // Check for unique names
      const names = new Set<string>()
      newCategories.forEach((category) => {
        if (names.has(category.name)) {
          throw new Error(`Duplicate category name: ${category.name}`)
        }
        names.add(category.name)
      })

      setCategories(newCategories)
      toast({
        title: 'Categories saved successfully',
        description: `Saved ${newCategories.length} categories.`
      })
    } catch (error) {
      toast({
        title: 'Error saving categories',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
  }

  if (!isHydrated) {
    return <div>Loading...</div> // Or any loading indicator you prefer
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={textareaContent}
        onChange={(e) => setTextareaContent(e.target.value)}
        placeholder="Enter categories (name,maxBudget)"
        rows={10}
        className="font-mono"
      />
      <Button onClick={handleSave}>Save Categories</Button>
    </div>
  )
}
