'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import ContributionTable from '@/components/investment/contribution-table'
import PerformanceGraph from '@/components/investment/performance-graph'
import ValueTable from '@/components/investment/value-table'
import { Button, Card, Modal, Stack, Group, Title, Text, SimpleGrid, Center } from '@mantine/core'
import { notifications } from '@mantine/notifications'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    investments,
    getInvestmentContributions,
    getInvestmentValues,
    getTotalContributions,
    getLatestValue,
    deleteInvestment,
    deleteContribution,
    deleteValue
  } = useInvestmentStore()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Find the investment by ID
  const investment = investments.find((inv) => inv.id === id)

  if (!investment || !id) {
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

  // Get contributions and values for this investment
  const contributions = getInvestmentContributions(id)
  const values = getInvestmentValues(id)

  // Calculate metrics
  const totalContributions = getTotalContributions(id)
  const currentValue = getLatestValue(id)
  const profit = currentValue !== null ? currentValue - totalContributions : 0
  const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

  const handleDeleteInvestment = async () => {
    try {
      await deleteInvestment(id)
      notifications.show({
        title: 'Investment deleted',
        message: 'The investment has been successfully deleted.',
        color: 'green'
      })
      navigate('/investments')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete the investment. Please try again.',
        color: 'red'
      })
    }
    setDeleteModalOpen(false)
  }

  const handleDeleteContribution = async (contributionId: string) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await deleteContribution(contributionId)
        notifications.show({
          title: 'Contribution deleted',
          message: 'The contribution has been successfully deleted.',
          color: 'green'
        })
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete the contribution. Please try again.',
          color: 'red'
        })
      }
    }
  }

  const handleDeleteValue = async (valueId: string) => {
    if (window.confirm('Are you sure you want to delete this value entry?')) {
      try {
        await deleteValue(valueId)
        notifications.show({
          title: 'Value entry deleted',
          message: 'The value entry has been successfully deleted.',
          color: 'green'
        })
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete the value entry. Please try again.',
          color: 'red'
        })
      }
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return currencyFormatter.format(amount)
  }

  const overviewMetrics = [
    { label: 'Total Contributions', value: formatCurrency(totalContributions) },
    { label: 'Current Value', value: formatCurrency(currentValue) },
    { label: 'Profit/Loss', value: formatCurrency(profit), color: profit >= 0 ? 'green.6' : 'red.6' },
    { label: 'Return', value: currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`, color: profitPercentage >= 0 ? 'green.6' : 'red.6' }
  ]

  return (
    <Stack gap="md">
      {/* Header with back button and actions */}
      <Group justify="space-between">
        <Button variant="subtle" color="gray" component={Link} to="/investments" leftSection={<ArrowLeft size={14} />}>
          Back to Investments
        </Button>
        <Group gap="xs">
          <Button variant="default" component={Link} to={`/investments/${id}/edit`} leftSection={<Edit size={14} />}>
            Edit
          </Button>
          <Button color="red" onClick={() => setDeleteModalOpen(true)} leftSection={<Trash2 size={14} />}>
            Delete
          </Button>
        </Group>
      </Group>

      {/* Title and description */}
      <Stack gap={2}>
        <Title order={3}>{investment.name}</Title>
        <Text c="dimmed" size="sm">{investment.description || 'No description provided'}</Text>
      </Stack>

      {/* Overview Card + Performance Chart - side by side */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        {/* Overview Card */}
        <Card>
          <Group gap="xs" mb="xs">
            <DollarSign size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
            <Title order={5}>Overview</Title>
          </Group>
          <Stack gap={4}>
            {overviewMetrics.map((metric) => (
              <Group key={metric.label} justify="space-between" gap="xs">
                <Text size="sm" c="dimmed">{metric.label}</Text>
                <Text size="sm" fw={600} className="numeric-value" c={metric.color}>
                  {metric.value}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>

        {/* Performance Chart */}
        <PerformanceGraph contributions={contributions} values={values} />
      </SimpleGrid>

      {/* Contributions & Values - side by side */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        <ContributionTable investmentId={id} contributions={contributions} onDelete={handleDeleteContribution} />
        <ValueTable investmentId={id} values={values} onDelete={handleDeleteValue} />
      </SimpleGrid>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Investment"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to delete this investment? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteInvestment}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
