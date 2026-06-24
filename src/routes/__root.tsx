import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { AppShell, Box, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { theme } from '@/theme'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@/globals.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Buddy' },
    ],
  }),
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
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
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  )
}
