'use client'

import React, { useMemo, useState } from 'react'
import { useIncomeStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { TextInput, Card, Button, Group, Text, Stack, ActionIcon } from '@mantine/core'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import { useToast } from '@/hooks/use-toast'

interface IncomeListProps {
  selectedYear: number
  selectedMonth: number
}

export const IncomeList: React.FC<IncomeListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { incomes = [] } = {}, removeIncome } = useIncomeStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSortedIncomes = useMemo(() => {
    return incomes
      .filter((income) => {
        const incomeDate = new Date(income.date)
        const matchesDate = incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
        const matchesSearch =
          income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.amount.toString().includes(searchTerm) ||
          income.category?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesDate && matchesSearch
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [incomes, selectedYear, selectedMonth, searchTerm])

  const handleDelete = (id: string) => {
    removeIncome(id)
    toast({
      title: 'Income deleted',
      description: 'The income has been successfully removed.',
      variant: 'default'
    })
  }

  return (
    <div>
      <TextInput
        placeholder="Search incomes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftSection={<IconSearch size="1rem" />}
        mb="md"
      />

      {filteredAndSortedIncomes.length === 0 ? (
        <Text c="dimmed" ta="center" py="lg">No incomes found for this period.</Text>
      ) : (
        <Stack gap="xs">
          {filteredAndSortedIncomes.map((income) => (
            <Card key={income.id} shadow="xs" padding="md" radius="md" withBorder>
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={500}>{income.description}</Text>
                  <Text size="sm" c="dimmed">{income.category}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text fw={500}>${income.amount.toFixed(2)}</Text>
                  <Text size="sm" c="dimmed">{format(new Date(income.date), 'dd MMM yyyy')}</Text>
                </div>
              </Group>
              <Group justify="flex-end" mt="xs">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(income.id)}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </div>
  )
}
