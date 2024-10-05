import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useExpenseStore } from '@/stores/expense-store'

interface ExpenseListProps {
  selectedYear: number
  selectedMonth: number
  onYearChange: (year: number) => void
  onMonthChange: (year: number) => void
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  selectedMonth,
  selectedYear,
  onYearChange,
  onMonthChange
}) => {
  const { expenses, removeExpense } = useExpenseStore()

  const currentYear = new Date().getFullYear()

  const years = [currentYear, currentYear - 1, currentYear - 2]
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
  })

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <h2 className="text-xl font-semibold">
        Expenses for {months[selectedMonth]} {selectedYear}
      </h2>
      {filteredExpenses.length === 0 ? (
        <p>No expenses for this month.</p>
      ) : (
        <ul className="space-y-2">
          {filteredExpenses.map((expense) => (
            <li key={expense.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <div>
                <span className="font-semibold">{expense.date}</span>: {expense.amount.toFixed(2)} -{' '}
                {expense.description}
                <span className="ml-2 text-sm text-gray-600">({expense.category})</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => removeExpense(expense.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
