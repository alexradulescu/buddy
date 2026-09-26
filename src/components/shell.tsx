import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ActionIcon, AppShell, Box, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import { Link, useRouterState } from '@tanstack/react-router'
import { BarChart2, ChevronLeft, ChevronRight, CreditCard, Home, PiggyBank, Settings, TrendingUp } from 'lucide-react'

import { useMonth } from '@/hooks/use-month'

const nav = [
  { href: '/', label: 'Home', title: 'Overview', icon: Home } as {
    href: string
    label: string
    short?: string
    title: string
    icon: typeof Home
  },
  { href: '/expenses', label: 'Expenses', title: 'Expenses', icon: CreditCard },
  { href: '/incomes', label: 'Incomes', title: 'Incomes', icon: PiggyBank },
  { href: '/investments', label: 'Investments', short: 'Invest', title: 'Investments', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', title: 'Accounts', icon: BarChart2 },
  { href: '/settings', label: 'Settings', title: 'Settings', icon: Settings }
]

// Pages put their actions next to the large title through this slot (see PageHeader)
const ActionsSlot = createContext<HTMLElement | null>(null)

// Scroll distance after which the large title has left the screen and the inline title takes over
const TITLE_COLLAPSE_AT = 36

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { year, month } = useMonth()
  const search = { year, month } as never
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null)
  const [tabBarMinimized, setTabBarMinimized] = useState(false)

  // Labels show beside icons on wide screens, so tooltips are only needed on the narrow rail
  const wideSidebar = useMediaQuery('(min-width: 75em)')
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))
  const current = nav.find((n) => isActive(n.href))
  // Tab roots get a large title; pushed pages (an investment) render their own
  const isRoot = nav.some((n) => n.href === pathname)

  // Like iOS: the large title collapses into the toolbar, and the tab bar minimizes while
  // scrolling down and comes back when scrolling up
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const top = window.scrollY
      document.documentElement.toggleAttribute('data-scrolled', top > TITLE_COLLAPSE_AT)
      if (Math.abs(top - last) > 8) {
        setTabBarMinimized(top > last && top > 120)
        last = top
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: { sm: 80, lg: 232 }, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding={0}
      withBorder={false}
      bg="var(--color-page-background)"
    >
      <AppShell.Header className="toolbar">
        <Group justify="space-between" h="100%" px="md" wrap="nowrap" className="toolbar-row">
          <Title order={1} className="toolbar-title">
            {current?.title ?? 'Buddy'}
          </Title>
          <MonthPicker />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="desktop-sidebar">
        <Text className="sidebar-app-name">Buddy</Text>
        <Stack gap={2} px={10}>
          {nav.map((item) => (
            <Tooltip key={item.href} label={item.label} position="right" disabled={wideSidebar}>
              <Link
                to={item.href}
                search={search}
                className="navigation-link desktop-sidebar-link"
                data-active={isActive(item.href) || undefined}
              >
                <item.icon size={18} strokeWidth={2} className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </Tooltip>
          ))}
        </Stack>
      </AppShell.Navbar>

      <Box
        component="nav"
        hiddenFrom="sm"
        className="tab-bar"
        data-minimized={tabBarMinimized || undefined}
        onClick={() => setTabBarMinimized(false)}
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            search={search}
            className="tab-bar-item"
            data-active={isActive(item.href) || undefined}
            tabIndex={tabBarMinimized && !isActive(item.href) ? -1 : undefined}
            onClick={(e) => tabBarMinimized && e.preventDefault()}
          >
            <item.icon size={22} strokeWidth={isActive(item.href) ? 2.3 : 1.9} />
            <span>{item.short ?? item.label}</span>
          </Link>
        ))}
      </Box>

      <AppShell.Main bg="var(--color-page-background)">
        <Box className="scrollable-page-content" h="100%">
          <Box className="page-content">
            {isRoot && (
              <Group justify="space-between" align="flex-end" wrap="nowrap" className="large-title-row">
                <Title order={1} className="large-title">
                  {current?.title}
                </Title>
                <Group gap="xs" wrap="nowrap" ref={setActionsSlot} />
              </Group>
            )}
            <ActionsSlot.Provider value={actionsSlot}>{children}</ActionsSlot.Provider>
          </Box>
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
      <ActionIcon size={36} radius="xl" aria-label="Previous month" onClick={() => go(new Date(year, month - 1))}>
        <ChevronLeft size={18} strokeWidth={2.4} />
      </ActionIcon>
      <MonthPickerInput
        value={new Date(year, month)}
        onChange={(value) => value && go(new Date(value))}
        valueFormat="MMM YYYY"
        w={84}
      />
      <ActionIcon size={36} radius="xl" aria-label="Next month" onClick={() => go(new Date(year, month + 1))}>
        <ChevronRight size={18} strokeWidth={2.4} />
      </ActionIcon>
    </Group>
  )
}

// A page's own actions, shown beside the large title (portalled into the shell's slot)
export function PageHeader({ actions }: { actions?: ReactNode }) {
  const slot = useContext(ActionsSlot)
  return slot ? createPortal(actions, slot) : null
}
