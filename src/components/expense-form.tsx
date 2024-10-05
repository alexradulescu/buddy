import { TrashIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCategoryStore } from '@/stores/category-store'
import { useExpenseStore } from '@/stores/expense-store'

import { ExpenseAiConverter } from './expense-ai-converter'

interface ExpenseFormProps {
  selectedYear: number
  selectedMonth: number
}

interface TableExpense {
  amount: string
  category: string
  date: Date
  description: string
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ selectedYear, selectedMonth }) => {
  const [textareaContent, setTextareaContent] = useState('')
  const [tableExpenses, setTableExpenses] = useState<TableExpense[]>([
    { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
  ])
  const [rowsToAdd, setRowsToAdd] = useState(1)
  const { addExpense } = useExpenseStore()
  const categories = useCategoryStore((state) => state.categories)
  const { toast } = useToast()

  function getDefaultDate(year: number, month: number): Date {
    const currentDate = new Date()
    if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
      return currentDate
    }
    return new Date(year, month, 15)
  }

  const handleTextareaAddExpenses = () => {
    const lines = textareaContent.split('\n').filter((line) => line.trim() !== '')
    const defaultDate = getDefaultDate(selectedYear, selectedMonth)
    let hasError = false

    const newExpenses = lines.map((line, index) => {
      const [amount, category = 'unknown', date = defaultDate.toISOString().split('T')[0], description = ''] = line
        .split(',')
        .map((s) => s.trim())

      if (!amount || isNaN(Number(amount))) {
        toast({
          title: 'Invalid expense',
          description: `Invalid amount in line ${index + 1}: ${line}`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      const expenseDate = new Date(date)
      if (expenseDate.getFullYear() !== selectedYear || expenseDate.getMonth() !== selectedMonth) {
        toast({
          title: 'Invalid date',
          description: `Expense in line ${index + 1} is not for the selected month and year`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      const validCategory = categories.some((c) => c.name === category) ? category : 'unknown'

      return {
        amount: Number(amount),
        category: validCategory,
        date: date,
        description
      }
    })

    if (!hasError) {
      newExpenses.forEach((expense) => {
        if (expense) addExpense(expense)
      })
      setTextareaContent('')
      toast({
        title: 'Expenses added',
        description: `Added ${newExpenses.length} expense(s)`
      })
    }
  }

  const handleTableAddExpenses = () => {
    let hasError = false
    const newExpenses = tableExpenses.map((expense, index) => {
      if (!expense.amount || isNaN(Number(expense.amount)) || Number(expense.amount) <= 0) {
        toast({
          title: 'Invalid expense',
          description: `Invalid amount in row ${index + 1}`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      const expenseDate = new Date(expense.date)
      if (expenseDate.getFullYear() !== selectedYear || expenseDate.getMonth() !== selectedMonth) {
        toast({
          title: 'Invalid date',
          description: `Expense in row ${index + 1} is not for the selected month and year`,
          variant: 'destructive'
        })
        hasError = true
        return null
      }

      return {
        amount: Number(expense.amount),
        category: expense.category || 'unknown',
        date: expense.date.toISOString().split('T')[0],
        description: expense.description
      }
    })

    if (!hasError) {
      newExpenses.forEach((expense) => {
        if (expense) addExpense(expense)
      })
      setTableExpenses([
        { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
      toast({
        title: 'Expenses added',
        description: `Added ${newExpenses.length} expense(s)`
      })
    }
  }

  const handleTableInputChange = (index: number, field: keyof TableExpense, value: string | Date) => {
    const updatedExpenses = [...tableExpenses]
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value }
    setTableExpenses(updatedExpenses)
  }

  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setTableExpenses([
        ...tableExpenses,
        { amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }
      ])
    }
  }

  const addRows = () => {
    const newRows = Array(rowsToAdd)
      .fill(null)
      .map(() => ({ amount: '', category: '', date: getDefaultDate(selectedYear, selectedMonth), description: '' }))
    setTableExpenses([...tableExpenses, ...newRows])
  }

  const deleteRow = (index: number) => {
    const updatedExpenses = tableExpenses.filter((_, i) => i !== index)
    setTableExpenses(updatedExpenses)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Add Expenses for{' '}
        {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <Tabs defaultValue="table-form">
        <TabsList>
          <TabsTrigger value="table-form">Table Entry</TabsTrigger>
          <TabsTrigger value="textarea-form">Bulk Entry</TabsTrigger>
          <TabsTrigger value="ai-converter">AI converter</TabsTrigger>
        </TabsList>
        <TabsContent value="table-form">
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
                  {tableExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 p-1">
                        <Input
                          type="number"
                          value={expense.amount}
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
                          value={expense.category}
                          onValueChange={(value) => handleTableInputChange(index, 'category', value)}
                        >
                          <SelectTrigger className="w-full h-full rounded-none">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-200 p-1">
                        <DatePicker
                          date={expense.date}
                          onDateChange={(date) => handleTableInputChange(index, 'date', date!)}
                          className="w-full h-full rounded-none"
                        />
                      </td>
                      <td className="border border-gray-200 p-1">
                        <Input
                          type="text"
                          value={expense.description}
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
            <Button onClick={handleTableAddExpenses}>Save Expenses</Button>
          </div>
        </TabsContent>
        <TabsContent value="textarea-form">
          <div className="space-y-4">
            <Textarea
              value={textareaContent}
              onChange={(e) => setTextareaContent(e.target.value)}
              placeholder="Enter expenses (amount,category,date,description)"
              rows={10}
              className="font-mono w-full"
            />
            <Button onClick={handleTextareaAddExpenses}>Add Expenses</Button>
          </div>
        </TabsContent>
        <TabsContent value="ai-converter">
          <ExpenseAiConverter
            handleTextareaAddExpenses={handleTextareaAddExpenses}
            setTextareaContent={setTextareaContent}
            textareaContent={textareaContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
