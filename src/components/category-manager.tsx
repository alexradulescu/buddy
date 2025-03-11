'use client'

import React, { useEffect, useState } from 'react'
import { ExpenseCategory, IncomeCategory } from '@/stores/instantdb'
import { IconPlus, IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import {
  Modal,
  Button,
  Card,
  Text,
  Group,
  Table,
  TextInput,
  NumberInput,
  Checkbox
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useToast } from '@/hooks/use-toast'

type EditableExpenseCategory = Partial<ExpenseCategory> & {
  id?: string
  isNew?: boolean
}

type EditableIncomeCategory = Partial<IncomeCategory> & {
  id?: string
  isNew?: boolean
}

type EditableCategory = EditableExpenseCategory | EditableIncomeCategory

interface CategoryManagerProps {
  type: 'expense' | 'income'
  categories: ExpenseCategory[] | IncomeCategory[]
  onAdd: (category: Partial<ExpenseCategory | IncomeCategory>) => Promise<void>
  onUpdate: (id: string, category: Partial<ExpenseCategory | IncomeCategory>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ type, categories, onAdd, onUpdate, onDelete }) => {
  const { toast } = useToast()
  const [editableCategories, setEditableCategories] = useState<EditableCategory[]>(
    categories.map((category) => ({
      ...category,
      isNew: false
    }))
  )
  const [opened, { open, close }] = useDisclosure(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | undefined>()
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setEditableCategories(categories.map((category) => ({ ...category, isNew: false })))
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
      if (expenseCategory.maxBudget !== undefined && expenseCategory?.maxBudget < 0) {
        toast({
          title: 'Validation Error',
          description: 'Monthly budget must be positive',
          variant: 'destructive'
        })
        return false
      }
      if (expenseCategory.maxAnnualBudget !== undefined && expenseCategory.maxAnnualBudget < 0) {
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
      if (incomeCategory.targetAmount !== undefined && incomeCategory.targetAmount < 0) {
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

  const isExpenseCategory = (category: EditableCategory): category is EditableExpenseCategory => {
    return type === 'expense'
  }

  const isIncomeCategory = (category: EditableCategory): category is EditableIncomeCategory => {
    return type === 'income'
  }

  const handleAddRow = () => {
    const newCategory =
      type === 'expense'
        ? ({ name: '', isNew: true } as EditableExpenseCategory)
        : ({ title: '', isNew: true } as EditableIncomeCategory)

    setEditableCategories((prevCategories) => {
      if (type === 'expense') {
        return [...(prevCategories as EditableExpenseCategory[]), newCategory]
      } else {
        return [...(prevCategories as EditableIncomeCategory[]), newCategory]
      }
    })
    setHasChanges(true)
  }

  const handleInputChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedCategories = [...editableCategories]
    const updatedCategory = { ...updatedCategories[index], [field]: value }
    updatedCategories[index] = updatedCategory
    setEditableCategories(updatedCategories)
    setHasChanges(true)
  }

  const handleDelete = (categoryId: string) => {
    setDeletingCategoryId(categoryId)
    open()
  }

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await onDelete(deletingCategoryId)
        setEditableCategories(editableCategories.filter((cat) => 'id' in cat && cat.id !== deletingCategoryId))
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
    close()
    setDeletingCategoryId(undefined)
  }

  const handleSave = async (category: EditableCategory) => {
    if (isExpenseCategory(category) && !category.name) {
      toast({
        title: 'Error',
        description: 'Name is required for expense categories',
        variant: 'destructive'
      })
      return
    }

    if (isIncomeCategory(category) && !category.title) {
      toast({
        title: 'Error',
        description: 'Title is required for income categories',
        variant: 'destructive'
      })
      return
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
        description: `Failed to save category: ${error}`,
        variant: 'destructive'
      })
    }
  }

  const handleSaveChanges = async () => {
    let hasError = false

    // Process each category
    for (const category of editableCategories) {
      if (!validateCategory(category)) {
        hasError = true
        break
      }

      await handleSave(category)
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
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="xl">
          {type === 'expense' ? 'Expense Categories' : 'Income Categories'}
        </Text>
        <Group>
          <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={handleAddRow}>
            Add Row
          </Button>
          <Button 
            leftSection={<IconDeviceFloppy size={16} />} 
            onClick={handleSaveChanges} 
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Group>
      </Group>
      
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{type === 'expense' ? 'Name' : 'Title'}</Table.Th>
            {type === 'expense' ? (
              <>
                <Table.Th>Monthly Budget</Table.Th>
                <Table.Th>Annual Budget</Table.Th>
              </>
            ) : (
              <Table.Th>Target Amount</Table.Th>
            )}
            <Table.Th>Archived</Table.Th>
            <Table.Th style={{ width: 100 }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {editableCategories.map((category, index) => (
            <Table.Tr key={category.id || `new-${index}`}>
              <Table.Td>
                <TextInput
                  value={
                    type === 'expense'
                      ? (category as EditableExpenseCategory).name
                      : (category as EditableIncomeCategory).title
                  }
                  onChange={(e) => handleInputChange(index, type === 'expense' ? 'name' : 'title', e.target.value)}
                  placeholder={`Enter category ${type === 'expense' ? 'name' : 'title'}`}
                />
              </Table.Td>
              {type === 'expense' ? (
                <>
                  <Table.Td>
                    <NumberInput
                      value={(category as EditableExpenseCategory).maxBudget || undefined}
                      onChange={(value) => {
                        if (value !== '') {
                          handleInputChange(index, 'maxBudget', value)
                        }
                      }}
                      placeholder="Monthly budget"
                      step={0.01}
                      min={0}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={(category as EditableExpenseCategory).maxAnnualBudget || undefined}
                      onChange={(value) => {
                        if (value !== '') {
                          handleInputChange(index, 'maxAnnualBudget', value)
                        }
                      }}
                      placeholder="Annual budget"
                      step={0.01}
                      min={0}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Checkbox
                      checked={(category as EditableExpenseCategory).isArchived || false}
                      onChange={(event) => {
                        handleInputChange(index, 'isArchived', event.currentTarget.checked)
                      }}
                    />
                  </Table.Td>
                </>
              ) : (
                <>
                  <Table.Td>
                    <NumberInput
                      value={(category as EditableIncomeCategory).targetAmount || undefined}
                      onChange={(value) => {
                        if (value !== '') {
                          handleInputChange(index, 'targetAmount', value)
                        }
                      }}
                      placeholder="Target amount"
                      step={0.01}
                      min={0}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Checkbox
                      checked={(category as EditableIncomeCategory).isArchived || false}
                      onChange={(event) => {
                        handleInputChange(index, 'isArchived', event.currentTarget.checked)
                      }}
                    />
                  </Table.Td>
                </>
              )}
              <Table.Td>
                {category.id && (
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(category.id!)}
                  >
                    <IconTrash size={16} />
                  </Button>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text mb="lg">Are you absolutely sure? This action cannot be undone. This will permanently delete the category.</Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </Card>
  )
}
