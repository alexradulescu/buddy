import { DataGrid, renderTextEditor, type Column, type RenderEditCellProps } from 'react-data-grid'

import 'react-data-grid/lib/styles.css'
import '@/styles/spreadsheet.css'

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
  highlight?: (row: T) => boolean // adds the 'spreadsheet-duplicate-row' class
  height?: number | 'auto'
}

const ROW_HEIGHT = 30
const HEADER_HEIGHT = 30

const twoDecimals = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function DateEditor<T>({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
  const value = String(row[column.key as keyof T] ?? '')
  return (
    <input
      type="date"
      className="spreadsheet-editor"
      autoFocus
      value={value}
      onChange={(e) => e.target.value && onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true, false)}
    />
  )
}

function selectEditor<T>(options: { value: string; label: string }[]) {
  return function SelectEditor({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
    return (
      <select
        className="spreadsheet-editor"
        autoFocus
        value={String(row[column.key as keyof T] ?? '')}
        onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
        onBlur={() => onClose(true, false)}
      >
        <option value="" />
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
}

function toGridColumn<T>(col: SheetColumn<T>): Column<T> {
  const base = { key: col.key, name: col.title, width: col.width, resizable: true, renderEditCell: renderTextEditor }
  const valueOf = (row: T) => row[col.key] as unknown
  switch (col.type) {
    case 'date':
      return { ...base, width: col.width ?? 110, renderEditCell: DateEditor }
    case 'money':
    case 'number':
      return {
        ...base,
        width: col.width ?? 100,
        cellClass: (row) =>
          col.type === 'money' && Number(valueOf(row)) < 0 ? 'numeric-cell positive-money' : 'numeric-cell',
        renderCell: ({ row }) => (valueOf(row) === '' || valueOf(row) == null ? '' : twoDecimals(Number(valueOf(row))))
      }
    case 'checkbox':
      return {
        ...base,
        width: col.width ?? 80,
        cellClass: 'checkbox-cell',
        renderEditCell: null,
        renderCell: ({ row, onRowChange, tabIndex }) => (
          <input
            type="checkbox"
            tabIndex={tabIndex}
            checked={!!valueOf(row)}
            onChange={(e) => onRowChange({ ...row, [col.key]: e.target.checked })}
          />
        )
      }
    case 'select':
      return {
        ...base,
        width: col.width ?? 150,
        renderCell: ({ row }) => col.options?.find((o) => o.value === valueOf(row))?.label ?? '',
        renderEditCell: selectEditor<T>(col.options ?? [])
      }
    default:
      return base
  }
}

export function Sheet<T extends Row>({ rows, columns, onChange, onDelete, highlight, height = 400 }: Props<T>) {
  const gridColumns: Column<T>[] = columns.map(toGridColumn)
  if (onDelete)
    gridColumns.push({
      key: 'delete',
      name: '',
      width: 40,
      renderCell: ({ row }) => (
        <button className="spreadsheet-delete-button" onClick={() => onDelete(row)} aria-label="Delete row">
          🗑️
        </button>
      )
    })

  // The text editor writes strings; turn money/number columns back into numbers
  function normalize(row: T): T {
    const result: Record<string, unknown> = { ...row }
    for (const col of columns)
      if (col.type === 'money' || col.type === 'number') result[col.key] = Number(result[col.key]) || 0
    return result as T
  }

  function onRowsChange(newRows: T[], { indexes }: { indexes: number[] }) {
    for (const i of indexes) onChange(normalize(newRows[i]))
  }

  // Space toggles checkbox cells, like a spreadsheet
  function toggleCheckbox(row: T, key: string) {
    onChange({ ...row, [key]: !row[key as keyof T] })
  }

  const autoHeight = HEADER_HEIGHT + rows.length * ROW_HEIGHT + 2
  return (
    <DataGrid
      className="spreadsheet rdg-light"
      rows={rows}
      columns={gridColumns}
      rowKeyGetter={(row) => row.id}
      rowHeight={ROW_HEIGHT}
      headerRowHeight={HEADER_HEIGHT}
      onRowsChange={onRowsChange}
      rowClass={(row) => (highlight?.(row) ? 'spreadsheet-duplicate-row' : undefined)}
      style={{ blockSize: height === 'auto' ? autoHeight : height }}
      onCellKeyDown={(args, event) => {
        const col = columns.find((c) => c.key === args.column?.key)
        if (args.mode === 'ACTIVE' && args.row && col?.type === 'checkbox' && event.key === ' ') {
          event.preventGridDefault()
          event.preventDefault()
          toggleCheckbox(args.row, col.key)
        }
      }}
    />
  )
}
