import { useState } from 'react'
import {
  Button,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Search, Trash } from 'lucide-react'
import { useQueryState } from 'nuqs'

import { ConfirmDelete } from '@/components/confirm-delete'
import { EntryModal, type Entry, type Option } from '@/components/entry-modal'
import { Sheet, type SheetColumn } from '@/components/sheet'
import { remove, save } from '@/db'
import { inMonth } from '@/lib/finance'
import { formatMoney } from '@/lib/format'

// Expenses and incomes share the same shape
type Entity = 'expenses' | 'incomes'
export type Draft = Entry & { id: string }

export const draftColumns = (categories: Option[]): SheetColumn<Draft>[] => [
  { key: 'date', title: 'Date', type: 'date' },
  { key: 'description', title: 'Description' },
  { key: 'categoryId', title: 'Category', type: 'select', options: categories },
  { key: 'amount', title: 'Amount', type: 'money' }
]

// Today if we're looking at the current month, otherwise mid-month
export function newDraft(year: number, month: number): Draft {
  const today = dayjs()
  const date = today.year() === year && today.month() === month ? today : dayjs(new Date(year, month, 15))
  return { id: crypto.randomUUID(), date: date.format('YYYY-MM-DD'), description: '', categoryId: '', amount: 0 }
}

// Saves all drafts, or none if any is invalid. Returns true when saved.
export function saveDrafts(entity: Entity, drafts: Draft[], year: number, month: number) {
  const errors = drafts.flatMap((d, i) => {
    if (!Number(d.amount)) return [`Row ${i + 1}: invalid amount`]
    if (!inMonth(d, year, month)) return [`Row ${i + 1}: not in the selected month`]
    return []
  })
  if (errors.length) {
    notifications.show({ title: 'Nothing saved, please fix these rows', message: errors.join('\n'), color: 'red' })
    return false
  }
  drafts.forEach(({ id: _id, ...row }) => save(entity, row))
  notifications.show({ title: 'Saved', message: `Added ${drafts.length} ${entity}`, color: 'green' })
  return true
}

// Manual entry: editable draft rows + "add N rows" + save
export function DraftEntry({
  entity,
  categories,
  drafts,
  setDrafts,
  year,
  month
}: {
  entity: Entity
  categories: Option[]
  drafts: Draft[]
  setDrafts: (drafts: Draft[]) => void
  year: number
  month: number
}) {
  const [count, setCount] = useState(1)

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {drafts.length} {drafts.length === 1 ? 'item' : 'items'}
      </Text>
      <Sheet
        rows={drafts}
        columns={draftColumns(categories)}
        onChange={(row) => setDrafts(drafts.map((d) => (d.id === row.id ? row : d)))}
        onDelete={(row) => setDrafts(drafts.filter((d) => d.id !== row.id))}
      />
      <Group gap="xs">
        <NumberInput value={count} onChange={(v) => setCount(Number(v) || 1)} min={1} w={60} />
        <Button onClick={() => setDrafts([...drafts, ...Array.from({ length: count }, () => newDraft(year, month))])}>
          Add Rows
        </Button>
      </Group>
      <Button fullWidth onClick={() => saveDrafts(entity, drafts, year, month) && setDrafts([])}>
        Save {entity === 'expenses' ? 'Expenses' : 'Incomes'}
      </Button>
    </Stack>
  )
}

type SortKey = 'date' | 'description' | 'category' | 'amount'

// Saved entries of the month: search, category filter (in URL), sort, edit, delete
export function TransactionList({ entity, rows, categories }: { entity: Entity; rows: Entry[]; categories: Option[] }) {
  const noun = entity === 'expenses' ? 'expense' : 'income'
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useQueryState(noun === 'expense' ? 'categoryExpense' : 'categoryIncome')
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'date', asc: true })
  const [editing, setEditing] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)

  const categoryName = (id: string) => categories.find((c) => c.value === id)?.label ?? ''
  const term = search.toLowerCase()
  const visible = rows
    .map((r) => ({ ...r, category: categoryName(r.categoryId) }))
    .filter((r) => !categoryFilter || r.categoryId === categoryFilter)
    .filter((r) => `${r.description} ${r.category} ${r.amount}`.toLowerCase().includes(term))
    .sort((a, b) => {
      const cmp = sort.key === 'amount' ? a.amount - b.amount : String(a[sort.key]).localeCompare(String(b[sort.key]))
      return sort.asc ? cmp : -cmp
    })

  const header = (key: SortKey, label: string) => {
    const Icon = sort.key !== key ? ArrowUpDown : sort.asc ? ArrowUp : ArrowDown
    return (
      <UnstyledButton onClick={() => setSort({ key, asc: sort.key === key ? !sort.asc : true })}>
        <Group gap={4} wrap="nowrap" justify={key === 'amount' ? 'flex-end' : 'flex-start'}>
          <Text fw={700} size="sm">
            {label}
          </Text>
          <Icon size={14} opacity={sort.key === key ? 1 : 0.4} />
        </Group>
      </UnstyledButton>
    )
  }

  return (
    <Stack gap="sm">
      <TextInput
        placeholder={`Search ${entity}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftSection={<Search size={14} />}
      />
      <Group gap="xs">
        <Text size="xs" c="dimmed">
          Filter:
        </Text>
        <Select
          flex={1}
          value={categoryFilter ?? 'all'}
          onChange={(v) => setCategoryFilter(v === 'all' ? null : v)}
          data={[{ value: 'all', label: 'All categories' }, ...categories]}
        />
      </Group>

      {visible.length === 0 ? (
        <Text ta="center" c="dimmed" py="md" size="sm">
          No {entity} found for this period.
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            {visible.length} {visible.length === 1 ? 'item' : 'items'}
          </Text>
          <ScrollArea mah={500}>
            <Table miw={450} stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={80}>{header('date', 'Date')}</Table.Th>
                  <Table.Th>{header('description', 'Description')}</Table.Th>
                  <Table.Th>{header('category', 'Category')}</Table.Th>
                  <Table.Th w={70}>{header('amount', 'Amount')}</Table.Th>
                  <Table.Th w={60}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visible.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{dayjs(row.date).format('DD MMM YYYY')}</Table.Td>
                    <Table.Td>{row.description}</Table.Td>
                    <Table.Td c="dimmed">{row.category}</Table.Td>
                    <Table.Td ta="right" className="numeric-value" c={row.amount < 0 ? 'green.6' : undefined}>
                      {formatMoney(row.amount)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setEditing(row)}>
                          <Edit size={12} />
                        </Button>
                        <Button size="compact-xs" variant="subtle" color="red" onClick={() => setDeleting(row)}>
                          <Trash size={12} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </>
      )}

      <EntryModal
        title={`Edit ${noun}`}
        entry={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={(entry) => {
          save(entity, entry)
          setEditing(null)
          notifications.show({ title: `${noun} updated`, message: entry.description, color: 'green' })
        }}
      />
      <ConfirmDelete
        title={`Delete ${noun}`}
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting?.id && remove(entity, deleting.id)}
        details={
          deleting
            ? {
                Date: dayjs(deleting.date).format('DD MMM YYYY'),
                Description: deleting.description,
                Amount: formatMoney(deleting.amount),
                Category: categoryName(deleting.categoryId) || 'Uncategorized'
              }
            : undefined
        }
      />
    </Stack>
  )
}
