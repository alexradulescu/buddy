import { createFileRoute } from '@tanstack/react-router'
import IncomesPage from '@/components/pages/incomes-page'

export const Route = createFileRoute('/incomes')({
  component: IncomesPage,
})
