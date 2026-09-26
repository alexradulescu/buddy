import { useState, type ReactNode } from 'react'
import {
  Button,
  Card,
  Center,
  Group,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'
import { Edit, Trash2, TrendingUp } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ConfirmDelete } from '@/components/confirm-delete'
import { CardTitle, Money } from '@/components/ui'
import { save, type Investment, type InvestmentContribution, type InvestmentValue } from '@/db'
import { performanceSeries } from '@/lib/finance'
import { formatMoney } from '@/lib/format'

type InvestmentDraft = Pick<Investment, 'name' | 'description' | 'isActive'> & { id?: string }

// Add (investment = {}) or edit an investment; null = closed
export function InvestmentModal({ investment, onClose }: { investment: InvestmentDraft | null; onClose: () => void }) {
  return (
    <Modal
      opened={!!investment}
      onClose={onClose}
      title={investment?.id ? 'Edit Investment' : 'Add Investment'}
      centered
    >
      {investment && <InvestmentForm investment={investment} onClose={onClose} />}
    </Modal>
  )
}

function InvestmentForm({ investment, onClose }: { investment: InvestmentDraft; onClose: () => void }) {
  const [values, setValues] = useState(investment)
  const set = (patch: Partial<InvestmentDraft>) => setValues({ ...values, ...patch })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save('investments', investment.id ? values : { ...values, createdDate: new Date().toISOString() })
        onClose()
      }}
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="Investment name"
          required
          value={values.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <Textarea
          label="Description (optional)"
          placeholder="Investment description"
          value={values.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
        <Switch
          label="Active"
          description="Mark this investment as active or inactive"
          labelPosition="left"
          checked={values.isActive}
          onChange={(e) => set({ isActive: e.currentTarget.checked })}
        />
        <Group justify="flex-end" gap="xs" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{investment.id ? 'Update' : 'Create'}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export function PerformanceChart({
  contributions,
  values
}: {
  contributions: InvestmentContribution[]
  values: InvestmentValue[]
}) {
  const data = performanceSeries(contributions, values)

  return (
    <Card>
      <CardTitle icon={<TrendingUp size={16} />} title="Performance" />
      {data.length === 0 ? (
        <Stack align="center" justify="center" mih="8rem">
          <Text c="dimmed" size="sm">
            Add contributions and values to see performance data
          </Text>
        </Stack>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(142, 142, 147, 0.2)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#8e8e93' }}
              width={52}
              axisLine={false}
              tickLine={false}
              orientation="right"
            />
            <Tooltip
              formatter={(v) => formatMoney(Number(v))}
              contentStyle={{
                background: 'var(--material-bar)',
                backdropFilter: 'var(--material-blur)',
                border: 'none',
                borderRadius: 10,
                boxShadow: 'var(--shadow-popover)',
                fontSize: 12
              }}
              labelStyle={{ color: 'var(--color-text-secondary)' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="contributions"
              name="Contributions"
              stroke="#8e8e93"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#007aff"
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// Contributions and values share this shape (values map `value` to `amount`)
type Dated = { id?: string; date: string; amount: number; description?: string }

type EntriesProps = {
  title: string
  icon: ReactNode
  amountLabel: string
  emptyText: string
  rows: Dated[]
  onSave: (row: Dated) => void
  onDelete: (id: string) => void
}

export function EntriesCard({ title, icon, amountLabel, emptyText, rows, onSave, onDelete }: EntriesProps) {
  const [editing, setEditing] = useState<Dated | null>(null)
  const [deleting, setDeleting] = useState<Dated | null>(null)
  const newest = [...rows].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <Group justify="space-between" align="center" mb="xs">
        <CardTitle icon={icon} title={title} />
        <Button
          size="xs"
          onClick={() => setEditing({ date: dayjs().format('YYYY-MM-DD'), amount: 0, description: '' })}
        >
          Add
        </Button>
      </Group>

      {newest.length === 0 ? (
        <Center py="sm">
          <Text c="dimmed" size="sm">
            {emptyText}
          </Text>
        </Center>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th ta="right">{amountLabel}</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th ta="right" w={60}>
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {newest.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{dayjs(row.date).format('M/D/YYYY')}</Table.Td>
                <Table.Td ta="right">
                  <Money value={row.amount} />
                </Table.Td>
                <Table.Td c="dimmed">{row.description || '-'}</Table.Td>
                <Table.Td ta="right">
                  <Group gap={4} wrap="nowrap" justify="flex-end">
                    <Button variant="subtle" size="compact-xs" color="gray" onClick={() => setEditing(row)}>
                      <Edit size={12} />
                    </Button>
                    <Button variant="subtle" size="compact-xs" color="red" onClick={() => setDeleting(row)}>
                      <Trash2 size={12} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={!!editing}
        onClose={() => setEditing(null)}
        title={`${editing?.id ? 'Edit' : 'Add'} ${amountLabel}`}
        centered
      >
        {editing && (
          <DatedForm
            row={editing}
            amountLabel={amountLabel}
            onCancel={() => setEditing(null)}
            onSave={(row) => {
              onSave(row)
              setEditing(null)
            }}
          />
        )}
      </Modal>

      <ConfirmDelete
        title={`Delete ${amountLabel}`}
        opened={!!deleting}
        details={deleting ? { Date: deleting.date, [amountLabel]: formatMoney(deleting.amount) } : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting?.id && onDelete(deleting.id)}
      />
    </Card>
  )
}

type DatedFormProps = { row: Dated; amountLabel: string; onSave: (row: Dated) => void; onCancel: () => void }

function DatedForm({ row, amountLabel, onSave, onCancel }: DatedFormProps) {
  const [values, setValues] = useState(row)
  const set = (patch: Partial<Dated>) => setValues({ ...values, ...patch })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(values)
      }}
    >
      <Stack gap="md">
        <NumberInput
          label={amountLabel}
          placeholder="0.00"
          decimalScale={2}
          fixedDecimalScale
          min={0.01}
          required
          value={values.amount}
          onChange={(v) => set({ amount: Number(v) || 0 })}
        />
        <DatePickerInput
          label="Date"
          valueFormat="YYYY-MM-DD"
          required
          value={values.date}
          onChange={(d) => d && set({ date: dayjs(d).format('YYYY-MM-DD') })}
        />
        <Textarea
          label="Description (optional)"
          value={values.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
        />
        <Group justify="space-between" mt="xs">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{row.id ? 'Update' : 'Add'}</Button>
        </Group>
      </Stack>
    </form>
  )
}
