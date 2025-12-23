'use client'

import React, { useCallback, useMemo } from 'react'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import { Stack, Text, Button } from '@mantine/core'
import { TrashIcon } from 'lucide-react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'

// Register Handsontable modules
registerAllModules()

interface ExpenseSpreadsheetProps {
  expenses: Expense[]
  expenseCategories: ExpenseCategory[]
  onInputChange: (
    index: number,
    field: 'amount' | 'categoryId' | 'date' | 'description',
    value: string | number | Date
  ) => void
  onDeleteRow: (id: string) => void
}

export const ExpenseSpreadsheet: React.FC<ExpenseSpreadsheetProps> = ({
  expenses,
  expenseCategories,
  onInputChange,
  onDeleteRow
}) => {

  // Create category lookup maps
  const categoryIdToName = useMemo(() => {
    const map = new Map<string, string>()
    expenseCategories.forEach((cat) => {
      if (!cat.isArchived) {
        map.set(cat.id, cat.name)
      }
    })
    return map
  }, [expenseCategories])

  const categoryNameToId = useMemo(() => {
    const map = new Map<string, string>()
    expenseCategories.forEach((cat) => {
      if (!cat.isArchived) {
        map.set(cat.name, cat.id)
      }
    })
    return map
  }, [expenseCategories])

  // Get active category names for dropdown
  const categoryNames = useMemo(() => {
    return expenseCategories.filter((cat) => !cat.isArchived).map((cat) => cat.name)
  }, [expenseCategories])

  // Transform expenses to Handsontable format
  const tableData = useMemo(() => {
    return expenses.map((expense, index) => ({
      rowNumber: index + 1,
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      category: categoryIdToName.get(expense.categoryId) || '',
      id: expense.id
    }))
  }, [expenses, categoryIdToName])

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
      // Clear existing content
      td.innerHTML = ''
      td.style.padding = '0'
      td.style.textAlign = 'center'
      td.style.verticalAlign = 'middle'

      // Create delete button
      const button = document.createElement('button')
      button.innerHTML = '🗑️'
      button.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        padding: 8px;
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
        const expenseId = expenses[row]?.id
        if (expenseId) {
          onDeleteRow(expenseId)
        }
      })

      td.appendChild(button)
      return td
    },
    [expenses, onDeleteRow]
  )

  // Handle cell changes
  const handleAfterChange = useCallback(
    (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      if (!changes || source === 'loadData') return

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue === newValue) return

        const expense = expenses[row]
        if (!expense) return

        switch (prop) {
          case 'date':
            if (newValue) {
              // Convert date to ISO string
              const dateObj = typeof newValue === 'string' ? new Date(newValue) : newValue
              onInputChange(row, 'date', dateObj)
            }
            break

          case 'description':
            onInputChange(row, 'description', String(newValue || ''))
            break

          case 'amount':
            const amount = Number(newValue)
            if (!isNaN(amount)) {
              onInputChange(row, 'amount', amount)
            }
            break

          case 'category':
            // Convert category name back to ID
            const categoryId = categoryNameToId.get(String(newValue)) || ''
            onInputChange(row, 'categoryId', categoryId)
            break
        }
      })
    },
    [expenses, onInputChange, categoryNameToId]
  )

  // Column definitions
  const columns: Handsontable.ColumnSettings[] = useMemo(
    () => [
      {
        data: 'rowNumber',
        title: '#',
        width: 50,
        readOnly: true,
        className: 'htCenter htMiddle',
        renderer: (instance, td, row, col, prop, value, cellProperties) => {
          td.textContent = String(value)
          td.style.color = '#868e96'
          td.style.fontWeight = '500'
          return td
        }
      },
      {
        data: 'date',
        title: 'Date',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 120,
        className: 'htMiddle'
      },
      {
        data: 'description',
        title: 'Description',
        type: 'text',
        className: 'htMiddle',
        renderer: 'text'
      },
      {
        data: 'amount',
        title: 'Amount',
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        },
        width: 100,
        className: 'htMiddle htRight'
      },
      {
        data: 'category',
        title: 'Category',
        type: 'dropdown',
        source: categoryNames,
        width: 150,
        className: 'htMiddle',
        filter: true,
        filteringCaseSensitive: false,
        allowInvalid: true
      },
      {
        data: 'id',
        title: 'Action',
        width: 60,
        readOnly: true,
        renderer: deleteButtonRenderer
      }
    ],
    [categoryNames, deleteButtonRenderer]
  )

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
      </Text>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <HotTable
          data={tableData}
          columns={columns}
          colHeaders={true}
          rowHeaders={false}
          licenseKey="non-commercial-and-evaluation"
          height={400}
          width="100%"
          stretchH="all"
          autoWrapRow={true}
          autoWrapCol={true}
          enterMoves={{ row: 1, col: 0 }} // Enter moves down
          tabMoves={{ row: 0, col: 1 }} // Tab moves right
          copyPaste={true} // Enable copy/paste
          search={true} // Enable search
          manualColumnResize={true}
          className="expense-spreadsheet"
          afterChange={handleAfterChange}
          // Styling
          customBorders={false}
          outsideClickDeselects={false}
        />
      </div>
    </Stack>
  )
}
