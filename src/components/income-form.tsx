'use client'

import React, { useState } from 'react'
import { useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { TrashIcon } from 'lucide-react'
import { Button, TextInput, NumberInput, Select, Table } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'

interface IncomeFormProps {
  selectedYear: number
  selectedMonth: number
}

interface TableIncome {
  amount: string
  categoryId: string
  category: string
  date: Date
  description: string
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ selectedYear, selectedMonth }) => {
  const [tableIncomes, setTableIncomes] = useState<TableIncome[]>([
    { amount: '', categoryId: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
  ])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addIncome } = useIncomeStore()
  const { data: { incomeCategories = [] } = {} } = useCategoryStore()

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
        notifications.show({
          title: 'Invalid income',
          message: `Invalid amount in row ${index + 1}`,
          color: 'red'
        })
        hasError = true
        return null
      }

      const incomeDate = new Date(income.date)
      if (incomeDate.getFullYear() !== selectedYear || incomeDate.getMonth() !== selectedMonth) {
        notifications.show({
          title: 'Invalid date',
          message: `Income in row ${index + 1} is not for the selected month and year`,
          color: 'red'
        })
        hasError = true
        return null
      }

      return {
        amount: Number(income.amount),
        categoryId: income.categoryId || '',
        category: income.category || '',
        date: income.date.toISOString().split('T')[0],
        description: income.description
      }
    })

    if (!hasError) {
      newIncomes.forEach((income) => {
        if (income) addIncome(income)
      })
      setTableIncomes([
        { amount: '', categoryId: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
      notifications.show({
        title: 'Incomes added',
        message: `Added ${newIncomes.length} income(s)`,
        color: 'green'
      })
    }
  }

  const handleTableInputChange = (index: number, field: keyof TableIncome, value: string | Date | null) => {
    const updatedIncomes = [...tableIncomes]
    updatedIncomes[index] = { ...updatedIncomes[index], [field]: value }
    setTableIncomes(updatedIncomes)
  }

  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setTableIncomes([
        ...tableIncomes,
        { amount: '', categoryId: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
    }
  }

  const addRows = () => {
    const newRows: TableIncome[] = Array(rowsToAdd)
      .fill(null)
      .map(() => ({
        amount: '',
        categoryId: '',
        category: '',
        date: getDefaultDate(selectedYear, selectedMonth),
        description: ''
      }))
    setTableIncomes([...tableIncomes, ...newRows])
  }

  const deleteRow = (index: number) => {
    const updatedIncomes = tableIncomes.filter((_, i) => i !== index)
    setTableIncomes(updatedIncomes)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '110px' }}>Amount</Table.Th>
              <Table.Th style={{ width: '130px' }}>Category</Table.Th>
              <Table.Th style={{ width: '130px' }}>Date</Table.Th>
              <Table.Th style={{ width: '150px' }}>Description</Table.Th>
              <Table.Th style={{ width: '50px' }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tableIncomes.map((income, index) => (
              <Table.Tr key={index}>
                <Table.Td p={4}>
                  <NumberInput
                    value={income.amount}
                    onChange={(value) => handleTableInputChange(index, 'amount', value?.toString() || '')}
                    onKeyDown={(e) => handleTableKeyDown(e, index)}
                    decimalScale={2}
                    min={0}
                    required
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td p={4}>
                  <Select
                    value={income.categoryId || null}
                    onChange={(value) => {
                      const updatedIncomes = [...tableIncomes]
                      updatedIncomes[index] = { ...updatedIncomes[index], categoryId: value || '' }

                      const selectedCategory = incomeCategories.find((cat) => cat.id === value)

                      if (selectedCategory) {
                        updatedIncomes[index].category = selectedCategory.title
                      }

                      setTableIncomes(updatedIncomes)
                    }}
                    placeholder="Select category"
                    data={incomeCategories
                      .filter((category) => !category.isArchived)
                      .map((category) => ({
                        value: category.id,
                        label: category.title
                      }))}
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td p={4}>
                  <DatePickerInput
                    value={income.date}
                    onChange={(value) => handleTableInputChange(index, 'date', value)}
                    valueFormat="YYYY-MM-DD"
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td p={4}>
                  <TextInput
                    value={income.description}
                    onChange={(e) => handleTableInputChange(index, 'description', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index)}
                    styles={{ input: { borderRadius: 0 } }}
                  />
                </Table.Td>
                <Table.Td p={4}>
                  <Button
                    variant="subtle"
                    onClick={() => deleteRow(index)}
                    p={0}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <NumberInput
          value={rowsToAdd}
          onChange={(value) => setRowsToAdd(Number(value) || 1)}
          min={1}
          style={{ width: '80px' }}
        />
        <Button onClick={addRows}>Add Rows</Button>
      </div>
      <Button onClick={handleTableAddIncomes}>Save Incomes</Button>
    </div>
  )
}
