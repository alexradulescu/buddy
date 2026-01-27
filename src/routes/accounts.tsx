import { createFileRoute } from '@tanstack/react-router'
import AccountsPage from '@/components/pages/accounts-page'

export const Route = createFileRoute('/accounts')({
  component: AccountsPage,
})
