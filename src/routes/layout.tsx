import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { AppShell, Group, Box } from '@mantine/core'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <HeaderActionProvider>
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
              backgroundColor: '#F8FAFB',
            },
          }}
        >
          {/* Header */}
          <AppShell.Header
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E5E9EB',
            }}
          >
            <AppHeader />
          </AppShell.Header>

          {/* Desktop sidebar */}
          <AppShell.Navbar
            style={{
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E9EB',
            }}
          >
            <DesktopNav />
          </AppShell.Navbar>

          {/* Mobile bottom navigation */}
          <AppShell.Footer
            hiddenFrom="sm"
            style={{
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E5E9EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Group gap={0} h="100%" align="center" style={{ width: '100%' }}>
              <MobileNav />
            </Group>
          </AppShell.Footer>

          {/* Main content */}
          <AppShell.Main
            style={{
              backgroundColor: '#F8FAFB',
            }}
          >
            <Box className="scrollable-zone" style={{ height: '100%' }}>
              {children}
            </Box>
          </AppShell.Main>
          </AppShell>
        </HeaderActionProvider>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
