import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell, Group, Box } from '@mantine/core'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <NuqsAdapter>
      <HeaderActionProvider>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 56,
            breakpoint: 'sm',
            collapsed: { mobile: true },
          }}
          footer={{
            height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
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
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
              <Outlet />
            </Box>
          </AppShell.Main>
        </AppShell>
      </HeaderActionProvider>
    </NuqsAdapter>
  )
}
