'use client'

import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button, Stack, Title, Text, Center } from '@mantine/core'

export default function EditInvestmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { investments } = useInvestmentStore()

  const investment = investments.find((inv) => inv.id === id)

  if (!investment) {
    return (
      <Center mih="16rem">
        <Stack align="center" gap="md">
          <Title order={2} size="h3">Investment not found</Title>
          <Text c="dimmed">The investment you're looking for doesn't exist.</Text>
          <Button component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
            Back to Investments
          </Button>
        </Stack>
      </Center>
    )
  }

  return (
    <Stack gap="xl">
      <div>
        <Button variant="subtle" size="sm" component={Link} to={`/investments/${id}`} leftSection={<ArrowLeft size={16} />}>
          Back to Investment
        </Button>
      </div>

      <PageHeader title="Edit Investment" description="Update your investment details" />

      <InvestmentForm investment={investment} onSuccess={() => navigate(`/investments/${id}`)} />
    </Stack>
  )
}
