'use client'

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { HotTable, HotTableClass } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import { Stack, Text, Button, Card, Group, Modal } from '@mantine/core'
import { Plus, Save } from 'lucide-react'
import { ExpenseCategory, IncomeCategory } from '@/stores/instantdb'
import { notifications } from '@mantine/notifications'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'

// Register Handsontable modules
registerAllModules()

type EditableExpenseCategory = Partial<ExpenseCategory> & {
  id?: string
  isNew?: boolean
}

type EditableIncomeCategory = Partial<IncomeCategory> & {
  id?: string
  isNew?: boolean
}

interface CategorySpreadsheetProps {
  type: 'expense' | 'income'
  categories: ExpenseCategory[] | IncomeCategory[]
  onAdd: (category: Partial<ExpenseCategory | IncomeCategory>) => Promise<void>
  onUpdate: (id: string, category: Partial<ExpenseCategory | IncomeCategory>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const CategorySpreadsheet: React.FC<CategorySpreadsheetProps> = ({
  type,
  categories,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const hotRef = useRef<HotTableClass>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | undefined>()
  const [editableCategories, setEditableCategories] = useState<(EditableExpenseCategory | EditableIncomeCategory)[]>([])

  // Initialize editable categories from props
  useEffect(() => {
    setEditableCategories(
      categories.map((category) => ({
        ...category,
        isNew: false
      }))
    )
    setHasChanges(false)
  }, [categories])

  // Transform categories to Handsontable format
  const tableData = useMemo(() => {
    if (type === 'expense') {
      return (editableCategories as EditableExpenseCategory[]).map((category, index) => ({
        name: category.name || '',
        maxBudget: category.maxBudget ?? 0,
        maxAnnualBudget: category.maxAnnualBudget ?? 0,
        isArchived: category.isArchived || false,
        id: category.id || `new-${index}`,
        isNew: category.isNew || false,
        rowIndex: index
      }))
    } else {
      return (editableCategories as EditableIncomeCategory[]).map((category, index) => ({
        title: category.title || '',
        targetAmount: category.targetAmount ?? 0,
        isArchived: category.isArchived || false,
        id: category.id || `new-${index}`,
        isNew: category.isNew || false,
        rowIndex: index
      }))
    }
  }, [editableCategories, type])

  // Handle delete button click
  const handleDelete = useCallback((categoryId: string) => {
    if (categoryId.startsWith('new-')) {
      // Remove new unsaved row
      const index = parseInt(categoryId.replace('new-', ''))
      setEditableCategories(prev => prev.filter((_, i) => i !== index))
      setHasChanges(true)
    } else {
      setDeletingCategoryId(categoryId)
      setIsDeleteDialogOpen(true)
    }
  }, [])

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await onDelete(deletingCategoryId)
        setEditableCategories(prev => prev.filter((cat) => cat.id !== deletingCategoryId))
        notifications.show({
          title: 'Success',
          message: 'Category deleted successfully',
          color: 'green'
        })
      } catch (error) {
        console.error('Category delete error:', error)
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

  // Custom renderer for delete button
  const deleteButtonRenderer = useCallback(
    (
      instance: Handsontable,
      td: HTMLTableCellElement,
      row: number,
      col: number,
      prop: string | number,
      value: any,
      cellProperties: Handsontable.CellProperties
    ) => {
      td.innerHTML = ''
      td.style.padding = '0'
      td.style.textAlign = 'center'
      td.style.verticalAlign = 'middle'

      const button = document.createElement('button')
      button.innerHTML = '🗑️'
      button.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        padding: 2px;
        transition: background-color 0.2s;
      `

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#fee'
      })

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent'
      })

      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const categoryId = tableData[row]?.id
        if (categoryId) {
          handleDelete(categoryId)
        }
      })

      td.appendChild(button)
      return td
    },
    [tableData, handleDelete]
  )

  // Custom renderer for checkbox
  const checkboxRenderer = useCallback(
    (
      instance: Handsontable,
      td: HTMLTableCellElement,
      row: number,
      col: number,
      prop: string | number,
      value: any,
      cellProperties: Handsontable.CellProperties
    ) => {
      td.innerHTML = ''
      td.style.textAlign = 'center'
      td.style.verticalAlign = 'middle'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = !!value
      checkbox.style.cssText = `
        width: 16px;
        height: 16px;
        cursor: pointer;
      `

      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        instance.setDataAtRowProp(row, String(prop), target.checked)
      })

      td.appendChild(checkbox)
      return td
    },
    []
  )

  // Handle cell changes
  const handleAfterChange = useCallback(
    (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      if (!changes || source === 'loadData') return

      const updatedCategories = [...editableCategories]
      let changed = false

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue === newValue) return

        const category = updatedCategories[row]
        if (!category) return

        changed = true

        if (type === 'expense') {
          const expCat = category as EditableExpenseCategory
          switch (prop) {
            case 'name':
              expCat.name = String(newValue || '')
              break
            case 'maxBudget':
              expCat.maxBudget = Number(newValue) || 0
              break
            case 'maxAnnualBudget':
              expCat.maxAnnualBudget = Number(newValue) || 0
              break
            case 'isArchived':
              expCat.isArchived = !!newValue
              break
          }
        } else {
          const incCat = category as EditableIncomeCategory
          switch (prop) {
            case 'title':
              incCat.title = String(newValue || '')
              break
            case 'targetAmount':
              incCat.targetAmount = Number(newValue) || 0
              break
            case 'isArchived':
              incCat.isArchived = !!newValue
              break
          }
        }
      })

      if (changed) {
        setEditableCategories(updatedCategories)
        setHasChanges(true)
      }
    },
    [editableCategories, type]
  )

  // Add new row
  const handleAddRow = useCallback(() => {
    const newCategory = type === 'expense'
      ? { name: '', maxBudget: 0, maxAnnualBudget: 0, isArchived: false, isNew: true } as EditableExpenseCategory
      : { title: '', targetAmount: 0, isArchived: false, isNew: true } as EditableIncomeCategory

    setEditableCategories(prev => [...prev, newCategory])
    setHasChanges(true)
  }, [type])

  // Validate category
  const validateCategory = (category: EditableExpenseCategory | EditableIncomeCategory): boolean => {
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
    }
    return true
  }

  // Save all changes
  const handleSaveChanges = async () => {
    let hasError = false

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
        console.error('Category save error:', error)
        notifications.show({
          title: 'Error',
          message: `Failed to save category: ${error}`,
          color: 'red'
        })
        hasError = true
        break
      }
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

  // Column definitions for expense categories
  const expenseColumns: Handsontable.ColumnSettings[] = useMemo(
    () => [
      {
        data: 'name',
        title: 'Name',
        type: 'text',
        className: 'htMiddle htLeft'
      },
      {
        data: 'maxBudget',
        title: 'Monthly Budget',
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        },
        width: 120,
        className: 'htMiddle htRight'
      },
      {
        data: 'maxAnnualBudget',
        title: 'Annual Budget',
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        },
        width: 120,
        className: 'htMiddle htRight'
      },
      {
        data: 'isArchived',
        title: 'Archived',
        width: 80,
        className: 'htMiddle htCenter',
        renderer: checkboxRenderer
      },
      {
        data: 'id',
        title: 'Action',
        width: 60,
        readOnly: true,
        className: 'htMiddle htCenter',
        renderer: deleteButtonRenderer
      }
    ],
    [checkboxRenderer, deleteButtonRenderer]
  )

  // Column definitions for income categories
  const incomeColumns: Handsontable.ColumnSettings[] = useMemo(
    () => [
      {
        data: 'title',
        title: 'Title',
        type: 'text',
        className: 'htMiddle htLeft'
      },
      {
        data: 'targetAmount',
        title: 'Target Amount',
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        },
        width: 120,
        className: 'htMiddle htRight'
      },
      {
        data: 'isArchived',
        title: 'Archived',
        width: 80,
        className: 'htMiddle htCenter',
        renderer: checkboxRenderer
      },
      {
        data: 'id',
        title: 'Action',
        width: 60,
        readOnly: true,
        className: 'htMiddle htCenter',
        renderer: deleteButtonRenderer
      }
    ],
    [checkboxRenderer, deleteButtonRenderer]
  )

  const columns = type === 'expense' ? expenseColumns : incomeColumns

  return (
    <>
      <Card>
        <Group justify="space-between" mb="sm">
          <Text fw={600}>
            {type === 'expense' ? 'Expense Categories' : 'Income Categories'}
          </Text>
          <Group gap="xs">
            <Button variant="default" onClick={handleAddRow} leftSection={<Plus size={14} />}>
              Add Row
            </Button>
            <Button onClick={handleSaveChanges} disabled={!hasChanges} leftSection={<Save size={14} />}>
              Save Changes
            </Button>
          </Group>
        </Group>

        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {editableCategories.length} {editableCategories.length === 1 ? 'category' : 'categories'}
          </Text>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <HotTable
              ref={hotRef}
              data={tableData}
              columns={columns}
              colHeaders={true}
              rowHeaders={false}
              licenseKey="non-commercial-and-evaluation"
              height="auto"
              width="100%"
              stretchH="all"
              autoWrapRow={true}
              autoWrapCol={true}
              enterMoves={{ row: 1, col: 0 }}
              tabMoves={{ row: 0, col: 1 }}
              copyPaste={true}
              manualColumnResize={true}
              className="category-spreadsheet"
              afterChange={handleAfterChange}
              customBorders={false}
              outsideClickDeselects={false}
            />
          </div>
        </Stack>
      </Card>

      <Modal
        opened={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Category"
        centered
      >
        <Text size="sm">This action cannot be undone. This will permanently delete the category.</Text>
        <Group justify="flex-end" gap="xs" mt="sm">
          <Button variant="subtle" color="gray" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  )
}
