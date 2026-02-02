import { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { useCategoryStore, useExpenseStore, useIncomeStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import {
  formatNumberForCSV,
  formatDeltaForCSV,
  formatPercentForCSV,
  formatPercentValueForCSV,
  createCSVRow,
  downloadCSV,
  escapeCSVField
} from '@/utils/csv-export'

export function useDashboardExport() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  const { data: { expenseCategories = [], incomeCategories = [] } = {} } = useCategoryStore()
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()
  const { investments, investmentContributions, getLatestValue, getTotalContributions } = useInvestmentStore()

  // Compute YTD data (same logic as ytd-overview.tsx)
  const ytdData = useMemo(() => {
    // YTD Income: All income from Jan 1 to selected month of selected year
    const ytdIncome = incomes
      .filter((income) => {
        const incomeDate = new Date(income.date)
        return (
          incomeDate.getFullYear() === selectedYear &&
          incomeDate.getMonth() <= selectedMonth
        )
      })
      .reduce((total, income) => total + (income.amount || 0), 0)

    // YTD Expenses: All expenses from Jan 1 to selected month of selected year
    const ytdExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === selectedYear &&
          expenseDate.getMonth() <= selectedMonth
        )
      })
      .reduce((total, expense) => total + (expense.amount || 0), 0)

    // YTD Investment Contributions (to exclude from spent)
    const ytdInvestmentContributions = investmentContributions
      .filter((contribution) => {
        const contributionDate = new Date(contribution.date)
        return (
          contributionDate.getFullYear() === selectedYear &&
          contributionDate.getMonth() <= selectedMonth
        )
      })
      .reduce((total, contribution) => total + (contribution.amount || 0), 0)

    // YTD Spent (expenses minus investments)
    const ytdSpent = ytdExpenses - ytdInvestmentContributions

    // YTD Budget: Sum of all non-archived category monthly budgets × (selected month + 1)
    const monthsElapsed = selectedMonth + 1
    const ytdBudget = expenseCategories
      .filter((category) => !category.isArchived)
      .reduce((total, category) => total + (category.maxBudget || 0), 0) * monthsElapsed

    // All-time investment contributions
    const totalInvested = investmentContributions.reduce(
      (total, contribution) => total + (contribution.amount || 0),
      0
    )

    // Latest investment values
    const totalInvestmentValue = investments
      .filter((investment) => investment.isActive)
      .reduce((total, investment) => {
        const latestValue = getLatestValue(investment.id)
        return total + (latestValue || 0)
      }, 0)

    // YTD Savings
    const ytdSavings = ytdIncome - ytdSpent

    // YTD Savings Rate
    const ytdSavingsRate = ytdIncome > 0 ? ytdSavings / ytdIncome : 0

    return {
      ytdIncome,
      ytdSpent,
      ytdBudget,
      totalInvested,
      totalInvestmentValue,
      ytdSavings,
      ytdSavingsRate
    }
  }, [incomes, expenses, expenseCategories, investments, investmentContributions, getLatestValue, selectedYear, selectedMonth])

  // Compute expense categories data (same logic as expense-overview.tsx)
  const expenseCategoriesData = useMemo(() => {
    return expenseCategories
      .filter((category) => !category.isArchived)
      .map((category) => {
        // Current monthly expense
        const currentMonthlyExpense = expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return (
              expenseDate.getFullYear() === selectedYear &&
              expenseDate.getMonth() === selectedMonth &&
              expense.categoryId === category.id
            )
          })
          .reduce((total, expense) => total + (expense.amount || 0), 0)

        // Year-to-date expense
        const currentYearToDateExpense = expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return (
              expenseDate.getFullYear() === selectedYear &&
              expenseDate.getMonth() <= selectedMonth &&
              expense.categoryId === category.id
            )
          })
          .reduce((total, expense) => total + (expense.amount || 0), 0)

        // Annual expense
        const currentAnnualExpense = expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date)
            return (
              expenseDate.getFullYear() === selectedYear &&
              expense.categoryId === category.id
            )
          })
          .reduce((total, expense) => total + (expense.amount || 0), 0)

        // Budgets
        const monthlyBudget = category.maxBudget
        const yearToDateBudget = category.maxBudget !== undefined ? category.maxBudget * (selectedMonth + 1) : undefined
        const annualBudget = category.maxAnnualBudget !== undefined ? category.maxAnnualBudget : (category.maxBudget !== undefined ? category.maxBudget * 12 : undefined)

        // Deltas (positive = under budget, negative = over budget)
        const monthlyDelta = monthlyBudget !== undefined ? monthlyBudget - currentMonthlyExpense : undefined
        const ytdDelta = yearToDateBudget !== undefined ? yearToDateBudget - currentYearToDateExpense : undefined
        const annualDelta = annualBudget !== undefined ? annualBudget - currentAnnualExpense : undefined

        return {
          name: category.name,
          current: currentMonthlyExpense,
          monthlyBudget,
          monthlyDelta,
          yearToDate: currentYearToDateExpense,
          yearToDateBudget,
          ytdDelta,
          annualBudget,
          annualDelta
        }
      })
  }, [expenseCategories, expenses, selectedYear, selectedMonth])

  // Compute income categories data (same logic as income-overview.tsx)
  const incomeCategoriesData = useMemo(() => {
    return incomeCategories
      .filter((category) => !category.isArchived)
      .map((category) => {
        // Current monthly income
        const monthlyIncome = incomes
          .filter((income) => {
            const incomeDate = new Date(income.date)
            return (
              incomeDate.getFullYear() === selectedYear &&
              incomeDate.getMonth() === selectedMonth &&
              income.categoryId === category.id
            )
          })
          .reduce((total, income) => total + (income.amount || 0), 0)

        // Year-to-date income
        const yearToDateIncome = incomes
          .filter((income) => {
            const incomeDate = new Date(income.date)
            return (
              incomeDate.getFullYear() === selectedYear &&
              incomeDate.getMonth() <= selectedMonth &&
              income.categoryId === category.id
            )
          })
          .reduce((total, income) => total + (income.amount || 0), 0)

        // Annual income
        const annualIncome = incomes
          .filter((income) => {
            const incomeDate = new Date(income.date)
            return (
              incomeDate.getFullYear() === selectedYear &&
              income.categoryId === category.id
            )
          })
          .reduce((total, income) => total + (income.amount || 0), 0)

        return {
          name: category.title,
          current: monthlyIncome,
          yearToDate: yearToDateIncome,
          annual: annualIncome
        }
      })
  }, [incomeCategories, incomes, selectedYear, selectedMonth])

  // Compute investment data (same logic as investment-overview.tsx)
  const investmentData = useMemo(() => {
    const activeInvestments = investments.filter((investment) => investment.isActive)

    const investmentRows = activeInvestments.map((investment) => {
      const currentValue = getLatestValue(investment.id)
      const totalContributions = getTotalContributions(investment.id)
      const profit = currentValue !== null ? currentValue - totalContributions : 0
      const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

      return {
        name: investment.name,
        currentValue,
        totalContributions,
        profit,
        profitPercentage
      }
    })

    // Calculate totals
    const totalValue = investmentRows.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
    const totalInvested = investmentRows.reduce((sum, inv) => sum + inv.totalContributions, 0)
    const totalPL = totalValue - totalInvested
    const totalPLPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0

    return {
      rows: investmentRows,
      totalValue,
      totalInvested,
      totalPL,
      totalPLPercentage
    }
  }, [investments, getLatestValue, getTotalContributions])

  // Build CSV content
  const buildCSVContent = useCallback(() => {
    const lines: string[] = []

    // SECTION 1: YTD Overview
    lines.push('SECTION: YTD Overview')
    lines.push(createCSVRow(['Metric', 'Value']))
    lines.push(createCSVRow(['YTD Budget', formatNumberForCSV(ytdData.ytdBudget)]))
    lines.push(createCSVRow(['YTD Spent', formatNumberForCSV(ytdData.ytdSpent)]))
    lines.push(createCSVRow(['YTD Income', formatNumberForCSV(ytdData.ytdIncome)]))
    lines.push(createCSVRow(['Total Invested', formatNumberForCSV(ytdData.totalInvested)]))
    lines.push(createCSVRow(['Investment Value', formatNumberForCSV(ytdData.totalInvestmentValue)]))
    lines.push(createCSVRow(['YTD Savings', formatNumberForCSV(ytdData.ytdSavings)]))
    lines.push(createCSVRow(['Savings Rate', formatPercentForCSV(ytdData.ytdSavingsRate)]))
    lines.push('') // Blank line separator

    // SECTION 2: Expense Categories
    lines.push('SECTION: Expense Categories')
    lines.push(createCSVRow([
      'Category',
      'Current',
      'Monthly Budget',
      'Monthly Delta',
      'Year-to-Date',
      'YTD Budget',
      'YTD Delta',
      'Annual Budget',
      'Annual Delta'
    ]))
    expenseCategoriesData.forEach((cat) => {
      lines.push(createCSVRow([
        escapeCSVField(cat.name),
        formatNumberForCSV(cat.current),
        formatNumberForCSV(cat.monthlyBudget),
        formatDeltaForCSV(cat.monthlyDelta),
        formatNumberForCSV(cat.yearToDate),
        formatNumberForCSV(cat.yearToDateBudget),
        formatDeltaForCSV(cat.ytdDelta),
        formatNumberForCSV(cat.annualBudget),
        formatDeltaForCSV(cat.annualDelta)
      ]))
    })
    lines.push('') // Blank line separator

    // SECTION 3: Income Categories
    lines.push('SECTION: Income Categories')
    lines.push(createCSVRow(['Category', 'Current', 'Year-to-Date', 'Annual']))
    incomeCategoriesData.forEach((cat) => {
      lines.push(createCSVRow([
        escapeCSVField(cat.name),
        formatNumberForCSV(cat.current),
        formatNumberForCSV(cat.yearToDate),
        formatNumberForCSV(cat.annual)
      ]))
    })
    lines.push('') // Blank line separator

    // SECTION 4: Investments Table
    lines.push('SECTION: Investments')
    lines.push(createCSVRow(['Name', 'Current Value', 'Total Invested', 'P&L', 'P&L %']))
    investmentData.rows.forEach((inv) => {
      lines.push(createCSVRow([
        escapeCSVField(inv.name),
        formatNumberForCSV(inv.currentValue),
        formatNumberForCSV(inv.totalContributions),
        formatNumberForCSV(inv.profit),
        formatPercentValueForCSV(inv.profitPercentage)
      ]))
    })
    // Add TOTAL row
    lines.push(createCSVRow([
      'TOTAL',
      formatNumberForCSV(investmentData.totalValue),
      formatNumberForCSV(investmentData.totalInvested),
      formatNumberForCSV(investmentData.totalPL),
      formatPercentValueForCSV(investmentData.totalPLPercentage)
    ]))

    return lines.join('\n')
  }, [ytdData, expenseCategoriesData, incomeCategoriesData, investmentData])

  // Export function
  const exportToCSV = useCallback(() => {
    const csvContent = buildCSVContent()
    const dateForFilename = new Date(selectedYear, selectedMonth)
    const filename = `Dashboard-${format(dateForFilename, 'MMM-yyyy')}.csv`
    downloadCSV(csvContent, filename)
  }, [buildCSVContent, selectedYear, selectedMonth])

  return {
    exportToCSV
  }
}
