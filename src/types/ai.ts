export interface ExpenseCategory {
  id: string
  name: string
}

export interface HistoricalExpense {
  description: string
  categoryId: string
  amount: number
}

export interface ParsedExpense {
  amount: number
  categoryId: string
  date: string
  description: string
}
