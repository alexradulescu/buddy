'use client'

import React, { useEffect, useState } from 'react'
import { ExpenseCategory, IncomeCategory } from '@/stores/instantdb'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Button, Card, TextInput, NumberInput, Checkbox, Table, Modal } from '@mantine/core'
import { notifications } from '@mantine/notifications'

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
  const [editableCategories, setEditableCategories] = useState<EditableCategory[]>(
    categories.map((category) => ({
      ...category,
      isNew: false
    }))
  )
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | undefined>()
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setEditableCategories(categories.map((category) => ({ ...category, isNew: false })))
  }, [categories])

  const validateCategory = (category: EditableCategory): boolean => {
    if (type === 'expense') {
      const expenseCategory = category as EditableExpenseCategory
      if (!expenseCategory.name || expenseCategory.name.trim() === '') {
        notifications.show({
          title: 'Validation Error',
          message: 'Category name is required',
          color: 'red'
        })
        return false
      }
      if (expenseCategory.maxBudget !== undefined && expenseCategory?.maxBudget < 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Monthly budget must be positive',
          color: 'red'
        })
        return false
      }
      if (expenseCategory.maxAnnualBudget !== undefined && expenseCategory.maxAnnualBudget < 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Annual budget must be positive',
          color: 'red'
        })
        return false
      }
    } else {
      const incomeCategory = category as EditableIncomeCategory
      if (!incomeCategory.title || incomeCategory.title.trim() === '') {
        notifications.show({
          title: 'Validation Error',
          message: 'Category title is required',
          color: 'red'
        })
        return false
      }
      if (incomeCategory.targetAmount !== undefined && incomeCategory.targetAmount < 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Target amount must be positive',
          color: 'red'
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
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await onDelete(deletingCategoryId)
        setEditableCategories(editableCategories.filter((cat) => 'id' in cat && cat.id !== deletingCategoryId))
        notifications.show({
          title: 'Success',
          message: 'Category deleted successfully',
          color: 'green'
        })
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete category',
          color: 'red'
        })
      }
    }
    setIsDeleteDialogOpen(false)
    setDeletingCategoryId(undefined)
  }

  const handleSave = async (category: EditableCategory) => {
    if (isExpenseCategory(category) && !category.name) {
      notifications.show({
        title: 'Error',
        message: 'Name is required for expense categories',
        color: 'red'
      })
      return
    }

    if (isIncomeCategory(category) && !category.title) {
      notifications.show({
        title: 'Error',
        message: 'Title is required for income categories',
        color: 'red'
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
      notifications.show({
        title: 'Error',
        message: `Failed to save category: ${error}`,
        color: 'red'
      })
    }
  }

  const handleSaveChanges = async () => {
    let hasError = false

    for (const category of editableCategories) {
      if (!validateCategory(category)) {
        hasError = true
        break
      }

      await handleSave(category)
    }

    if (!hasError) {
      notifications.show({
        title: 'Success',
        message: 'All changes saved successfully',
        color: 'green'
      })
      setHasChanges(false)
    }
  }

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              {type === 'expense' ? 'Expense Categories' : 'Income Categories'}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" onClick={handleAddRow} leftSection={<Plus size={16} />}>
                Add Row
              </Button>
              <Button onClick={handleSaveChanges} disabled={!hasChanges} leftSection={<Save size={16} />}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card.Section>

        <Card.Section>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
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
                <Table.Th style={{ width: '100px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {editableCategories.map((category, index) => (
                <Table.Tr key={category.id || `new-${index}`}>
                  <Table.Td>
                    <TextInput
                      value={
                        type === 'expense'
                          ? (category as EditableExpenseCategory).name || ''
                          : (category as EditableIncomeCategory).title || ''
                      }
                      onChange={(e) => handleInputChange(index, type === 'expense' ? 'name' : 'title', e.target.value)}
                      placeholder={`Enter category ${type === 'expense' ? 'name' : 'title'}`}
                    />
                  </Table.Td>
                  {type === 'expense' ? (
                    <>
                      <Table.Td>
                        <NumberInput
                          value={(category as EditableExpenseCategory).maxBudget}
                          onChange={(value) => {
                            if (value !== '' && value !== undefined) {
                              handleInputChange(index, 'maxBudget', Number(value))
                            }
                          }}
                          placeholder="Monthly budget"
                          decimalScale={2}
                          min={0}
                        />
                      </Table.Td>
                      <Table.Td>
                        <NumberInput
                          value={(category as EditableExpenseCategory).maxAnnualBudget}
                          onChange={(value) => {
                            if (value !== '' && value !== undefined) {
                              handleInputChange(index, 'maxAnnualBudget', Number(value))
                            }
                          }}
                          placeholder="Annual budget"
                          decimalScale={2}
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
                          value={(category as EditableIncomeCategory).targetAmount}
                          onChange={(value) => {
                            if (value !== '' && value !== undefined) {
                              handleInputChange(index, 'targetAmount', Number(value))
                            }
                          }}
                          placeholder="Target amount"
                          decimalScale={2}
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
                        p={0}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card.Section>
      </Card>

      <Modal
        opened={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Are you absolutely sure?"
        centered
      >
        <p>This action cannot be undone. This will permanently delete the category.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
