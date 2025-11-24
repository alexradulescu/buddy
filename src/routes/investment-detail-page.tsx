'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import ContributionTable from '@/components/investment/contribution-table'
import PerformanceGraph from '@/components/investment/performance-graph'
import ValueTable from '@/components/investment/value-table'
import { PageHeader } from '@/components/page-header'
import { Button, Card, Tabs, Modal, Stack, Group, Title, Text, SimpleGrid, Center } from '@mantine/core'
import { notifications } from '@mantine/notifications'

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
  const [activeTab, setActiveTab] = useState('contributions')
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Button variant="subtle" size="sm" component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
        <Group gap="xs">
          <Button variant="outline" size="sm" component={Link} to={`/investments/${id}/edit`} leftSection={<Edit size={16} />}>
            Edit
          </Button>
          <Button variant="filled" color="red" size="sm" onClick={() => setDeleteModalOpen(true)} leftSection={<Trash2 size={16} />}>
            Delete
          </Button>
        </Group>
      </Group>

      <PageHeader title={investment.name} description={investment.description || 'No description provided'} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Text size="sm" fw={500}>Total Contributions</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Text size="xl" fw={700} className="numeric-value">{formatCurrency(totalContributions)}</Text>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Text size="sm" fw={500}>Current Value</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Text size="xl" fw={700} className="numeric-value">{formatCurrency(currentValue)}</Text>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Text size="sm" fw={500}>Profit/Loss</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Text size="xl" fw={700} c={profit >= 0 ? 'green.6' : 'red.6'} className="numeric-value">
              {formatCurrency(profit)}
            </Text>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Text size="sm" fw={500}>Return</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Text size="xl" fw={700} c={profitPercentage >= 0 ? 'green.6' : 'red.6'} className="numeric-value">
              {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
            </Text>
          </Card.Section>
        </Card>
      </SimpleGrid>

      <PerformanceGraph contributions={contributions} values={values} />

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'contributions')}>
        <Tabs.List>
          <Tabs.Tab value="contributions">Contributions</Tabs.Tab>
          <Tabs.Tab value="values">Values</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="contributions" pt="md">
          <ContributionTable investmentId={id} contributions={contributions} onDelete={handleDeleteContribution} />
        </Tabs.Panel>
        <Tabs.Panel value="values" pt="md">
          <ValueTable investmentId={id} values={values} onDelete={handleDeleteValue} />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Investment"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this investment? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
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
