'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIncomeStore } from '@/stores/income-store'

interface IncomeListProps {
  selectedYear: number
  selectedMonth: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
}

export const IncomeList: React.FC<IncomeListProps> = ({ selectedMonth, selectedYear, onYearChange, onMonthChange }) => {
  const { incomes, removeIncome } = useIncomeStore()

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

  const filteredIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date)
    return incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
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
        Incomes for {months[selectedMonth]} {selectedYear}
      </h2>
      {filteredIncomes.length === 0 ? (
        <p>No incomes for this month.</p>
      ) : (
        <ul className="space-y-2">
          {filteredIncomes.map((income) => (
            <li key={income.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <div>
                <span className="font-semibold">{income.date}</span>: ${income.amount.toFixed(2)} - {income.description}
                <span className="ml-2 text-sm text-gray-600">({income.category})</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => removeIncome(income.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
