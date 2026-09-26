import type {
  Expense,
  ExpenseCategory,
  Income,
  IncomeCategory,
  Investment,
  InvestmentContribution,
  InvestmentValue
} from '@/db'

// Dates are 'yyyy-MM-dd' strings and months are 0-based, so we compare string prefixes.
type Dated = { date: string }
type Amount = Dated & { amount: number }

export const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`
export const inYear = (d: Dated, year: number) => d.date.startsWith(`${year}-`)
export const inMonth = (d: Dated, year: number, month: number) => d.date.startsWith(monthKey(year, month))
export const inYtd = (d: Dated, year: number, month: number) =>
  inYear(d, year) && d.date.slice(0, 7) <= monthKey(year, month)

export const sum = (rows: { amount: number }[]) => rows.reduce((total, r) => total + (r.amount || 0), 0)
export const monthTotal = <T extends Amount>(rows: T[], year: number, month: number) =>
  sum(rows.filter((r) => inMonth(r, year, month)))
export const ytdTotal = <T extends Amount>(rows: T[], year: number, month: number) =>
  sum(rows.filter((r) => inYtd(r, year, month)))

export const prevMonth = (year: number, month: number) =>
  month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }

// An annual budget of 0 means "not set", so fall back to 12 monthly budgets
export const annualBudget = (c: ExpenseCategory) => c.maxAnnualBudget || c.maxBudget * 12

export function expenseCategoryRows(expenses: Expense[], categories: ExpenseCategory[], year: number, month: number) {
  return categories
    .filter((c) => !c.isArchived)
    .map((category) => {
      const own = expenses.filter((e) => e.categoryId === category.id)
      const spent = { month: monthTotal(own, year, month), ytd: ytdTotal(own, year, month) }
      const annualSpent = sum(own.filter((e) => inYear(e, year)))
      const budget = {
        month: category.maxBudget,
        ytd: category.maxBudget * (month + 1),
        annual: annualBudget(category)
      }
      // Positive delta = under budget
      const delta = {
        month: budget.month - spent.month,
        ytd: budget.ytd - spent.ytd,
        annual: budget.annual - annualSpent
      }
      return { category, spent, budget, delta }
    })
}

export function incomeCategoryRows(incomes: Income[], categories: IncomeCategory[], year: number, month: number) {
  return categories.map((category) => {
    const own = incomes.filter((i) => i.categoryId === category.id)
    return {
      category,
      month: monthTotal(own, year, month),
      ytd: ytdTotal(own, year, month),
      annual: sum(own.filter((i) => inYear(i, year)))
    }
  })
}

export function latestValue(values: InvestmentValue[], investmentId: string): number | null {
  const own = values.filter((v) => v.investmentId === investmentId)
  if (own.length === 0) return null
  return own.reduce((latest, v) => (v.date > latest.date ? v : latest)).value
}

export const totalContributed = (contributions: InvestmentContribution[], investmentId: string) =>
  sum(contributions.filter((c) => c.investmentId === investmentId))

export function investmentStats(
  investment: Investment,
  contributions: InvestmentContribution[],
  values: InvestmentValue[]
) {
  const value = latestValue(values, investment.id)
  const invested = totalContributed(contributions, investment.id)
  const profit = value === null ? 0 : value - invested
  return { investment, value, invested, profit, returnRate: invested > 0 ? profit / invested : 0 }
}

// Active investments only
export function portfolio(
  investments: Investment[],
  contributions: InvestmentContribution[],
  values: InvestmentValue[]
) {
  const rows = investments.filter((i) => i.isActive).map((i) => investmentStats(i, contributions, values))
  const value = rows.reduce((total, r) => total + (r.value ?? 0), 0)
  const invested = rows.reduce((total, r) => total + r.invested, 0)
  const profit = value - invested
  return { rows, value, invested, profit, returnRate: invested > 0 ? profit / invested : 0 }
}

type Data = {
  expenses: Expense[]
  incomes: Income[]
  expenseCategories: ExpenseCategory[]
  investments: Investment[]
  contributions: InvestmentContribution[]
  values: InvestmentValue[]
}

export function ytdSummary(d: Data, year: number, month: number) {
  const income = ytdTotal(d.incomes, year, month)
  // Money moved into investments is not "spent"
  const spent = ytdTotal(d.expenses, year, month) - ytdTotal(d.contributions, year, month)
  const budget =
    sum(d.expenseCategories.filter((c) => !c.isArchived).map((c) => ({ amount: c.maxBudget }))) * (month + 1)
  const savings = income - spent
  return {
    budget,
    spent,
    income,
    totalInvested: sum(d.contributions),
    investmentValue: portfolio(d.investments, d.contributions, d.values).value,
    savings,
    savingsRate: income > 0 ? savings / income : 0
  }
}

// Monthly chart points: cumulative contributions vs latest known value
export function performanceSeries(contributions: InvestmentContribution[], values: InvestmentValue[]) {
  const months = [...new Set([...contributions, ...values].map((r) => r.date.slice(0, 7)))].sort()
  return months.map((m) => {
    const known = values.filter((v) => v.date.slice(0, 7) <= m)
    const latest = known.length ? known.reduce((a, b) => (b.date > a.date ? b : a)).value : null
    return {
      month: new Date(`${m}-01T00:00`).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      contributions: sum(contributions.filter((c) => c.date.slice(0, 7) <= m)),
      value: latest
    }
  })
}
