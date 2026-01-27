import React, { useState } from 'react'
import { useCategoryStore, useIncomeStore } from '@/stores/instantdb'
import { Button, NumberInput, Group, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IncomeSpreadsheet } from '@/components/income-spreadsheet'

interface IncomeFormProps {
  selectedYear: number
  selectedMonth: number
}

interface TableIncome {
  id: string
  amount: string
  categoryId: string
  category: string
  date: Date | string
  description: string
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ selectedYear, selectedMonth }) => {
  const [tableIncomes, setTableIncomes] = useState<TableIncome[]>([
    { id: crypto.randomUUID(), amount: '', categoryId: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
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
        console.error('Income validation error: Invalid amount in row', index + 1, income.amount)
        notifications.show({
          title: 'Invalid income',
          message: `Invalid amount in row ${index + 1}`,
          color: 'red'
        })
        hasError = true
        return null
      }

      const incomeDate = income.date instanceof Date ? income.date : new Date(income.date)
      if (incomeDate.getFullYear() !== selectedYear || incomeDate.getMonth() !== selectedMonth) {
        console.error('Income validation error: Invalid date in row', index + 1, income.date)
        notifications.show({
          title: 'Invalid date',
          message: `Income in row ${index + 1} is not for the selected month and year`,
          color: 'red'
        })
        hasError = true
        return null
      }

      return {
        amount: Number(income.amount) || 0,
        categoryId: income.categoryId || '',
        category: income.category || '',
        date: (income.date instanceof Date ? income.date : new Date(income.date)).toISOString().split('T')[0],
        description: income.description
      }
    })

    if (!hasError) {
      newIncomes.forEach((income) => {
        if (income) addIncome(income)
      })
      setTableIncomes([
        { id: crypto.randomUUID(), amount: '', categoryId: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
      notifications.show({
        title: 'Incomes added',
        message: `Added ${newIncomes.length} income(s)`,
        color: 'green'
      })
    }
  }

  const handleTableInputChange = (index: number, field: string, value: string | Date | null) => {
    const updatedIncomes = [...tableIncomes]
    // Ensure date is never null
    const safeValue = field === 'date' && value === null ? getDefaultDate(selectedYear, selectedMonth) : value
    updatedIncomes[index] = { ...updatedIncomes[index], [field]: safeValue }
    setTableIncomes(updatedIncomes)
  }

  const addRows = () => {
    const newRows: TableIncome[] = Array(rowsToAdd)
      .fill(null)
      .map(() => ({
        id: crypto.randomUUID(),
        amount: '',
        categoryId: '',
        category: '',
        date: getDefaultDate(selectedYear, selectedMonth),
        description: ''
      }))
    setTableIncomes([...tableIncomes, ...newRows])
  }

  const deleteRow = (index: number) => {
    setTableIncomes(tableIncomes.filter((_, i) => i !== index))
  }

  return (
    <Stack gap="md">
      <IncomeSpreadsheet
        incomes={tableIncomes}
        incomeCategories={incomeCategories}
        onInputChange={handleTableInputChange}
        onDeleteRow={deleteRow}
      />
      <Group gap="sm">
        <NumberInput
          value={rowsToAdd}
          onChange={(value) => setRowsToAdd(Number(value) || 1)}
          min={1}
          w={80}
        />
        <Button onClick={addRows}>Add Rows</Button>
      </Group>
      <Button onClick={handleTableAddIncomes} fullWidth>Save Incomes</Button>
    </Stack>
  )
}
