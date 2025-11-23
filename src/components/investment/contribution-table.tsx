'use client'

import { useMemo, useState } from 'react'
import { InvestmentContribution } from '@/types/investment'
import { Edit, Trash2 } from 'lucide-react'
import { Button, Card, Table } from '@mantine/core'
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
    <Card shadow="sm" padding="0" radius="md" withBorder>
      <Card.Section
        withBorder
        inheritPadding
        py="xs"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Contributions</h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Add Contribution
          </Button>
        )}
      </Card.Section>
      <Card.Section inheritPadding py="md">
        {showForm ? (
          <ContributionForm
            investmentId={investmentId}
            contribution={editingContribution}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : sortedContributions.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedContributions.map((contribution) => (
                <Table.Tr key={contribution.id}>
                  <Table.Td>{formatDate(contribution.date)}</Table.Td>
                  <Table.Td>{formatCurrency(contribution.amount)}</Table.Td>
                  <Table.Td>{contribution.description || '-'}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Button variant="subtle" size="compact-sm" onClick={() => handleEdit(contribution)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="subtle" size="compact-sm" color="red" onClick={() => onDelete(contribution.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--mantine-color-dimmed)' }}>No contributions yet</p>
          </div>
        )}
      </Card.Section>
    </Card>
  )
}
