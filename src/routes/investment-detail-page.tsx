'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import ContributionTable from '@/components/investment/contribution-table'
import PerformanceGraph from '@/components/investment/performance-graph'
import ValueTable from '@/components/investment/value-table'
import { PageHeader } from '@/components/page-header'
import { Button, Card, Tabs, Modal } from '@mantine/core'
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '16rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Investment not found</h2>
        <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>The investment you're looking for doesn't exist.</p>
        <Button component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="subtle" size="sm" component={Link} to="/investments" leftSection={<ArrowLeft size={16} />}>
          Back to Investments
        </Button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" component={Link} to={`/investments/${id}/edit`} leftSection={<Edit size={16} />}>
            Edit
          </Button>
          <Button variant="filled" color="red" size="sm" onClick={() => setDeleteModalOpen(true)} leftSection={<Trash2 size={16} />}>
            Delete
          </Button>
        </div>
      </div>

      <PageHeader title={investment.name} description={investment.description || 'No description provided'} />

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>Total Contributions</h4>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalContributions)}</div>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>Current Value</h4>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(currentValue)}</div>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>Profit/Loss</h4>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: profit >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
            }}>
              {formatCurrency(profit)}
            </div>
          </Card.Section>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>Return</h4>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: profitPercentage >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
            }}>
              {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
            </div>
          </Card.Section>
        </Card>
      </div>

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0 }}>
            Are you sure you want to delete this investment? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteInvestment}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
