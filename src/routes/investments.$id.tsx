import { useState } from 'react'
import { Button, Card, Center, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BarChart3, DollarSign, Edit, PiggyBank, Trash2 } from 'lucide-react'

import { ConfirmDelete } from '@/components/confirm-delete'
import { EntriesCard, InvestmentModal, PerformanceChart } from '@/components/investment'
import { CardTitle, colorBySign, MetricList } from '@/components/ui'
import { db, remove, save } from '@/db'
import { investmentStats } from '@/lib/finance'
import { formatMoney, formatPercent } from '@/lib/format'

export const Route = createFileRoute('/investments/$id')({ component: InvestmentDetailPage })

function InvestmentDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data } = db.useQuery({
    investments: { $: { where: { id } } },
    investmentContributions: { $: { where: { investmentId: id } } },
    investmentValues: { $: { where: { investmentId: id } } }
  })
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!data) return null
  const investment = data.investments[0]
  if (!investment) return <NotFound />

  const contributions = data.investmentContributions
  const values = data.investmentValues
  const { invested, value, profit, returnRate } = investmentStats(investment, contributions, values)
  const profitColor = colorBySign(profit)

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button variant="subtle" color="gray" component={Link} to="/investments" leftSection={<ArrowLeft size={14} />}>
          Back to Investments
        </Button>
        <Group gap="xs">
          <Button variant="default" onClick={() => setEditing(true)} leftSection={<Edit size={14} />}>
            Edit
          </Button>
          <Button color="red" onClick={() => setDeleting(true)} leftSection={<Trash2 size={14} />}>
            Delete
          </Button>
        </Group>
      </Group>

      <Stack gap={2}>
        <Title order={3}>{investment.name}</Title>
        <Text c="dimmed" size="sm">
          {investment.description || 'No description provided'}
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        <Card>
          <CardTitle icon={<DollarSign size={16} />} title="Overview" />
          <MetricList
            metrics={[
              { label: 'Total Contributions', value: formatMoney(invested) },
              { label: 'Current Value', value: formatMoney(value) },
              { label: 'Profit/Loss', value: formatMoney(profit), color: profitColor },
              { label: 'Return', value: value === null ? 'N/A' : formatPercent(returnRate, 2), color: profitColor }
            ]}
          />
        </Card>
        <PerformanceChart contributions={contributions} values={values} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        <EntriesCard
          title="Contributions"
          icon={<PiggyBank size={16} />}
          amountLabel="Amount"
          emptyText="No contributions yet"
          rows={contributions}
          onSave={(row) => save('investmentContributions', { ...row, investmentId: id })}
          onDelete={(rowId) => remove('investmentContributions', rowId)}
        />
        <EntriesCard
          title="Values"
          icon={<BarChart3 size={16} />}
          amountLabel="Value"
          emptyText="No values recorded yet"
          rows={values.map((v) => ({ ...v, amount: v.value }))}
          onSave={({ amount, ...row }) => save('investmentValues', { ...row, value: amount, investmentId: id })}
          onDelete={(rowId) => remove('investmentValues', rowId)}
        />
      </SimpleGrid>

      <InvestmentModal investment={editing ? investment : null} onClose={() => setEditing(false)} />
      <ConfirmDelete
        title="Delete Investment"
        opened={deleting}
        details={{ Investment: investment.name }}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          remove('investments', id)
          navigate({ to: '/investments' })
        }}
      />
    </Stack>
  )
}

function NotFound() {
  return (
    <Center mih="16rem">
      <Stack align="center" gap="md">
        <Title order={2} size="h3">
          Investment not found
        </Title>
        <Text c="dimmed">The investment you're looking for doesn't exist.</Text>
        <Button component={Link} to="/investments" leftSection={<ArrowLeft size={14} />}>
          Back to Investments
        </Button>
      </Stack>
    </Center>
  )
}
