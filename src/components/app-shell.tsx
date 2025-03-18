'use client'

import { MantineProvider, MantineTheme, createTheme } from '@mantine/core'

import { AppShell } from '@mantine/core'
import { DesktopNavigation, MobileNavigation } from '@/components/navigation'
import { Notifications } from '@mantine/notifications'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const theme = createTheme({
    fontFamily: 'var(--font-geist-sans)',
    fontFamilyMonospace: 'var(--font-geist-mono)',
    components: {
      DatePicker: {
        styles: {
          calendar: { minWidth: 280 },
          calendarHeader: { marginBottom: 10 },
          day: { borderRadius: 4 }
        }
      },
      Table: {
        styles: {
          td: { fontVariantNumeric: 'tabular-nums' }
        }
      },
      Text: {
        styles: (theme: MantineTheme) => ({
          root: {
            '&[data-numeric=true]': {
              fontFamily: 'var(--font-geist-mono)',
              fontVariantNumeric: 'tabular-nums'
            }
          }
        })
      }
    }
  })

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <NuqsAdapter>
        <MantineProvider theme={theme}>
          <AppShell
        padding="md"
        navbar={{
            width: 80,
            breakpoint: 'sm'
        }}
        >
        <AppShell.Navbar w='64px' display={{ base: 'none', sm: 'block' }} >
            <DesktopNavigation />
        </AppShell.Navbar>
        <AppShell.Main
            style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderRadius: 'var(--mantine-radius-sm)',
            margin: '4px',
            border: '1px solid var(--mantine-color-gray-2)'
            }}
            styles={{
              main: () => ({
                '@media (max-width: 48em)': {
                  paddingBottom: 'calc(var(--mantine-spacing-xl) * 2)'
                }
              })
            }}
        >
            {children}
        </AppShell.Main>
        </AppShell>
            <Notifications position="top-right" zIndex={1000} />
            <MobileNavigation />
        </MantineProvider>
      </NuqsAdapter>
    )
}