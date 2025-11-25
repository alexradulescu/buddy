import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell, Group } from '@mantine/core'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 56,
            breakpoint: 'sm',
            collapsed: { mobile: true }
          }}
          footer={{
            height: 64
          }}
          padding="md"
          withBorder={false}
        >
          {/* Header with page title and month picker */}
          <AppShell.Header
            style={(theme) => ({
              borderBottom: `1px solid ${theme.colors.gray[2]}`
            })}
          >
            <AppHeader />
          </AppShell.Header>

          {/* Desktop sidebar navigation */}
          <AppShell.Navbar
            style={(theme) => ({
              borderRight: `1px solid ${theme.colors.gray[2]}`
            })}
          >
            <DesktopNav />
          </AppShell.Navbar>

          {/* Mobile bottom navigation */}
          <AppShell.Footer
            hiddenFrom="sm"
            style={(theme) => ({
              borderTop: `1px solid ${theme.colors.gray[2]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            })}
          >
            <Group gap={0} h="100%" align="center" style={{ width: '100%' }}>
              <MobileNav />
            </Group>
          </AppShell.Footer>

          {/* Main content area */}
          <AppShell.Main bg="gray.0">
            {children}
          </AppShell.Main>
        </AppShell>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
