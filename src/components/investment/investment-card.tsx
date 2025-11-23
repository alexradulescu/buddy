'use client'

import { useMemo } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { Link } from 'react-router'
import { Card, Badge } from '@mantine/core'

interface InvestmentCardProps {
  investment: Investment
}

export default function InvestmentCard({ investment }: InvestmentCardProps) {
  const { getTotalContributions, getLatestValue } = useInvestmentStore()

  // Calculate metrics
  const totalContributions = useMemo(() => {
    return getTotalContributions(investment.id)
  }, [getTotalContributions, investment.id])

  const currentValue = useMemo(() => {
    return getLatestValue(investment.id)
  }, [getLatestValue, investment.id])

  const profit = currentValue !== null ? currentValue - totalContributions : 0
  const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Link to={`/investments/${investment.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', transition: 'background-color 0.2s', cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Card.Section withBorder inheritPadding py="xs">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{investment.name}</h3>
            <Badge color={investment.isActive ? 'green' : 'gray'}>
              {investment.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {investment.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', marginTop: '0.25rem', marginBottom: 0 }}>
              {investment.description}
            </p>
          )}
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div>
              <p style={{ color: 'var(--mantine-color-dimmed)', margin: 0 }}>Contributions</p>
              <p style={{ fontWeight: 500, margin: '0.25rem 0 0 0' }}>{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--mantine-color-dimmed)', margin: 0 }}>Current Value</p>
              <p style={{ fontWeight: 500, margin: '0.25rem 0 0 0' }}>{formatCurrency(currentValue)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--mantine-color-dimmed)', margin: 0 }}>Profit/Loss</p>
              <p style={{
                fontWeight: 500,
                margin: '0.25rem 0 0 0',
                color: profit >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
              }}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--mantine-color-dimmed)', margin: 0 }}>Return</p>
              <p style={{
                fontWeight: 500,
                margin: '0.25rem 0 0 0',
                color: profitPercentage >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
              }}>
                {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </Card.Section>
      </Card>
    </Link>
  )
}
