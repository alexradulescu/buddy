import type { ReactNode } from 'react'
import { ActionIcon, AppShell, Box, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
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

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 56, breakpoint: 'sm', collapsed: { mobile: true } }}
      footer={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      padding="md"
      withBorder={false}
      bg="var(--color-page-background)"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Title order={1} size="h4" fw={600}>
            {nav.find((n) => n.href === pathname)?.title ?? 'Buddy'}
          </Title>
          <MonthPicker />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="var(--color-surface)" className="desktop-sidebar">
        <Stack gap="xs" p="xs" align="center">
          {nav.map((item) => (
            <Tooltip key={item.href} label={item.label} position="right">
              <Link
                to={item.href}
                search={search}
                className="navigation-link desktop-sidebar-link"
                data-active={pathname === item.href || undefined}
              >
                <item.icon size={18} strokeWidth={pathname === item.href ? 2 : 1.5} />
              </Link>
            </Tooltip>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Footer hiddenFrom="sm" className="mobile-bottom-navigation-bar">
        <Box className="mobile-bottom-navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              search={search}
              className="navigation-link mobile-bottom-navigation-link"
              data-active={pathname === item.href || undefined}
            >
              <item.icon size={22} strokeWidth={pathname === item.href ? 2 : 1.5} />
              <Text fw={pathname === item.href ? 600 : 400} fz={10} lh={1.2} c="inherit">
                {item.label}
              </Text>
            </Link>
          ))}
        </Box>
      </AppShell.Footer>

      <AppShell.Main bg="var(--color-page-background)">
        <Box className="scrollable-page-content" h="100%">
          {children}
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
      <ActionIcon size="lg" radius={0} aria-label="Previous month" onClick={() => go(new Date(year, month - 1))}>
        <ChevronLeft size={16} strokeWidth={1.5} />
      </ActionIcon>
      <MonthPickerInput
        value={new Date(year, month)}
        onChange={(value) => value && go(new Date(value))}
        valueFormat="MMM YY"
        w={76}
      />
      <ActionIcon size="lg" radius={0} aria-label="Next month" onClick={() => go(new Date(year, month + 1))}>
        <ChevronRight size={16} strokeWidth={1.5} />
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
