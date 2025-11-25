import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { DesktopNav, MobileNav } from '@/components/navigation'
import { AppShell, Group } from '@mantine/core'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <AppShell
          navbar={{
            width: 56,
            breakpoint: 'sm'
          }}
          footer={{
            height: 64
          }}
          padding="md"
          withBorder={false}
        >
          {/* Desktop sidebar navigation - automatically shown on sm+ */}
          <AppShell.Navbar
            style={(theme) => ({
              borderRight: `1px solid ${theme.colors.gray[2]}`
            })}
          >
            <DesktopNav />
          </AppShell.Navbar>

          {/* Mobile bottom navigation - manually controlled */}
          <AppShell.Footer
            hiddenFrom="sm"
            style={(theme) => ({
              borderTop: `1px solid ${theme.colors.gray[2]}`
            })}
          >
            <Group gap={0} h="100%" align="center">
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
