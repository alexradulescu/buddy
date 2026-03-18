import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell } from '@mantine/core'

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
          padding="md"
          withBorder={false}
          styles={{
            root: { backgroundColor: '#F8FAFB' },
          }}
        >
          <AppShell.Header>
            <AppHeader />
          </AppShell.Header>

          <AppShell.Navbar
            style={{
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E9EB',
            }}
          >
            <DesktopNav />
          </AppShell.Navbar>

          <AppShell.Main style={{ backgroundColor: '#F8FAFB' }}>
            <div className="scrollable-zone root-scroll-content">
              <Outlet />
            </div>
          </AppShell.Main>
        </AppShell>

        {/*
         * Mobile bottom nav lives OUTSIDE AppShell so it is a true fixed
         * overlay — not part of the document flow that AppShell manages.
         * Hidden on desktop via CSS (.mobile-nav-bar display:none at sm+).
         */}
        <div className="mobile-nav-bar">
          <MobileNav />
        </div>
      </HeaderActionProvider>
    </NuqsAdapter>
  )
}
