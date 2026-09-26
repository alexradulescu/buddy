import { useState } from 'react'
import { Button, Card, Group, Modal, NumberInput, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createFileRoute } from '@tanstack/react-router'
import { Calculator, Edit2, Trash2, Wallet } from 'lucide-react'

import { ConfirmDelete } from '@/components/confirm-delete'
import { CardTitle, colorBySign, MetricList } from '@/components/ui'
import { remove, save, useTables, type AccountBalance } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { monthTotal, prevMonth, sum } from '@/lib/finance'
import { formatMoney } from '@/lib/format'

export const Route = createFileRoute('/accounts')({ component: AccountsPage })

type Draft = Pick<AccountBalance, 'title' | 'amount'> & { id?: string }

function AccountsPage() {
  const { year, month } = useMonth()
  const { data } = useTables('accountBalances', 'expenses', 'incomes')
  const [editing, setEditing] = useState<Draft | null>(null)
  const [deleting, setDeleting] = useState<AccountBalance | null>(null)

  const balances = data?.accountBalances ?? []
  const prev = prevMonth(year, month)
  const current = balances.filter((b) => b.year === year && b.month === month)
  const previous = balances.filter((b) => b.year === prev.year && b.month === prev.month)

  // Last month's balances plus this month's cash flow should equal this month's balances
  const real = sum(current)
  const expenses = monthTotal(data?.expenses ?? [], year, month)
  const income = monthTotal(data?.incomes ?? [], year, month)
  const expected = sum(previous) + income - expenses
  const discrepancy = real - expected

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Card shadow="sm" padding="md">
        <CardTitle icon={<Calculator size={16} />} title="Summary" />
        <MetricList
          metrics={[
            { label: 'Total Account Balances', value: formatMoney(real) },
            { label: 'Total Expenses', value: formatMoney(expenses) },
            { label: 'Total Income', value: formatMoney(income) },
            { label: 'Expected Accounts Total', value: formatMoney(expected) },
            { label: 'Real Accounts Total', value: formatMoney(real) },
            { label: 'Discrepancy', value: formatMoney(discrepancy), color: colorBySign(discrepancy) }
          ]}
        />
      </Card>

      <Card shadow="sm" padding="md">
        <Group justify="space-between">
          <CardTitle icon={<Wallet size={16} />} title="Account Balances" />
          <Button size="xs" onClick={() => setEditing({ title: '', amount: 0 })}>
            Add
          </Button>
        </Group>
        {current.length === 0 ? (
          <Text ta="center" c="dimmed" py="md">
            No account balances for this month.
          </Text>
        ) : (
          <Stack gap="xs" mt="sm">
            {current.map((balance) => (
              <Group key={balance.id} justify="space-between" wrap="nowrap">
                <Text size="sm" fw={500}>
                  {balance.title}
                </Text>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={600} className="tabular-number">
                    {formatMoney(balance.amount)}
                  </Text>
                  <Button size="compact-xs" variant="subtle" onClick={() => setEditing(balance)}>
                    <Edit2 size={12} />
                  </Button>
                  <Button size="compact-xs" variant="subtle" color="red" onClick={() => setDeleting(balance)}>
                    <Trash2 size={12} />
                  </Button>
                </Group>
              </Group>
            ))}
          </Stack>
        )}
      </Card>

      <Modal
        opened={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Account Balance' : 'Add New Account Balance'}
        centered
      >
        {editing && (
          <AccountForm
            draft={editing}
            onSave={async (draft) => {
              if (!(await save('accountBalances', { ...draft, year, month }))) return
              notifications.show({ title: 'Account balance saved', message: draft.title, color: 'green' })
              setEditing(null)
            }}
          />
        )}
      </Modal>

      <ConfirmDelete
        title="Delete Account Balance"
        opened={!!deleting}
        details={deleting ? { Account: deleting.title, Amount: formatMoney(deleting.amount) } : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove('accountBalances', deleting.id)}
      />
    </SimpleGrid>
  )
}

function AccountForm({ draft, onSave }: { draft: Draft; onSave: (draft: Draft) => void }) {
  const [values, setValues] = useState(draft)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(values)
      }}
    >
      <Stack gap="md">
        <TextInput
          placeholder="Account Title"
          required
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        <NumberInput
          placeholder="Balance Amount"
          decimalScale={2}
          value={values.amount}
          onChange={(v) => setValues({ ...values, amount: Number(v) || 0 })}
        />
        <Button type="submit">{draft.id ? 'Update Balance' : 'Add Balance'}</Button>
      </Stack>
    </form>
  )
}
