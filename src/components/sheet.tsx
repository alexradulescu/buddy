import { useMemo } from 'react'
import { HotTable } from '@handsontable/react'
import Handsontable from 'handsontable'
import { registerAllModules } from 'handsontable/registry'

import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'

registerAllModules()

type Row = { id: string }

export type SheetColumn<T> = {
  key: keyof T & string
  title: string
  type?: 'text' | 'date' | 'money' | 'number' | 'checkbox' | 'select'
  options?: { value: string; label: string }[] // for 'select': stores value, shows label
  width?: number
}

type Props<T extends Row> = {
  rows: T[]
  columns: SheetColumn<T>[]
  onChange: (row: T) => void
  onDelete?: (row: T) => void
  highlight?: (row: T) => boolean // adds the 'duplicate-row' class
  height?: number | 'auto'
}

// Numbers with 2 decimals; negatives (refunds) in green
function moneyRenderer(
  _hot: Handsontable,
  td: HTMLTableCellElement,
  _row: number,
  _col: number,
  _prop: unknown,
  value: unknown
) {
  const n = Number(value)
  const isNumber = value !== '' && value != null && !isNaN(n)
  td.textContent = isNumber
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value ?? '')
  td.style.color = isNumber && n < 0 ? 'var(--mantine-color-green-6)' : ''
  td.style.fontWeight = isNumber && n < 0 ? '500' : ''
  return td
}

function deleteRenderer(onDelete: (row: number) => void) {
  return (_hot: Handsontable, td: HTMLTableCellElement, row: number) => {
    const button = document.createElement('button')
    button.textContent = '🗑️'
    button.className = 'sheet-delete'
    button.onclick = (e) => {
      e.stopPropagation()
      onDelete(row)
    }
    td.replaceChildren(button)
    td.style.padding = '0'
    return td
  }
}

function toHotColumn<T>(col: SheetColumn<T>): Handsontable.ColumnSettings {
  const base = { data: col.key, title: col.title, width: col.width, className: 'htMiddle htLeft' }
  switch (col.type) {
    case 'date':
      return { ...base, type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: col.width ?? 72 }
    case 'money':
      return {
        ...base,
        type: 'numeric',
        className: 'htMiddle htRight',
        renderer: moneyRenderer,
        width: col.width ?? 80
      }
    case 'number':
      return { ...base, type: 'numeric', className: 'htMiddle htRight', numericFormat: { pattern: '0,0.00' } }
    case 'checkbox':
      return { ...base, type: 'checkbox', className: 'htMiddle htCenter', width: col.width ?? 80 }
    case 'select':
      return {
        ...base,
        type: 'dropdown',
        source: col.options?.map((o) => o.label) ?? [],
        filter: true,
        filteringCaseSensitive: false,
        allowInvalid: true,
        width: col.width ?? 150
      }
    default:
      return { ...base, type: 'text' }
  }
}

// Select columns show labels in the grid; translate back to values on edit
const toLabel = <T,>(col: SheetColumn<T>, v: unknown) => col.options?.find((o) => o.value === v)?.label ?? ''
const toValue = <T,>(col: SheetColumn<T>, v: unknown) => col.options?.find((o) => o.label === v)?.value ?? ''

export function Sheet<T extends Row>({ rows, columns, onChange, onDelete, highlight, height = 400 }: Props<T>) {
  const data = useMemo(
    () =>
      rows.map((row) => {
        const cells: Record<string, unknown> = { ...row }
        for (const col of columns) if (col.type === 'select') cells[col.key] = toLabel(col, row[col.key])
        return cells
      }),
    [rows, columns]
  )

  const hotColumns = [
    ...columns.map(toHotColumn),
    ...(onDelete
      ? [{ data: 'id', title: '', width: 36, readOnly: true, renderer: deleteRenderer((i) => onDelete(rows[i])) }]
      : [])
  ]

  function afterChange(changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) {
    if (!changes || source === 'loadData') return
    const edited = new Map<number, T>() // a paste can touch several cells of one row
    for (const [index, prop, oldValue, newValue] of changes) {
      const col = columns.find((c) => c.key === prop)
      if (!col || oldValue === newValue || !rows[index]) continue
      if (col.type === 'date' && !newValue) continue
      edited.set(index, { ...(edited.get(index) ?? rows[index]), [col.key]: parse(col, newValue) })
    }
    edited.forEach((row) => onChange(row))
  }

  function parse(col: SheetColumn<T>, v: unknown) {
    if (col.type === 'select') return toValue(col, v)
    if (col.type === 'money' || col.type === 'number') return Number(v) || 0
    if (col.type === 'checkbox') return !!v
    return String(v ?? '')
  }

  return (
    <HotTable
      data={data}
      columns={hotColumns}
      colHeaders
      licenseKey="non-commercial-and-evaluation"
      themeName="ht-theme-main"
      className="expense-spreadsheet"
      height={height}
      width="100%"
      stretchH="all"
      autoWrapRow
      autoWrapCol
      enterMoves={{ row: 1, col: 0 }}
      tabMoves={{ row: 0, col: 1 }}
      manualColumnResize
      search
      outsideClickDeselects={false}
      afterChange={afterChange}
      cells={(i) => (highlight && rows[i] && highlight(rows[i]) ? { className: 'duplicate-row' } : {})}
    />
  )
}
