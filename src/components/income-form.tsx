'use client'

import { TrashIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCategoryStore } from '@/stores/category-store'
import { useIncomeStore } from '@/stores/income-store'

interface IncomeFormProps {
  selectedYear: number
  selectedMonth: number
}

interface TableIncome {
  amount: string
  category: string
  date: Date
  description: string
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ selectedYear, selectedMonth }) => {
  const [tableIncomes, setTableIncomes] = useState<TableIncome[]>([
    { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
  ])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addIncome } = useIncomeStore()
  const { incomeCategories } = useCategoryStore()
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
        category: income.category || 'uncategorized',
        date: income.date.toISOString().split('T')[0],
        description: income.description
      }
    })

    if (!hasError) {
      newIncomes.forEach((income) => {
        if (income) addIncome(income)
      })
      setTableIncomes([
        { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
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
        { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
    }
  }

  const addRows = () => {
    const newRows = Array(rowsToAdd)
      .fill(null)
      .map(() => ({ amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }))
    setTableIncomes([...tableIncomes, ...newRows])
  }

  const deleteRow = (index: number) => {
    const updatedIncomes = tableIncomes.filter((_, i) => i !== index)
    setTableIncomes(updatedIncomes)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Add Incomes for{' '}
        {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 w-[110px]">Amount</th>
                <th className="border border-gray-200 p-2 w-[130px]">Category</th>
                <th className="border border-gray-200 p-2 w-[130px]">Date</th>
                <th className="border border-gray-200 p-2 w-[150px]">Description</th>
                <th className="border border-gray-200 p-2 w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {tableIncomes.map((income, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 p-1">
                    <Input
                      type="number"
                      value={income.amount}
                      onChange={(e) => handleTableInputChange(index, 'amount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index)}
                      step="0.01"
                      min="0"
                      required
                      className="w-full h-full rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-2"
                    />
                  </td>
                  <td className="border border-gray-200 p-1">
                    <Select
                      value={income.category}
                      onValueChange={(value) => handleTableInputChange(index, 'category', value)}
                    >
                      <SelectTrigger className="w-full h-full rounded-none">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category.title} value={category.title}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-gray-200 p-1">
                    <DatePicker
                      date={income.date}
                      onDateChange={(date) => handleTableInputChange(index, 'date', date!)}
                      className="w-full h-full rounded-none"
                    />
                  </td>
                  <td className="border border-gray-200 p-1">
                    <Input
                      type="text"
                      value={income.description}
                      onChange={(e) => handleTableInputChange(index, 'description', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index)}
                      className="w-full h-full rounded-none py-2"
                    />
                  </td>
                  <td className="border border-gray-200 p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(index)}
                      className="w-full h-full rounded-none"
                    >
                      <TrashIcon className="h-7 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={rowsToAdd}
            onChange={(e) => setRowsToAdd(Number(e.target.value))}
            min="1"
            className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button onClick={addRows}>Add Rows</Button>
        </div>
        <Button onClick={handleTableAddIncomes}>Save Incomes</Button>
      </div>
    </div>
  )
}
