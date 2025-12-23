'use client'

import { useMemo, useState } from 'react'
import { InvestmentContribution } from '@/types/investment'
import { Edit, Trash2, PiggyBank } from 'lucide-react'
import { Button, Card, Table, Group, Title, Text, Center, Stack } from '@mantine/core'
import ContributionForm from './forms/contribution-form'

interface ContributionTableProps {
  investmentId: string
  contributions: InvestmentContribution[]
  onDelete: (id: string) => void
}

export default function ContributionTable({ investmentId, contributions, onDelete }: ContributionTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingContribution, setEditingContribution] = useState<InvestmentContribution | undefined>()

  // Format and sort contributions by date (newest first)
  const sortedContributions = useMemo(() => {
    return [...contributions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [contributions])

  const handleEdit = (contribution: InvestmentContribution) => {
    setEditingContribution(contribution)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingContribution(undefined)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContribution(undefined)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <PiggyBank size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Title order={4} c="dimmed">Contributions</Title>
          </Group>
          {!showForm && (
            <Button size="xs" onClick={() => setShowForm(true)}>
              Add
            </Button>
          )}
        </Group>

        {showForm ? (
          <ContributionForm
            investmentId={investmentId}
            contribution={editingContribution}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : sortedContributions.length > 0 ? (
          <Table striped highlightOnHover fz="xs" verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th ta="right" w={60}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedContributions.map((contribution) => (
                <Table.Tr key={contribution.id}>
                  <Table.Td>{formatDate(contribution.date)}</Table.Td>
                  <Table.Td ta="right" className="numeric-value">{formatCurrency(contribution.amount)}</Table.Td>
                  <Table.Td c="dimmed">{contribution.description || '-'}</Table.Td>
                  <Table.Td ta="right">
                    <Group gap="xs" wrap="nowrap" justify="flex-end">
                      <Button variant="subtle" size="compact-xs" onClick={() => handleEdit(contribution)}>
                        <Edit size={12} />
                      </Button>
                      <Button variant="subtle" size="compact-xs" color="red" onClick={() => onDelete(contribution.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Center p="md">
            <Text c="dimmed" size="sm">No contributions yet</Text>
          </Center>
        )}
      </Stack>
    </Card>
  )
}
