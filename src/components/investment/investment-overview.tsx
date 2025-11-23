'use client'

import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, Table } from '@mantine/core'
import { useInvestmentStore } from '@/stores/useInvestmentStore'

export function InvestmentOverview() {
  const { investments, getLatestValue, getTotalContributions } = useInvestmentStore()

  // Get only active investments
  const activeInvestments = useMemo(() => {
    return investments.filter(investment => investment.isActive)
  }, [investments])

  // Calculate total investment value
  const totalInvestmentValue = useMemo(() => {
    return activeInvestments.reduce((total, investment) => {
      const latestValue = getLatestValue(investment.id)
      return total + (latestValue || 0)
    }, 0)
  }, [activeInvestments, getLatestValue])

  // Calculate total contributions
  const totalContributions = useMemo(() => {
    return activeInvestments.reduce((total, investment) => {
      return total + getTotalContributions(investment.id)
    }, 0)
  }, [activeInvestments, getTotalContributions])

  // Calculate total profit/loss
  const totalProfitLoss = totalInvestmentValue - totalContributions
  const profitLossPercentage = totalContributions > 0 ? (totalProfitLoss / totalContributions) * 100 : 0

  // Format currency values
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Prepare investment data for display
  const investmentData = useMemo(() => {
    return activeInvestments.map(investment => {
      const currentValue = getLatestValue(investment.id)
      const totalContributions = getTotalContributions(investment.id)
      const profit = currentValue !== null ? currentValue - totalContributions : 0
      const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

      return {
        id: investment.id,
        name: investment.name,
        currentValue,
        totalContributions,
        profit,
        profitPercentage
      }
    })
  }, [activeInvestments, getLatestValue, getTotalContributions])

  if (activeInvestments.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Card shadow="sm" padding="0" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Investment Summary
          </h3>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mantine-color-dimmed)', margin: 0 }}>Total Value</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>{formatCurrency(totalInvestmentValue)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mantine-color-dimmed)', margin: 0 }}>Total Invested</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mantine-color-dimmed)', margin: 0 }}>Total P&L</p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0.5rem 0 0 0',
                color: totalProfitLoss >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
              }}>
                {formatCurrency(totalProfitLoss)} ({profitLossPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </Card.Section>
      </Card>

      <Card shadow="sm" padding="0" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Active Investments</h3>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Current Value</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Total Invested</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>P&L</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {investmentData.map((investment) => (
                <Table.Tr key={investment.id}>
                  <Table.Td style={{ fontWeight: 500 }}>{investment.name}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(investment.currentValue)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(investment.totalContributions)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <span style={{
                      color: investment.profit >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
                    }}>
                      {formatCurrency(investment.profit)} ({investment.profitPercentage.toFixed(2)}%)
                    </span>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card.Section>
      </Card>
    </div>
  )
}
