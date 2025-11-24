'use client'

import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, Table, Stack, SimpleGrid, Title, Text, Group, ScrollArea } from '@mantine/core'
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
    <Stack gap="md">
      <Card shadow="sm" padding="0" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
          <Group gap="xs">
            <TrendingUp size={20} />
            <Title order={3} size="h5">Investment Summary</Title>
          </Group>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">Total Value</Text>
              <Text size="xl" fw={700}>{formatCurrency(totalInvestmentValue)}</Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">Total Invested</Text>
              <Text size="xl" fw={700}>{formatCurrency(totalContributions)}</Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">Total P&L</Text>
              <Text size="xl" fw={700} c={totalProfitLoss >= 0 ? 'green.6' : 'red.6'}>
                {formatCurrency(totalProfitLoss)} ({profitLossPercentage.toFixed(2)}%)
              </Text>
            </Stack>
          </SimpleGrid>
        </Card.Section>
      </Card>

      <Card shadow="sm" padding="0" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
          <Title order={3} size="h5">Active Investments</Title>
        </Card.Section>
        <Card.Section>
          <ScrollArea>
            <Table style={{ minWidth: 600 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th ta="right">Current Value</Table.Th>
                  <Table.Th ta="right">Total Invested</Table.Th>
                  <Table.Th ta="right">P&L</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {investmentData.map((investment) => (
                  <Table.Tr key={investment.id}>
                    <Table.Td fw={500}>{investment.name}</Table.Td>
                    <Table.Td ta="right">{formatCurrency(investment.currentValue)}</Table.Td>
                    <Table.Td ta="right">{formatCurrency(investment.totalContributions)}</Table.Td>
                    <Table.Td ta="right">
                      <Text c={investment.profit >= 0 ? 'green.6' : 'red.6'}>
                        {formatCurrency(investment.profit)} ({investment.profitPercentage.toFixed(2)}%)
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>
    </Stack>
  )
}
