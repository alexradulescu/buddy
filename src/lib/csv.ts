import { expenseCategoryRows, inMonth, incomeCategoryRows, portfolio, ytdSummary } from '@/lib/finance'
import { formatPercent, monthLabel } from '@/lib/format'

import type {
  Expense,
  ExpenseCategory,
  Income,
  IncomeCategory,
  Investment,
  InvestmentContribution,
  InvestmentValue
} from '@/db'

export type ExportData = {
  expenses: Expense[]
  incomes: Income[]
  expenseCategories: ExpenseCategory[]
  incomeCategories: IncomeCategory[]
  investments: Investment[]
  contributions: InvestmentContribution[]
  values: InvestmentValue[]
}

type Cell = string | number | null | undefined

const num = (n: number | null | undefined) => (n == null ? 'N/A' : n.toFixed(2))
const delta = (n: number) => `(${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(2)})`
const escape = (cell: Cell) => {
  const s = cell == null ? '' : String(cell)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const row = (cells: Cell[]) => cells.map(escape).join(',')
const section = (title: string, header: string[], rows: Cell[][]) => [
  `SECTION: ${title}`,
  row(header),
  ...rows.map(row)
]

export function overviewCSV(d: ExportData, year: number, month: number) {
  const ytd = ytdSummary(d, year, month)
  const expenseRows = expenseCategoryRows(d.expenses, d.expenseCategories, year, month)
  const incomeRows = incomeCategoryRows(
    d.incomes,
    d.incomeCategories.filter((c) => !c.isArchived),
    year,
    month
  )
  const p = portfolio(d.investments, d.contributions, d.values)

  return [
    ...section(
      'YTD Overview',
      ['Metric', 'Value'],
      [
        ['YTD Budget', num(ytd.budget)],
        ['YTD Spent', num(ytd.spent)],
        ['YTD Income', num(ytd.income)],
        ['Total Invested', num(ytd.totalInvested)],
        ['Investment Value', num(ytd.investmentValue)],
        ['YTD Savings', num(ytd.savings)],
        ['Savings Rate', formatPercent(ytd.savingsRate)]
      ]
    ),
    '',
    ...section(
      'Expense Categories',
      [
        'Category',
        'Current',
        'Monthly Budget',
        'Monthly Delta',
        'Year-to-Date',
        'YTD Budget',
        'YTD Delta',
        'Annual Budget',
        'Annual Delta'
      ],
      expenseRows.map((r) => [
        r.category.name,
        num(r.spent.month),
        num(r.budget.month),
        delta(r.delta.month),
        num(r.spent.ytd),
        num(r.budget.ytd),
        delta(r.delta.ytd),
        num(r.budget.annual),
        delta(r.delta.annual)
      ])
    ),
    '',
    ...section(
      'Income Categories',
      ['Category', 'Current', 'Year-to-Date', 'Annual'],
      incomeRows.map((r) => [r.category.title, num(r.month), num(r.ytd), num(r.annual)])
    ),
    '',
    ...section(
      'Investments',
      ['Name', 'Current Value', 'Total Invested', 'P&L', 'P&L %'],
      [
        ...p.rows.map((r) => [
          r.investment.name,
          num(r.value),
          num(r.invested),
          num(r.profit),
          formatPercent(r.returnRate, 2)
        ]),
        ['TOTAL', num(p.value), num(p.invested), num(p.profit), formatPercent(p.returnRate, 2)]
      ]
    )
  ].join('\n')
}

// Overview plus every expense and income of the selected month
export function fullCSV(d: ExportData, year: number, month: number) {
  const label = monthLabel(year, month)
  const transactions = (rows: (Expense | Income)[], categoryName: (id: string) => string | undefined) =>
    rows
      .filter((r) => inMonth(r, year, month))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [r.date, categoryName(r.categoryId) ?? '', r.description, num(r.amount)])

  return [
    overviewCSV(d, year, month),
    '',
    ...section(
      `All Expenses (${label})`,
      ['Date', 'Category', 'Description', 'Amount'],
      transactions(d.expenses, (id) => d.expenseCategories.find((c) => c.id === id)?.name)
    ),
    '',
    ...section(
      `All Incomes (${label})`,
      ['Date', 'Category', 'Description', 'Amount'],
      transactions(d.incomes, (id) => d.incomeCategories.find((c) => c.id === id)?.title)
    )
  ].join('\n')
}

export function downloadCSV(content: string, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
