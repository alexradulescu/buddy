'use client'

import { useMemo } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { Link } from 'react-router'
import { Card, Badge, Stack, Group, Text, SimpleGrid } from '@mantine/core'

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
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>{investment.name}</Text>
            <Badge color={investment.isActive ? 'green' : 'gray'}>
              {investment.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
          {investment.description && (
            <Text size="sm" c="dimmed" mt="xs">
              {investment.description}
            </Text>
          )}
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <SimpleGrid cols={2} spacing="xs">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Contributions</Text>
              <Text fw={500} className="numeric-value">{formatCurrency(totalContributions)}</Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Current Value</Text>
              <Text fw={500} className="numeric-value">{formatCurrency(currentValue)}</Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Profit/Loss</Text>
              <Text fw={500} c={profit >= 0 ? 'green.6' : 'red.6'} className="numeric-value">
                {formatCurrency(profit)}
              </Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Return</Text>
              <Text fw={500} c={profitPercentage >= 0 ? 'green.6' : 'red.6'} className="numeric-value">
                {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
              </Text>
            </Stack>
          </SimpleGrid>
        </Card.Section>
      </Card>
    </Link>
  )
}
