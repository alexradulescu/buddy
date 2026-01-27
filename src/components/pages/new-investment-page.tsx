import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button, Stack, Group } from '@mantine/core'

export default function NewInvestmentPage() {
  return (
    <Stack gap="xl">
      <Group>
        <Button variant="subtle" size="sm" component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
      </Group>

      <PageHeader title="Add Investment" description="Create a new investment to track" />

      <InvestmentForm />
    </Stack>
  )
}
