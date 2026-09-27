import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createFileRoute } from '@tanstack/react-router'
import { Calculator, Edit2, Plus, Trash2, Wallet } from 'lucide-react'

import { ConfirmDelete } from '@/components/confirm-delete'
import { CardTitle, MetricList, Money } from '@/components/ui'
import { db, remove, save, type AccountBalance } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { monthTotal, prevMonth, sum } from '@/lib/finance'
import { formatMoney } from '@/lib/format'

export const Route = createFileRoute('/accounts')({ component: AccountsPage })

type Draft = Pick<AccountBalance, 'title' | 'amount'> & { id?: string }

function AccountsPage() {
  const { year, month } = useMonth()
  const { data } = db.useQuery({ accountBalances: {}, expenses: {}, incomes: {} })
  const [editing, setEditing] = useState<Draft | null>(null)
  const [deleting, setDeleting] = useState<AccountBalance | null>(null)

  const balances = data?.accountBalances ?? []
  const prev = prevMonth(year, month)
  const current = balances.filter((b) => b.year === year && b.month === month)
  const previous = balances.filter((b) => b.year === prev.year && b.month === prev.month)

  // Last month's balances plus this month's cash flow should equal this month's balances
  const opening = sum(previous)
  const actual = sum(current)
  const expenses = monthTotal(data?.expenses ?? [], year, month)
  const income = monthTotal(data?.incomes ?? [], year, month)
  const expected = opening + income - expenses
  const difference = actual - expected

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Card shadow="sm" padding="md">
        <CardTitle icon={<Calculator size={16} />} title="Reconciliation" />
        <MetricList
          metrics={[
            { label: 'Opening balance', value: formatMoney(opening) },
            { sign: '+', label: 'Income', value: formatMoney(income) },
            { sign: '−', label: 'Expenses', value: formatMoney(expenses) },
            { sign: '=', label: 'Expected balance', value: formatMoney(expected), total: true },
            { label: 'Actual balance', value: formatMoney(actual) },
            {
              label: 'Difference',
              value: formatMoney(difference),
              color: difference < 0 ? 'var(--color-negative)' : undefined,
              total: true
            }
          ]}
        />
        <Text size="xs" c="dimmed" mt="xs">
          Opening balance is last month&apos;s account total. A non-zero difference means untracked income or spending.
        </Text>
      </Card>

      <Card shadow="sm" padding="md">
        <CardTitle
          icon={<Wallet size={16} />}
          title="Account balances"
          trailing={
            <Button
              size="xs"
              variant="default"
              leftSection={<Plus size={14} />}
              onClick={() => setEditing({ title: '', amount: 0 })}
            >
              Add
            </Button>
          }
        />
        {current.length === 0 ? (
          <Text ta="center" c="dimmed" py="md">
            No account balances for this month.
          </Text>
        ) : (
          <Box className="table-frame">
            <Table className="data-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Account</Table.Th>
                  <Table.Th ta="right">Balance</Table.Th>
                  <Table.Th ta="right" w={72}>
                    <span className="visually-hidden">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {current.map((balance) => (
                  <Table.Tr key={balance.id}>
                    <Table.Td className="data-table-primary">{balance.title}</Table.Td>
                    <Table.Td ta="right">
                      <Money value={balance.amount} />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap={2} wrap="nowrap" justify="flex-end" className="row-actions">
                        <ActionIcon size="sm" aria-label="Edit" onClick={() => setEditing(balance)}>
                          <Edit2 size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          c="var(--color-negative)"
                          aria-label="Delete"
                          onClick={() => setDeleting(balance)}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td>Total</Table.Td>
                  <Table.Td ta="right">
                    <Money value={actual} />
                  </Table.Td>
                  <Table.Td />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Box>
        )}
      </Card>

      <Modal
        opened={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit account balance' : 'Add account balance'}
        centered
      >
        {editing && (
          <AccountForm
            draft={editing}
            onSave={(draft) => {
              save('accountBalances', { ...draft, year, month })
              notifications.show({ title: 'Account balance saved', message: draft.title, color: 'green' })
              setEditing(null)
            }}
          />
        )}
      </Modal>

      <ConfirmDelete
        title="Delete account balance"
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
          label="Account"
          placeholder="e.g. Checking"
          required
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        <NumberInput
          label="Balance"
          placeholder="0.00"
          decimalScale={2}
          value={values.amount}
          onChange={(v) => setValues({ ...values, amount: Number(v) || 0 })}
        />
        <Button type="submit">{draft.id ? 'Update balance' : 'Add balance'}</Button>
      </Stack>
    </form>
  )
}
