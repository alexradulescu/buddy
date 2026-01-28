import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import HomePage from '@/components/pages/home-page'

export const Route = createFileRoute('/')({
  validateSearch,
  component: HomePage,
})
