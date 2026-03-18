import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell, Box } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const isMobile = useMediaQuery('(max-width: 48em)')

  return (
    <NuqsAdapter>
      <HeaderActionProvider>
        <AppShell
          header={{
            height: isMobile ? 'calc(60px + env(safe-area-inset-top, 0px))' : 60,
            offset: !isMobile,
          }}
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
              backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.72)' : '#FFFFFF',
              backdropFilter: isMobile ? 'blur(20px)' : 'none',
              WebkitBackdropFilter: isMobile ? 'blur(20px)' : 'none',
              borderBottom: isMobile ? '1px solid rgba(229, 233, 235, 0.6)' : '1px solid #E5E9EB',
              paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : 0,
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
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <MobileNav />
          </AppShell.Footer>

          {/* Main content */}
          <AppShell.Main
            style={{
              backgroundColor: '#F8FAFB',
              ...(isMobile && {
                paddingTop: 'calc(60px + env(safe-area-inset-top, 0px) + var(--mantine-spacing-md))',
              }),
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
