'use client'

import React, { useState } from 'react'

import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'

export default function ExpensesPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ExpenseList
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
        <div>
          <ExpenseForm selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>
    </>
  )
}
