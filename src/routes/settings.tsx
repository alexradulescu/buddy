import { createFileRoute } from '@tanstack/react-router'
import { validateSearch } from '@/hooks/use-shared-query-params'
import SettingsPage from '@/components/pages/settings-page'

export const Route = createFileRoute('/settings')({
  validateSearch,
  component: SettingsPage,
})
