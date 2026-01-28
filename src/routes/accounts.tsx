import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import AccountsPage from '@/components/pages/accounts-page'

export const Route = createFileRoute('/accounts')({
  validateSearch,
  component: AccountsPage,
})
