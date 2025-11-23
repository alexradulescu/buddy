'use client'

import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button } from '@mantine/core'

export default function NewInvestmentPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="subtle" size="sm" component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
      </div>

      <PageHeader title="Add Investment" description="Create a new investment to track" />

      <InvestmentForm />
    </div>
  )
}
