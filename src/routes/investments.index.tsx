import { createFileRoute } from '@tanstack/react-router'
import InvestmentsPage from '@/components/pages/investments-page'

export const Route = createFileRoute('/investments/')({
  component: InvestmentsPage,
})
