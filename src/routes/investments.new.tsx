import { createFileRoute } from '@tanstack/react-router'
import NewInvestmentPage from '@/components/pages/new-investment-page'

export const Route = createFileRoute('/investments/new')({
  component: NewInvestmentPage,
})
