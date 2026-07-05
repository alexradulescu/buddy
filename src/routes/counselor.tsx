import { createFileRoute } from '@tanstack/react-router'
import CounselorPage from '@/components/pages/counselor-page'

export const Route = createFileRoute('/counselor')({
  component: CounselorPage,
})
