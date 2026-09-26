import { useState } from 'react'
import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Save } from 'lucide-react'

import { ConfirmDelete } from '@/components/confirm-delete'
import { Sheet, type SheetColumn } from '@/components/sheet'
import { db, remove, save, type ExpenseCategory, type IncomeCategory } from '@/db'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

const expenseColumns: SheetColumn<ExpenseCategory>[] = [
  { key: 'name', title: 'Name' },
  { key: 'maxBudget', title: 'Monthly Budget', type: 'number', width: 120 },
  { key: 'maxAnnualBudget', title: 'Annual Budget', type: 'number', width: 120 },
  { key: 'isArchived', title: 'Archived', type: 'checkbox' }
]

const incomeColumns: SheetColumn<IncomeCategory>[] = [
  { key: 'title', title: 'Title' },
  { key: 'targetAmount', title: 'Target Amount', type: 'number', width: 120 },
  { key: 'isArchived', title: 'Archived', type: 'checkbox' }
]

function SettingsPage() {
  const { data } = db.useQuery({ expenseCategories: {}, incomeCategories: {} })

  return (
    <Stack gap="md">
      <CategoryEditor
        title="Expense Categories"
        entity="expenseCategories"
        saved={data?.expenseCategories ?? []}
        columns={expenseColumns}
        nameKey="name"
        blank={{ name: '', maxBudget: 0, maxAnnualBudget: 0, isArchived: false }}
      />
      <CategoryEditor
        title="Income Categories"
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
  entity: 'expenseCategories' | 'incomeCategories'
  saved: T[]
  columns: SheetColumn<T>[]
  nameKey: keyof T
  blank: Omit<T, 'id'>
}

// Edits are kept locally until "Save Changes"; new rows get a temporary 'new-' id
function CategoryEditor<T extends { id: string }>({ title, entity, saved, columns, nameKey, blank }: Props<T>) {
  const [edits, setEdits] = useState<T[] | null>(null) // null = no unsaved changes
  const [deleting, setDeleting] = useState<T | null>(null)
  const rows = edits ?? saved
  const isNew = (row: T) => row.id.startsWith('new-')

  function saveAll() {
    if (rows.some((r) => !String(r[nameKey] ?? '').trim())) {
      notifications.show({ title: 'Validation Error', message: 'Category name is required', color: 'red' })
      return
    }
    rows.forEach((row) => save(entity, (isNew(row) ? { ...row, id: undefined } : row) as never))
    setEdits(null)
    notifications.show({ title: 'Success', message: 'All changes saved successfully', color: 'green' })
  }

  function deleteRow(row: T) {
    if (isNew(row)) setEdits(rows.filter((r) => r.id !== row.id))
    else setDeleting(row)
  }

  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Text fw={600}>{title}</Text>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<Plus size={14} />}
            onClick={() => setEdits([...rows, { ...blank, id: `new-${crypto.randomUUID()}` } as T])}
          >
            Add Row
          </Button>
          <Button leftSection={<Save size={14} />} disabled={!edits} onClick={saveAll}>
            Save Changes
          </Button>
        </Group>
      </Group>
      <Text size="xs" c="dimmed" mb="xs">
        {rows.length} {rows.length === 1 ? 'category' : 'categories'}
      </Text>
      <Sheet
        rows={rows}
        columns={columns}
        height="auto"
        onChange={(row) => setEdits(rows.map((r) => (r.id === row.id ? row : r)))}
        onDelete={deleteRow}
      />
      <ConfirmDelete
        title="Delete Category"
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          remove(entity, deleting.id)
          if (edits) setEdits(edits.filter((r) => r.id !== deleting.id))
          notifications.show({ title: 'Success', message: 'Category deleted successfully', color: 'green' })
        }}
      />
    </Card>
  )
}
