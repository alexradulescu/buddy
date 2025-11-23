'use client'

import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import InvestmentCard from '@/components/investment/investment-card'
import { PageHeader } from '@/components/page-header'
import { Button, Stack, Title, Text, Card, SimpleGrid, Center } from '@mantine/core'

export default function InvestmentsPage() {
  const { investments } = useInvestmentStore()

  return (
    <Stack gap="xl">
      <PageHeader
        title="Investments"
        description="Track and manage your investments"
        action={
          <Button component={Link} to="/investments/new" leftSection={<Plus size={16} />}>
            Add Investment
          </Button>
        }
      />

      {investments.length === 0 ? (
        <Card withBorder shadow="sm" radius="md" p="xl">
          <Center>
            <Stack align="center" gap="md">
              <Title order={3} size="h4">No investments yet</Title>
              <Text c="dimmed">Get started by adding your first investment</Text>
              <Button component={Link} to="/investments/new" leftSection={<Plus size={16} />}>
                Add Investment
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
