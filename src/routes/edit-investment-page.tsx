'use client'

import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button } from '@mantine/core'

export default function EditInvestmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { investments } = useInvestmentStore()

  const investment = investments.find((inv) => inv.id === id)

  if (!investment) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '16rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Investment not found</h2>
        <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>The investment you're looking for doesn't exist.</p>
        <Button component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="subtle" size="sm" component={Link} to={`/investments/${id}`} leftSection={<ArrowLeft size={16} />}>
          Back to Investment
        </Button>
      </div>

      <PageHeader title="Edit Investment" description="Update your investment details" />

      <InvestmentForm investment={investment} onSuccess={() => navigate(`/investments/${id}`)} />
    </div>
  )
}
