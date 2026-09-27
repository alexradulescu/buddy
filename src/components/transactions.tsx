import { useState } from 'react'
import { ActionIcon, Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import { Edit, Search, Trash } from 'lucide-react'
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
          Add rows
        </Button>
      </Group>
      <Button fullWidth onClick={() => saveDrafts(entity, drafts, year, month) && setDrafts([])}>
        Save {entity}
      </Button>
    </Stack>
  )
}

type Sort = 'newest' | 'oldest' | 'highest' | 'lowest'

const sortOptions: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' }
]

type Row = Entry & { category: string }

// Wallet-style sections: one per day when sorted by date, a single unlabelled one when sorted by amount
function groupRows(rows: Row[], byDay: boolean) {
  if (!byDay) return [{ key: 'all', label: null, total: 0, rows }]
  const groups: { key: string; label: string | null; total: number; rows: Row[] }[] = []
  for (const row of rows) {
    const last = groups.at(-1)
    if (last?.key === row.date) {
      last.rows.push(row)
      last.total += row.amount
    } else {
      groups.push({ key: row.date, label: dayjs(row.date).format('ddd D MMM'), total: row.amount, rows: [row] })
    }
  }
  return groups
}

// Saved entries of the month: search, category filter (in URL), sort, edit, delete
export function TransactionList({ entity, rows, categories }: { entity: Entity; rows: Entry[]; categories: Option[] }) {
  const noun = entity === 'expenses' ? 'expense' : 'income'
  const Noun = entity === 'expenses' ? 'Expense' : 'Income'
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useQueryState(noun === 'expense' ? 'categoryExpense' : 'categoryIncome')
  const [sort, setSort] = useState<Sort>('newest')
  const [editing, setEditing] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)

  const categoryName = (id: string) => categories.find((c) => c.value === id)?.label ?? ''
  const term = search.toLowerCase()
  const visible: Row[] = rows
    .map((r) => ({ ...r, category: categoryName(r.categoryId) }))
    .filter((r) => !categoryFilter || r.categoryId === categoryFilter)
    .filter((r) => `${r.description} ${r.category} ${r.amount}`.toLowerCase().includes(term))
    .sort((a, b) => {
      if (sort === 'highest') return b.amount - a.amount
      if (sort === 'lowest') return a.amount - b.amount
      const cmp = a.date.localeCompare(b.date)
      return sort === 'oldest' ? cmp : -cmp
    })
  const total = visible.reduce((sum, r) => sum + r.amount, 0)
  const byDay = sort === 'newest' || sort === 'oldest'
  const groups = groupRows(visible, byDay)

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="baseline" gap="xs">
        <Text fw={600} size="lg">
          {visible.length} {visible.length === 1 ? noun : entity}
        </Text>
        <Text fw={600} size="lg" className="tabular">
          {formatMoney(total)}
        </Text>
      </Group>
      <Group gap="xs" wrap="wrap">
        <TextInput
          flex="2 1 180px"
          placeholder={`Search ${entity}`}
          aria-label={`Search ${entity}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftSection={<Search size={14} />}
        />
        <Select
          flex="1 1 150px"
          aria-label="Category"
          value={categoryFilter ?? 'all'}
          onChange={(v) => setCategoryFilter(v === 'all' ? null : v)}
          data={[{ value: 'all', label: 'All categories' }, ...categories]}
        />
        <Select
          flex="1 1 140px"
          aria-label="Sort"
          value={sort}
          onChange={(v) => v && setSort(v as Sort)}
          data={sortOptions}
          allowDeselect={false}
        />
      </Group>

      {visible.length === 0 ? (
        <Text ta="center" c="dimmed" py="md" size="sm">
          No {entity} found for this period.
        </Text>
      ) : (
        <div className="tx-list">
          {groups.map((group) => (
            <section key={group.key} className="tx-day">
              {group.label && (
                <header className="tx-day-header">
                  <span>{group.label}</span>
                  <span className="tabular">{formatMoney(group.total)}</span>
                </header>
              )}
              {group.rows.map((row) => (
                <div
                  key={row.id}
                  className="tx-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => setEditing(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setEditing(row)
                    }
                  }}
                >
                  <div className="tx-row-main">
                    <div className="tx-row-title">{row.description || 'Untitled'}</div>
                    <div className="tx-row-subtitle">
                      {!byDay && `${dayjs(row.date).format('D MMM')} · `}
                      {row.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="tx-row-amount" data-positive={row.amount < 0 || undefined}>
                    {formatMoney(row.amount)}
                  </div>
                  <Group gap={2} wrap="nowrap" className="row-actions" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon size="sm" aria-label="Edit" className="tx-row-edit" onClick={() => setEditing(row)}>
                      <Edit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      c="var(--color-negative)"
                      aria-label="Delete"
                      onClick={() => setDeleting(row)}
                    >
                      <Trash size={14} />
                    </ActionIcon>
                  </Group>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      <EntryModal
        title={`Edit ${noun}`}
        entry={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={(entry) => {
          save(entity, entry)
          setEditing(null)
          notifications.show({ title: `${Noun} updated`, message: entry.description, color: 'green' })
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
