'use client'

import { useMemo, useState } from 'react'
import { Edit, Trash2, BarChart3 } from 'lucide-react'
import { Button, Card, Table, Group, Title, Text, Center, Stack } from '@mantine/core'
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
    <Card>
      <Group justify="space-between" align="center" mb="xs">
        <Group gap="xs">
          <BarChart3 size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
          <Title order={5}>Values</Title>
        </Group>
        {!showForm && (
          <Button size="xs" onClick={() => setShowForm(true)}>
            Add
          </Button>
        )}
      </Group>

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
              <Table.Th ta="right">Value</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th ta="right" w={60}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedValues.map((value) => (
              <Table.Tr key={value.id}>
                <Table.Td>{formatDate(value.date)}</Table.Td>
                <Table.Td ta="right" className="numeric-value">{formatCurrency(value.value)}</Table.Td>
                <Table.Td c="dimmed">{value.description || '-'}</Table.Td>
                <Table.Td ta="right">
                  <Group gap={4} wrap="nowrap" justify="flex-end">
                    <Button variant="subtle" size="compact-xs" color="gray" onClick={() => handleEdit(value)}>
                      <Edit size={12} />
                    </Button>
                    <Button variant="subtle" size="compact-xs" color="red" onClick={() => onDelete(value.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Center py="sm">
          <Text c="dimmed" size="sm">No values recorded yet</Text>
        </Center>
      )}
    </Card>
  )
}
