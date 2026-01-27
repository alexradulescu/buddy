import { createFileRoute } from '@tanstack/react-router'
import EditInvestmentPage from '@/components/pages/edit-investment-page'

export const Route = createFileRoute('/investments/$id/edit')({
  component: EditInvestmentPage,
})
