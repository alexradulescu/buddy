import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

import { Shell } from '@/components/shell'

export const Route = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Shell>
        <Outlet />
      </Shell>
    </NuqsAdapter>
  )
})
