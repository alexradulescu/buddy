'use client'

import React from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { useCategoryStore } from '@/stores/category-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useIncomeStore } from '@/stores/income-store'

export default function HomePage() {
  const currentDate = new Date()
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useSharedQueryParams()

  const { expenseCategories, incomeCategories } = useCategoryStore()
  const expenses = useExpenseStore((state) => state.expenses)
  const incomes = useIncomeStore((state) => state.incomes)

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)
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

  const calculateCategoryAmount = (
    items: typeof expenses | typeof incomes,
    categoryName: string,
    isAnnual: boolean = false,
    isYearToDate: boolean = false
  ) => {
    return items
      .filter((item) => {
        const itemDate = new Date(item.date)
        if (isAnnual) {
          return itemDate.getFullYear() === selectedYear && item.category === categoryName
        }
        if (isYearToDate) {
          return (
            itemDate.getFullYear() === selectedYear &&
            itemDate.getMonth() <= selectedMonth &&
            item.category === categoryName
          )
        }
        return (
          itemDate.getFullYear() === selectedYear &&
          itemDate.getMonth() === selectedMonth &&
          item.category === categoryName
        )
      })
      .reduce((total, item) => total + item.amount, 0)
  }

  const getRowBackgroundColor = (currentAmount: number, budget: number | undefined) => {
    if (budget === undefined) return 'bg-gray-100'
    const difference = budget - currentAmount
    const percentageDifference = (difference / budget) * 100

    if (percentageDifference > 20) return 'bg-green-100'
    if (percentageDifference >= 0) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const totalMonthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth
    })
    .reduce((total, expense) => total + expense.amount, 0)

  const totalMonthlyIncomes = incomes
    .filter((income) => {
      const incomeDate = new Date(income.date)
      return incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
    })
    .reduce((total, income) => total + income.amount, 0)

  const calculateAnnualBudget = (maxBudget: number | undefined, maxAnnualBudget: number | undefined) => {
    if (maxAnnualBudget !== undefined) return maxAnnualBudget
    if (maxBudget !== undefined) return maxBudget * 12
    return undefined
  }

  const calculateYearToDateBudget = (maxBudget: number | undefined) => {
    if (maxBudget === undefined) return undefined
    return maxBudget * (selectedMonth + 1)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Budget Overview</h1>

      <div className="flex space-x-4">
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
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

        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
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

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Monthly Overview</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="font-medium">
              <TableCell>Total Income</TableCell>
              <TableCell className="text-right">${totalMonthlyIncomes.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell>Total Expenses</TableCell>
              <TableCell className="text-right">${totalMonthlyExpenses.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell>Net Income</TableCell>
              <TableCell
                className={`text-right ${totalMonthlyIncomes - totalMonthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${(totalMonthlyIncomes - totalMonthlyExpenses).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Expense Categories</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Expense</TableHead>
              <TableHead className="text-right">Monthly Budget</TableHead>
              <TableHead className="text-right">Annual Budget</TableHead>
              <TableHead className="text-right">Year-to-Date Budget</TableHead>
              <TableHead className="text-right">Year-to-Date Expense</TableHead>
              <TableHead>Overview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseCategories.map((category) => {
              const currentMonthlyExpense = calculateCategoryAmount(expenses, category.name)
              const currentAnnualExpense = calculateCategoryAmount(expenses, category.name, true)
              const currentYearToDateExpense = calculateCategoryAmount(expenses, category.name, false, true)
              const annualBudget = calculateAnnualBudget(category.maxBudget, category.maxAnnualBudget)
              const yearToDateBudget = calculateYearToDateBudget(category.maxBudget)
              const monthlyDifference =
                category.maxBudget !== undefined ? category.maxBudget - currentMonthlyExpense : undefined
              const annualDifference = annualBudget !== undefined ? annualBudget - currentAnnualExpense : undefined
              const yearToDateDifference =
                yearToDateBudget !== undefined ? yearToDateBudget - currentYearToDateExpense : undefined
              const rowColor = getRowBackgroundColor(currentMonthlyExpense, category.maxBudget)

              return (
                <TableRow key={category.name} className={rowColor}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">${currentMonthlyExpense.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {category.maxBudget !== undefined ? `$${category.maxBudget.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {annualBudget !== undefined ? `$${annualBudget.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {yearToDateBudget !== undefined ? `$${yearToDateBudget.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">${currentYearToDateExpense.toFixed(2)}</TableCell>
                  <TableCell>
                    {monthlyDifference !== undefined && (
                      <span className={monthlyDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        Monthly: {monthlyDifference >= 0 ? 'Under by: ' : 'Over by: '}$
                        {Math.abs(monthlyDifference).toFixed(2)}
                      </span>
                    )}
                    {annualDifference !== undefined && (
                      <span className={`block ${annualDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Annual: {annualDifference >= 0 ? 'Under by: ' : 'Over by: '}$
                        {Math.abs(annualDifference).toFixed(2)}
                      </span>
                    )}
                    {yearToDateDifference !== undefined && (
                      <span className={`block ${yearToDateDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        YTD: {yearToDateDifference >= 0 ? 'Under by: ' : 'Over by: '}$
                        {Math.abs(yearToDateDifference).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Income Categories</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Income</TableHead>
              <TableHead className="text-right">Target Amount</TableHead>
              <TableHead className="text-right">Year-to-Date Income</TableHead>
              <TableHead>Overview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeCategories.map((category) => {
              const currentMonthlyIncome = calculateCategoryAmount(incomes, category.title)
              const currentYearToDateIncome = calculateCategoryAmount(incomes, category.title, false, true)
              const difference =
                category.targetAmount !== undefined ? category.targetAmount - currentMonthlyIncome : undefined
              const rowColor = getRowBackgroundColor(currentMonthlyIncome, category.targetAmount)

              return (
                <TableRow key={category.title} className={rowColor}>
                  <TableCell className="font-medium">{category.title}</TableCell>
                  <TableCell className="text-right">${currentMonthlyIncome.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {category.targetAmount !== undefined ? `$${category.targetAmount.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">${currentYearToDateIncome.toFixed(2)}</TableCell>
                  <TableCell>
                    {difference !== undefined && (
                      <span className={difference >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {difference >= 0 ? 'Under by: ' : 'Over by: '}${Math.abs(difference).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
