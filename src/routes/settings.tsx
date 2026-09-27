import { useState, type ReactNode } from 'react'
import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createFileRoute } from '@tanstack/react-router'
import { Coins, Plus, Receipt, Save } from 'lucide-react'

import { ConfirmDelete } from '@/components/confirm-delete'
import { Sheet, type SheetColumn } from '@/components/sheet'
import { CardTitle } from '@/components/ui'
import { db, remove, save, type ExpenseCategory, type IncomeCategory } from '@/db'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

const expenseColumns: SheetColumn<ExpenseCategory>[] = [
  { key: 'name', title: 'Name' },
  { key: 'maxBudget', title: 'Monthly budget', type: 'number', width: 120 },
  { key: 'maxAnnualBudget', title: 'Annual budget', type: 'number', width: 120 },
  { key: 'isArchived', title: 'Archived', type: 'checkbox' }
]

const incomeColumns: SheetColumn<IncomeCategory>[] = [
  { key: 'title', title: 'Title' },
  { key: 'targetAmount', title: 'Target amount', type: 'number', width: 120 },
  { key: 'isArchived', title: 'Archived', type: 'checkbox' }
]

function SettingsPage() {
  const { data } = db.useQuery({ expenseCategories: {}, incomeCategories: {} })

  return (
    <Stack gap="lg">
      <CategoryEditor
        title="Expense categories"
        icon={<Receipt size={16} />}
        entity="expenseCategories"
        saved={data?.expenseCategories ?? []}
        columns={expenseColumns}
        nameKey="name"
        blank={{ name: '', maxBudget: 0, maxAnnualBudget: 0, isArchived: false }}
      />
      <CategoryEditor
        title="Income categories"
        icon={<Coins size={16} />}
        entity="incomeCategories"
        saved={data?.incomeCategories ?? []}
        columns={incomeColumns}
        nameKey="title"
        blank={{ title: '', targetAmount: 0, isArchived: false }}
      />
    </Stack>
  )
}

type Props<T> = {
  title: string
  icon: ReactNode
  entity: 'expenseCategories' | 'incomeCategories'
  saved: T[]
  columns: SheetColumn<T>[]
  nameKey: keyof T
  blank: Omit<T, 'id'>
}

// Edits are kept locally until "Save changes"; new rows get a temporary 'new-' id
function CategoryEditor<T extends { id: string }>({ title, icon, entity, saved, columns, nameKey, blank }: Props<T>) {
  const [edits, setEdits] = useState<T[] | null>(null) // null = no unsaved changes
  const [deleting, setDeleting] = useState<T | null>(null)
  const rows = edits ?? saved
  const isNew = (row: T) => row.id.startsWith('new-')

  function saveAll() {
    if (rows.some((r) => !String(r[nameKey] ?? '').trim())) {
      notifications.show({ title: 'Validation error', message: 'Category name is required', color: 'red' })
      return
    }
    rows.forEach((row) => save(entity, (isNew(row) ? { ...row, id: undefined } : row) as never))
    setEdits(null)
    notifications.show({ title: 'Changes saved', message: title, color: 'green' })
  }

  function deleteRow(row: T) {
    if (isNew(row)) setEdits(rows.filter((r) => r.id !== row.id))
    else setDeleting(row)
  }

  return (
    <Card>
      <CardTitle
        icon={icon}
        title={title}
        trailing={
          <Text className="card-title-note">
            {rows.length} {rows.length === 1 ? 'category' : 'categories'}
            {edits && ' · unsaved changes'}
          </Text>
        }
      />
      <Sheet
        rows={rows}
        columns={columns}
        height="auto"
        onChange={(row) => setEdits(rows.map((r) => (r.id === row.id ? row : r)))}
        onDelete={deleteRow}
      />
      <Group justify="flex-end" gap="xs" mt="sm">
        <Button
          variant="default"
          leftSection={<Plus size={14} />}
          onClick={() => setEdits([...rows, { ...blank, id: `new-${crypto.randomUUID()}` } as T])}
        >
          Add row
        </Button>
        <Button leftSection={<Save size={14} />} disabled={!edits} onClick={saveAll}>
          Save changes
        </Button>
      </Group>
      <ConfirmDelete
        title="Delete category"
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          remove(entity, deleting.id)
          if (edits) setEdits(edits.filter((r) => r.id !== deleting.id))
          notifications.show({ title: 'Category deleted', message: title, color: 'green' })
        }}
      />
    </Card>
  )
}
