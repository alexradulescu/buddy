import { createFileRoute } from '@tanstack/react-router'
import ExpensesPage from '@/components/pages/expenses-page'

export const Route = createFileRoute('/expenses')({
  component: ExpensesPage,
})
