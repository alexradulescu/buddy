import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import InvestmentsPage from '@/components/pages/investments-page'

export const Route = createFileRoute('/investments/')({
  validateSearch,
  component: InvestmentsPage,
})
