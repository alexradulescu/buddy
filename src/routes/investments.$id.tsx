import { createFileRoute } from '@tanstack/react-router'
import InvestmentDetailPage from '@/components/pages/investment-detail-page'

export const Route = createFileRoute('/investments/$id')({
  component: InvestmentDetailPage,
})
