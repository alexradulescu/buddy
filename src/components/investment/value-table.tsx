'use client'

import { useMemo, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Button, Card, Table } from '@mantine/core'
import { InvestmentValue } from '@/types/investment'
import ValueForm from './forms/value-form'

interface ValueTableProps {
  investmentId: string
  values: InvestmentValue[]
  onDelete: (id: string) => void
}

export default function ValueTable({ investmentId, values, onDelete }: ValueTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingValue, setEditingValue] = useState<InvestmentValue | undefined>()

  // Format and sort values by date (newest first)
  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [values])

  const handleEdit = (value: InvestmentValue) => {
    setEditingValue(value)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingValue(undefined)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingValue(undefined)
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
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Values</h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Add Value
          </Button>
        )}
      </Card.Section>
      <Card.Section inheritPadding py="md">
        {showForm ? (
          <ValueForm
            investmentId={investmentId}
            value={editingValue}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : sortedValues.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedValues.map((value) => (
                <Table.Tr key={value.id}>
                  <Table.Td>{formatDate(value.date)}</Table.Td>
                  <Table.Td>{formatCurrency(value.value)}</Table.Td>
                  <Table.Td>{value.description || '-'}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Button variant="subtle" size="compact-sm" onClick={() => handleEdit(value)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="subtle" size="compact-sm" color="red" onClick={() => onDelete(value.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--mantine-color-dimmed)' }}>No values recorded yet</p>
          </div>
        )}
      </Card.Section>
    </Card>
  )
}
