import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell, Group, Box } from '@mantine/core'

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
          styles={{
            root: {
              backgroundColor: '#FAF8F5',
            },
          }}
        >
          {/* Header with elegant border */}
          <AppShell.Header
            style={{
              backgroundColor: '#FAF8F5',
              borderBottom: '1px solid rgba(28, 28, 28, 0.06)',
            }}
          >
            <AppHeader />
          </AppShell.Header>

          {/* Desktop sidebar with subtle accent */}
          <AppShell.Navbar
            style={{
              backgroundColor: '#F5F2ED',
              borderRight: '1px solid rgba(28, 28, 28, 0.06)',
            }}
          >
            <DesktopNav />
          </AppShell.Navbar>

          {/* Mobile bottom navigation */}
          <AppShell.Footer
            hiddenFrom="sm"
            style={{
              backgroundColor: '#FAF8F5',
              borderTop: '1px solid rgba(28, 28, 28, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Group gap={0} h="100%" align="center" style={{ width: '100%' }}>
              <MobileNav />
            </Group>
          </AppShell.Footer>

          {/* Main content area with scrollable zone */}
          <AppShell.Main
            style={{
              backgroundColor: '#F5F2ED',
            }}
          >
            <Box className="scrollable-zone" style={{ height: '100%' }}>
              {children}
            </Box>
          </AppShell.Main>
        </AppShell>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
