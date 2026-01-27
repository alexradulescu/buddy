import React, { useCallback, useMemo } from 'react'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import { Stack, Text } from '@mantine/core'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'

// Register Handsontable modules
registerAllModules()

interface Income {
  id?: string
  amount: number | string
  categoryId: string
  category: string
  date: Date | string
  description: string
}

interface IncomeCategory {
  id: string
  title: string
  isArchived: boolean
}

interface IncomeSpreadsheetProps {
  incomes: Income[]
  incomeCategories: IncomeCategory[]
  onInputChange: (index: number, field: string, value: string | Date | null) => void
  onDeleteRow: (index: number) => void
}

export const IncomeSpreadsheet: React.FC<IncomeSpreadsheetProps> = ({
  incomes,
  incomeCategories,
  onInputChange,
  onDeleteRow
}) => {
  // Create category lookup maps
  const categoryIdToTitle = useMemo(() => {
    const map = new Map<string, string>()
    incomeCategories.forEach((cat) => {
      if (!cat.isArchived) {
        map.set(cat.id, cat.title)
      }
    })
    return map
  }, [incomeCategories])

  const categoryTitleToId = useMemo(() => {
    const map = new Map<string, string>()
    incomeCategories.forEach((cat) => {
      if (!cat.isArchived) {
        map.set(cat.title, cat.id)
      }
    })
    return map
  }, [incomeCategories])

  // Get active category titles for dropdown
  const categoryTitles = useMemo(() => {
    return incomeCategories.filter((cat) => !cat.isArchived).map((cat) => cat.title)
  }, [incomeCategories])

  // Transform incomes to Handsontable format
  const tableData = useMemo(() => {
    return incomes.map((income, index) => ({
      date: income.date instanceof Date ? income.date.toISOString().split('T')[0] : income.date,
      description: income.description,
      category: categoryIdToTitle.get(income.categoryId) || '',
      amount: income.amount,
      rowIndex: index
    }))
  }, [incomes, categoryIdToTitle])

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
      td.style.textAlign = 'left'
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
        font-size: 14px;
        padding: 2px;
        transition: background-color 0.2s;
        text-align: left;
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
        onDeleteRow(row)
      })

      td.appendChild(button)
      return td
    },
    [onDeleteRow]
  )

  // Handle cell changes
  const handleAfterChange = useCallback(
    (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      if (!changes || source === 'loadData') return

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue === newValue) return

        switch (prop) {
          case 'date':
            if (newValue) {
              const dateObj = typeof newValue === 'string' ? new Date(newValue) : newValue
              onInputChange(row, 'date', dateObj)
            }
            break

          case 'description':
            onInputChange(row, 'description', String(newValue || ''))
            break

          case 'amount':
            onInputChange(row, 'amount', String(newValue || ''))
            break

          case 'category':
            // Convert category title back to ID
            const categoryId = categoryTitleToId.get(String(newValue)) || ''
            onInputChange(row, 'categoryId', categoryId)
            break
        }
      })
    },
    [onInputChange, categoryTitleToId]
  )

  // Column definitions
  const columns: Handsontable.ColumnSettings[] = useMemo(
    () => [
      {
        data: 'date',
        title: 'Date',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 72,
        className: 'htMiddle htLeft'
      },
      {
        data: 'description',
        title: 'Description',
        type: 'text',
        className: 'htMiddle htLeft',
        renderer: 'text'
      },
      {
        data: 'category',
        title: 'Category',
        type: 'dropdown',
        source: categoryTitles,
        width: 150,
        className: 'htMiddle htLeft',
        filter: true,
        filteringCaseSensitive: false,
        allowInvalid: true
      },
      {
        data: 'amount',
        title: 'Amount',
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        },
        width: 80,
        className: 'htMiddle htRight'
      },
      {
        data: 'rowIndex',
        title: 'Action',
        width: 36,
        readOnly: true,
        className: 'htMiddle htLeft',
        renderer: deleteButtonRenderer
      }
    ],
    [categoryTitles, deleteButtonRenderer]
  )

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {incomes.length} {incomes.length === 1 ? 'item' : 'items'}
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
