import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import IncomesPage from '@/components/pages/incomes-page'

export const Route = createFileRoute('/incomes')({
  validateSearch,
  component: IncomesPage,
})
