import { format } from 'date-fns'
import type { Expense, ExpenseCategory, Income, IncomeCategory, AccountBalance } from '@/stores/instantdb'
import type { Investment, InvestmentContribution, InvestmentValue } from '@/types/investment'
import {
  formatNumberForCSV,
  formatDeltaForCSV,
  escapeCSVField,
  createCSVRow
} from '@/utils/csv-export'

interface CounselorDataParams {
  fromMonth: number
  fromYear: number
  toMonth: number
  toYear: number
  expenses: Expense[]
  incomes: Income[]
  expenseCategories: ExpenseCategory[]
  incomeCategories: IncomeCategory[]
  investments: Investment[]
  investmentContributions: InvestmentContribution[]
  investmentValues: InvestmentValue[]
  accountBalances: AccountBalance[]
}

function getMonthsInRange(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
  const months: Array<{ month: number; year: number }> = []
  let m = fromMonth
  let y = fromYear
  while (y < toYear || (y === toYear && m <= toMonth)) {
    months.push({ month: m, year: y })
    if (m === 11) {
      m = 0
      y++
    } else {
      m++
    }
  }
  return months
}

function formatMonthSection(
  month: number,
  year: number,
  expenses: Expense[],
  incomes: Income[],
  expenseCategories: ExpenseCategory[],
  incomeCategories: IncomeCategory[],
  accountBalances: AccountBalance[]
): string {
  const lines: string[] = []
  const label = format(new Date(year, month), 'MMMM yyyy').toUpperCase()

  lines.push(`=== ${label} ===`)
  lines.push('')

  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const monthIncomes = incomes
    .filter((i) => {
      const d = new Date(i.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalIncome = monthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0)
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const net = totalIncome - totalExpenses

  // Monthly overview
  lines.push('SECTION: Monthly Overview')
  lines.push(createCSVRow(['Metric', 'Value']))
  lines.push(createCSVRow(['Total Income', formatNumberForCSV(totalIncome)]))
  lines.push(createCSVRow(['Total Expenses', formatNumberForCSV(totalExpenses)]))
  lines.push(createCSVRow(['Net', formatNumberForCSV(net)]))
  lines.push('')

  // Expense categories breakdown
  const activeExpenseCategories = expenseCategories.filter((c) => !c.isArchived)
  lines.push('SECTION: Expense Categories')
  lines.push(createCSVRow(['Category', 'Amount', 'Monthly Budget', 'Budget Delta']))
  activeExpenseCategories.forEach((cat) => {
    const amount = monthExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    if (amount === 0 && !cat.maxBudget) return
    const delta = cat.maxBudget !== undefined ? cat.maxBudget - amount : undefined
    lines.push(createCSVRow([
      escapeCSVField(cat.name),
      formatNumberForCSV(amount),
      formatNumberForCSV(cat.maxBudget),
      formatDeltaForCSV(delta)
    ]))
  })
  lines.push('')

  // All expenses
  lines.push(`SECTION: All Expenses (${format(new Date(year, month), 'MMMM yyyy')})`)
  lines.push(createCSVRow(['Date', 'Category', 'Description', 'Amount']))
  if (monthExpenses.length === 0) {
    lines.push('(no expenses)')
  } else {
    monthExpenses.forEach((e) => {
      const catName = expenseCategories.find((c) => c.id === e.categoryId)?.name ?? ''
      lines.push(createCSVRow([e.date, escapeCSVField(catName), escapeCSVField(e.description), formatNumberForCSV(e.amount)]))
    })
  }
  lines.push('')

  // Income categories breakdown
  const activeIncomeCategories = incomeCategories.filter((c) => !c.isArchived)
  lines.push('SECTION: Income Categories')
  lines.push(createCSVRow(['Category', 'Amount']))
  activeIncomeCategories.forEach((cat) => {
    const amount = monthIncomes
      .filter((i) => i.categoryId === cat.id)
      .reduce((sum, i) => sum + (i.amount || 0), 0)
    if (amount === 0) return
    lines.push(createCSVRow([escapeCSVField(cat.title), formatNumberForCSV(amount)]))
  })
  lines.push('')

  // All incomes
  lines.push(`SECTION: All Incomes (${format(new Date(year, month), 'MMMM yyyy')})`)
  lines.push(createCSVRow(['Date', 'Category', 'Description', 'Amount']))
  if (monthIncomes.length === 0) {
    lines.push('(no income)')
  } else {
    monthIncomes.forEach((i) => {
      const catName = incomeCategories.find((c) => c.id === i.categoryId)?.title ?? ''
      lines.push(createCSVRow([i.date, escapeCSVField(catName), escapeCSVField(i.description), formatNumberForCSV(i.amount)]))
    })
  }
  lines.push('')

  // Account balances for this month
  const monthBalances = accountBalances.filter((b) => b.year === year && b.month === month)
  if (monthBalances.length > 0) {
    lines.push('SECTION: Account Balances')
    lines.push(createCSVRow(['Account', 'Balance']))
    monthBalances.forEach((b) => {
      lines.push(createCSVRow([escapeCSVField(b.title), formatNumberForCSV(b.amount)]))
    })
    lines.push('')
  }

  return lines.join('\n')
}

export function formatCounselorData(params: CounselorDataParams): string {
  const {
    fromMonth, fromYear, toMonth, toYear,
    expenses, incomes, expenseCategories, incomeCategories,
    investments, investmentContributions, investmentValues,
    accountBalances
  } = params

  const months = getMonthsInRange(fromMonth, fromYear, toMonth, toYear)
  const fromLabel = format(new Date(fromYear, fromMonth), 'MMMM yyyy')
  const toLabel = format(new Date(toYear, toMonth), 'MMMM yyyy')

  const lines: string[] = []
  lines.push(`=== FINANCIAL REPORT: ${fromLabel} to ${toLabel} ===`)
  lines.push('Currency: SGD')
  lines.push('')

  months.forEach(({ month, year }) => {
    lines.push(formatMonthSection(month, year, expenses, incomes, expenseCategories, incomeCategories, accountBalances))
  })

  // Investment portfolio (current state, not month-specific)
  const activeInvestments = investments.filter((inv) => inv.isActive)
  if (activeInvestments.length > 0) {
    lines.push('=== INVESTMENTS (Current Portfolio) ===')
    lines.push(createCSVRow(['Name', 'Current Value', 'Total Invested', 'P&L', 'P&L %']))

    let totalValue = 0
    let totalInvested = 0

    activeInvestments.forEach((inv) => {
      const contributions = investmentContributions.filter((c) => c.investmentId === inv.id)
      const values = investmentValues.filter((v) => v.investmentId === inv.id)

      const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
      const latestValue = values.length > 0
        ? [...values].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
        : 0

      const pl = latestValue - totalContributions
      const plPct = totalContributions > 0 ? (pl / totalContributions) * 100 : 0

      totalValue += latestValue
      totalInvested += totalContributions

      lines.push(createCSVRow([
        escapeCSVField(inv.name),
        formatNumberForCSV(latestValue),
        formatNumberForCSV(totalContributions),
        formatNumberForCSV(pl),
        `${plPct.toFixed(2)}%`
      ]))
    })

    const totalPL = totalValue - totalInvested
    const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0
    lines.push(createCSVRow([
      'TOTAL',
      formatNumberForCSV(totalValue),
      formatNumberForCSV(totalInvested),
      formatNumberForCSV(totalPL),
      `${totalPLPct.toFixed(2)}%`
    ]))
  }

  return lines.join('\n')
}
