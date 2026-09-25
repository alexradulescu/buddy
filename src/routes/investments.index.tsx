import { useState } from 'react'
import { ActionIcon, Badge, Button, Card, Center, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { InvestmentModal } from '@/components/investment'
import { PageHeader } from '@/components/shell'
import { colorBySign, Stat } from '@/components/ui'
import { db } from '@/db'
import { investmentStats } from '@/lib/finance'
import { formatMoney, formatPercent } from '@/lib/format'

export const Route = createFileRoute('/investments/')({ component: InvestmentsPage })

const blank = { name: '', description: '', isActive: true }

function InvestmentsPage() {
  const { data } = db.useQuery({ investments: {}, investmentContributions: {}, investmentValues: {} })
  const [adding, setAdding] = useState(false)

  const investments = data?.investments ?? []
  const stats = investments.map((i) =>
    investmentStats(i, data?.investmentContributions ?? [], data?.investmentValues ?? [])
  )

  return (
    <Stack gap="md">
      <PageHeader
        actions={
          <>
            <Button onClick={() => setAdding(true)} leftSection={<Plus size={16} />} visibleFrom="sm">
              Add Investment
            </Button>
            <ActionIcon
              onClick={() => setAdding(true)}
              variant="filled"
              hiddenFrom="sm"
              size="lg"
              aria-label="Add Investment"
            >
              <Plus size={18} />
            </ActionIcon>
          </>
        }
      />

      {investments.length === 0 ? (
        <Card p="lg">
          <Center>
            <Stack align="center" gap="sm">
              <Title order={4}>No investments yet</Title>
              <Text size="sm" c="dimmed">
                Get started by adding your first investment
              </Text>
              <Button onClick={() => setAdding(true)} leftSection={<Plus size={16} />}>
                Add Investment
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {stats.map((s) => (
            <InvestmentCard key={s.investment.id} {...s} />
          ))}
        </SimpleGrid>
      )}

      <InvestmentModal investment={adding ? blank : null} onClose={() => setAdding(false)} />
    </Stack>
  )
}

function InvestmentCard({ investment, invested, value, profit, returnRate }: ReturnType<typeof investmentStats>) {
  const profitColor = colorBySign(profit)

  return (
    <Link to="/investments/$id" params={{ id: investment.id }} className="plain-link">
      <Card h="100%" className="clickable-card">
        <Group justify="space-between" align="center" mb="xs">
          <Text fw={600}>{investment.name}</Text>
          <Badge color={investment.isActive ? 'green' : 'gray'}>{investment.isActive ? 'Active' : 'Inactive'}</Badge>
        </Group>
        {investment.description && (
          <Text size="xs" c="dimmed" mb="sm">
            {investment.description}
          </Text>
        )}
        <SimpleGrid cols={2} spacing={4}>
          <Stat label="Contributions" value={formatMoney(invested)} />
          <Stat label="Current Value" value={formatMoney(value)} />
          <Stat label="Profit/Loss" value={formatMoney(profit)} color={profitColor} />
          <Stat label="Return" value={value === null ? 'N/A' : formatPercent(returnRate, 2)} color={profitColor} />
        </SimpleGrid>
      </Card>
    </Link>
  )
}
