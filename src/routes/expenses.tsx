import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import ExpensesPage from '@/components/pages/expenses-page'

export const Route = createFileRoute('/expenses')({
  validateSearch,
  component: ExpensesPage,
})
