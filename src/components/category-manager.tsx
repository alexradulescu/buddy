'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseCategory, IncomeCategory, Schema } from '@/stores/instantdb'
import { Plus, Save, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

type EditableExpenseCategory = Omit<ExpenseCategory, 'id' | 'createdAt'> & {
  id?: string
  isNew?: boolean
}

type EditableIncomeCategory = Omit<IncomeCategory, 'id' | 'createdAt'> & {
  id?: string
  isNew?: boolean
}

type EditableCategory = EditableExpenseCategory | EditableIncomeCategory

interface CategoryManagerProps {
  type: 'expense' | 'income'
  categories: ExpenseCategory[] | IncomeCategory[]
  onAdd: (category: Omit<ExpenseCategory, 'id' | 'createdAt'> | Omit<IncomeCategory, 'id' | 'createdAt'>) => Promise<void>
  onUpdate: (id: string, category: Partial<ExpenseCategory> | Partial<IncomeCategory>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ type, categories, onAdd, onUpdate, onDelete }) => {
  const { toast } = useToast()
  const [editableCategories, setEditableCategories] = useState<EditableCategory[]>(
    categories.map(category => ({
      ...category,
      isNew: false
    }))
  )
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | undefined>()
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setEditableCategories(categories.map(category => ({ ...category, isNew: false })))
  }, [categories])

  const validateCategory = (category: EditableCategory): boolean => {
    if (type === 'expense') {
      const expenseCategory = category as EditableExpenseCategory
      if (!expenseCategory.name || expenseCategory.name.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive'
        })
        return false
      }
      // Allow either monthly or annual budget to be set, but validate they are positive if set
      if (expenseCategory.maxBudget !== undefined && expenseCategory.maxBudget <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Monthly budget must be positive',
          variant: 'destructive'
        })
        return false
      }
      if (expenseCategory.maxAnnualBudget !== undefined && expenseCategory.maxAnnualBudget <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Annual budget must be positive',
          variant: 'destructive'
        })
        return false
      }
    } else {
      const incomeCategory = category as EditableIncomeCategory
      if (!incomeCategory.title || incomeCategory.title.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Category title is required',
          variant: 'destructive'
        })
        return false
      }
      if (incomeCategory.targetAmount !== undefined && incomeCategory.targetAmount <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Target amount must be positive',
          variant: 'destructive'
        })
        return false
      }
    }
    return true
  }

  const handleAddRow = () => {
    const newCategory = type === 'expense' 
      ? { name: '', isNew: true } as EditableExpenseCategory
      : { title: '', isNew: true } as EditableIncomeCategory
    
    setEditableCategories(prevCategories => {
      if (type === 'expense') {
        return [...prevCategories as EditableExpenseCategory[], newCategory]
      } else {
        return [...prevCategories as EditableIncomeCategory[], newCategory]
      }
    })
    setHasChanges(true)
  }

  const handleInputChange = (index: number, field: string, value: string | number) => {
    const updatedCategories = [...editableCategories]
    const updatedCategory = { ...updatedCategories[index], [field]: value }
    updatedCategories[index] = updatedCategory
    setEditableCategories(updatedCategories)
    setHasChanges(true)
  }

  const handleDelete = (categoryId: string) => {
    setDeletingCategoryId(categoryId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await onDelete(deletingCategoryId)
        setEditableCategories(editableCategories.filter(cat => 
          'id' in cat && cat.id !== deletingCategoryId
        ))
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive'
        })
      }
    }
    setIsDeleteDialogOpen(false)
    setDeletingCategoryId(undefined)
  }

  const handleSaveChanges = async () => {
    let hasError = false

    // Process each category
    for (const category of editableCategories) {
      if (!validateCategory(category)) {
        hasError = true
        break
      }

      try {
        if (category.isNew) {
          const { id, isNew, ...newCategory } = category
          await onAdd(newCategory)
        } else if (category.id) {
          const { id, isNew, ...updateData } = category
          await onUpdate(category.id, updateData)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to save category: ${type === 'expense' 
            ? (category as EditableExpenseCategory).name 
            : (category as EditableIncomeCategory).title}`,
          variant: 'destructive'
        })
        hasError = true
        break
      }
    }

    if (!hasError) {
      toast({
        title: 'Success',
        description: 'All changes saved successfully'
      })
      setHasChanges(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl font-bold">
          {type === 'expense' ? 'Expense Categories' : 'Income Categories'}
        </CardTitle>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleAddRow}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{type === 'expense' ? 'Name' : 'Title'}</TableHead>
              {type === 'expense' ? (
                <>
                  <TableHead>Monthly Budget</TableHead>
                  <TableHead>Annual Budget</TableHead>
                </>
              ) : (
                <TableHead>Target Amount</TableHead>
              )}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableCategories.map((category, index) => (
              <TableRow key={category.id || `new-${index}`}>
                <TableCell>
                  <Input
                    value={type === 'expense' 
                      ? (category as EditableExpenseCategory).name 
                      : (category as EditableIncomeCategory).title}
                    onChange={(e) => handleInputChange(index, 
                      type === 'expense' ? 'name' : 'title', 
                      e.target.value
                    )}
                    placeholder={`Enter category ${type === 'expense' ? 'name' : 'title'}`}
                  />
                </TableCell>
                {type === 'expense' ? (
                  <>
                    <TableCell>
                      <Input
                        type="number"
                        value={(category as EditableExpenseCategory).maxBudget || ''}
                        onChange={(e) => {
                            if (e.target.value) {handleInputChange(index, 'maxBudget', 
                                parseFloat(e.target.value)
                            )}}}
                        placeholder="Monthly budget"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={(category as EditableExpenseCategory).maxAnnualBudget || ''}
                        onChange={(e) => {
                            if (e.target.value) { 
                                handleInputChange(index, 'maxAnnualBudget', parseFloat(e.target.value))
                            }}}
                        placeholder="Annual budget"
                        step="0.01"
                      />
                    </TableCell>
                  </>
                ) : (
                  <TableCell>
                    <Input
                      type="number"
                      value={(category as EditableIncomeCategory).targetAmount || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                            handleInputChange(index, 'targetAmount', parseFloat(e.target.value))
                        }
                      }}
                      placeholder="Target amount"
                      step="0.01"
                    />
                  </TableCell>
                )}
                <TableCell>
                  {category.id && (
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(category.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}