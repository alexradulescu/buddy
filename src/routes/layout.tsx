import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { Navigation } from '@/components/navigation'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--mantine-color-white)' }}>
          <Navigation />
          <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            paddingLeft: '5rem',
            backgroundColor: '#fafaf9',
            margin: '0.25rem',
            borderRadius: '0.125rem',
            border: '1px solid #f5f5f4'
          }}>
            {children}
          </main>
        </div>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
