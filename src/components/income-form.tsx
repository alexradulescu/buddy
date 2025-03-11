'use client'

import React, { useState } from 'react'
import { useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { Button, TextInput, NumberInput, Table, Group, Select, ActionIcon } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconTrash } from '@tabler/icons-react'
import { useToast } from '@/hooks/use-toast'

interface IncomeFormProps {
  selectedYear: number
  selectedMonth: number
}

interface TableIncome {
  amount: string
  categoryId: string
  date: Date
  description: string
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ selectedYear, selectedMonth }) => {
  const [tableIncomes, setTableIncomes] = useState<TableIncome[]>([
    { amount: '', categoryId: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
  ])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addIncome } = useIncomeStore()
  const { data: { incomeCategories = [] } = {} } = useCategoryStore()
  const { toast } = useToast()

  function getDefaultDate(year: number, month: number): Date {
    const currentDate = new Date()
    if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
      return currentDate
    }
    return new Date(year, month, 15)
  }

  const handleTableAddIncomes = () => {
    let hasError = false
    const newIncomes = tableIncomes.map((income, index) => {
      if (!income.amount || isNaN(Number(income.amount)) || Number(income.amount) <= 0) {
        toast({
          title: 'Invalid income',
          description: `Invalid amount in row ${index + 1}`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      const incomeDate = new Date(income.date)
      if (incomeDate.getFullYear() !== selectedYear || incomeDate.getMonth() !== selectedMonth) {
        toast({
          title: 'Invalid date',
          description: `Income in row ${index + 1} is not for the selected month and year`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      return {
        amount: Number(income.amount),
        categoryId: income.categoryId || '',
        date: income.date.toISOString().split('T')[0],
        description: income.description
      }
    })

    if (!hasError) {
      newIncomes.forEach((income) => {
        if (income) addIncome(income)
      })
      setTableIncomes([
        { amount: '', categoryId: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
      toast({
        title: 'Incomes added',
        description: `Added ${newIncomes.length} income(s)`
      })
    }
  }

  const handleTableInputChange = (index: number, field: keyof TableIncome, value: string | Date) => {
    const updatedIncomes = [...tableIncomes]
    updatedIncomes[index] = { ...updatedIncomes[index], [field]: value }
    setTableIncomes(updatedIncomes)
  }

  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setTableIncomes([
        ...tableIncomes,
        { amount: '', categoryId: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
    }
  }

  const addRows = () => {
    const newRows: TableIncome[] = Array(rowsToAdd)
      .fill(null)
      .map(() => ({ amount: '', categoryId: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }))
    setTableIncomes([...tableIncomes, ...newRows])
  }

  const deleteRow = (index: number) => {
    const updatedIncomes = tableIncomes.filter((_, i) => i !== index)
    setTableIncomes(updatedIncomes)
  }

  const categoryOptions = incomeCategories
    .filter((category) => !category.isArchived)
    .map((category) => ({
      value: category.title,
      label: category.title
    }))

  return (
    <div>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 110 }}>Amount</Table.Th>
            <Table.Th style={{ width: 130 }}>Category</Table.Th>
            <Table.Th style={{ width: 130 }}>Date</Table.Th>
            <Table.Th style={{ width: 150 }}>Description</Table.Th>
            <Table.Th style={{ width: 50 }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tableIncomes.map((income, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <NumberInput
                  value={income.amount ? parseFloat(income.amount) : ''}
                  onChange={(value) => handleTableInputChange(index, 'amount', value ? value.toString() : '')}
                  onKeyDown={(e) => handleTableKeyDown(e, index)}
                  step={0.01}
                  min={0}
                  placeholder="0.00"
                  hideControls
                  required
                />
              </Table.Td>
              <Table.Td>
                <Select
                  value={income.categoryId}
                  onChange={(value) => handleTableInputChange(index, 'categoryId', value || '')}
                  data={categoryOptions}
                  placeholder="Select category"
                  clearable
                />
              </Table.Td>
              <Table.Td>
                <DatePickerInput
                  value={income.date}
                  onChange={(date) => handleTableInputChange(index, 'date', date || getDefaultDate(selectedYear, selectedMonth))}
                  valueFormat="YYYY-MM-DD"
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  value={income.description}
                  onChange={(e) => handleTableInputChange(index, 'description', e.target.value)}
                  onKeyDown={(e) => handleTableKeyDown(e, index)}
                  placeholder="Description"
                />
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => deleteRow(index)}
                  disabled={tableIncomes.length === 1}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      
      <Group mt="md" justify="space-between">
        <Group>
          <NumberInput
            value={rowsToAdd}
            onChange={(value) => setRowsToAdd(Number(value || 1))}
            min={1}
            max={10}
            w={80}
            hideControls={false}
          />
          <Button variant="outline" onClick={addRows}>Add Rows</Button>
        </Group>
        <Button onClick={handleTableAddIncomes}>Save Incomes</Button>
      </Group>
    </div>
  )
}
