'use client'

import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import InvestmentCard from '@/components/investment/investment-card'
import { PageHeader } from '@/components/page-header'
import { Button } from '@mantine/core'

export default function InvestmentsPage() {
  const { investments } = useInvestmentStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--mantine-color-white)',
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px solid var(--mantine-color-gray-3)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>No investments yet</h3>
          <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>Get started by adding your first investment</p>
          <Button component={Link} to="/investments/new" leftSection={<Plus size={16} />}>
            Add Investment
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      )}
    </div>
  )
}
