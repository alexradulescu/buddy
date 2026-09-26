import type { ReactNode } from 'react'
import { ActionIcon, AppShell, Box, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import { Link, useRouterState } from '@tanstack/react-router'
import { BarChart2, ChevronLeft, ChevronRight, CreditCard, Home, PiggyBank, Settings, TrendingUp } from 'lucide-react'

import { useMonth } from '@/hooks/use-month'

const nav = [
  { href: '/', label: 'Home', title: 'Budget Overview', icon: Home },
  { href: '/expenses', label: 'Expenses', title: 'Expenses', icon: CreditCard },
  { href: '/incomes', label: 'Incomes', title: 'Incomes', icon: PiggyBank },
  { href: '/investments', label: 'Investments', title: 'Investments', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', title: 'Accounts', icon: BarChart2 },
  { href: '/settings', label: 'Settings', title: 'Settings', icon: Settings }
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { year, month } = useMonth()
  const search = { year, month } as never

  // Labels show beside icons on wide screens, so tooltips are only needed on the narrow rail
  const wideSidebar = useMediaQuery('(min-width: 75em)')
  const current = nav.find((n) => n.href === pathname) ?? nav.find((n) => n.href !== '/' && pathname.startsWith(n.href))

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{ width: { sm: 64, lg: 212 }, breakpoint: 'sm', collapsed: { mobile: true } }}
      footer={{ height: 'calc(50px + env(safe-area-inset-bottom, 0px))' }}
      padding="md"
      withBorder={false}
      bg="var(--color-page-background)"
    >
      <AppShell.Header className="toolbar">
        <Group justify="space-between" h="100%" px="md" wrap="nowrap">
          <Title order={1} className="toolbar-title">
            {current?.title ?? 'Buddy'}
          </Title>
          <MonthPicker />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="desktop-sidebar">
        <Text className="sidebar-app-name">Buddy</Text>
        <Stack gap={2} px={10}>
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Tooltip key={item.href} label={item.label} position="right" disabled={wideSidebar}>
                <Link
                  to={item.href}
                  search={search}
                  className="navigation-link desktop-sidebar-link"
                  data-active={active || undefined}
                >
                  <item.icon size={17} strokeWidth={active ? 2.2 : 1.8} className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </Tooltip>
            )
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Footer hiddenFrom="sm" className="tab-bar">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              search={search}
              className="tab-bar-item"
              data-active={active || undefined}
            >
              <item.icon size={24} strokeWidth={active ? 2.2 : 1.6} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </AppShell.Footer>

      <AppShell.Main bg="var(--color-page-background)">
        <Box className="scrollable-page-content" h="100%">
          <Box className="page-content">{children}</Box>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}

function MonthPicker() {
  const { year, month, setYear, setMonth } = useMonth()

  const go = (date: Date) => {
    setYear(date.getFullYear())
    setMonth(date.getMonth())
  }

  return (
    <Group gap={0} wrap="nowrap" className="header-month-picker">
      <ActionIcon size="md" aria-label="Previous month" onClick={() => go(new Date(year, month - 1))}>
        <ChevronLeft size={16} strokeWidth={2.2} />
      </ActionIcon>
      <MonthPickerInput
        value={new Date(year, month)}
        onChange={(value) => value && go(new Date(value))}
        valueFormat="MMM YYYY"
        w={88}
      />
      <ActionIcon size="md" aria-label="Next month" onClick={() => go(new Date(year, month + 1))}>
        <ChevronRight size={16} strokeWidth={2.2} />
      </ActionIcon>
    </Group>
  )
}

// Top row of a page: optional title on the left, the page's own actions on the right
export function PageHeader({ title, actions }: { title?: string; actions?: ReactNode }) {
  return (
    <Group justify={title ? 'space-between' : 'flex-end'} mb="sm" wrap="nowrap">
      {title && (
        <Title order={2} size="h3">
          {title}
        </Title>
      )}
      <Group gap="sm" wrap="nowrap">
        {actions}
      </Group>
    </Group>
  )
}
