import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { HeaderActionProvider } from '@/contexts/header-action-context'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppHeader } from '@/components/app-header'
import { AppShell, Group, Box } from '@mantine/core'
import { theme } from '@/theme'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@/globals.css'

export const Route = createRootRoute({
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <title>Buddy</title>
        <meta name="description" content="Personal finance management" />
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          <RootLayout />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
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
  )
}
