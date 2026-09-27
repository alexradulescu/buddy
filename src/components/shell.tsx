import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ActionIcon, Box, Group, Text, Title, Tooltip, UnstyledButton } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { useLocalStorage } from '@mantine/hooks'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  PanelLeft,
  PiggyBank,
  Settings,
  TrendingUp,
  Wallet
} from 'lucide-react'

import { useMonth } from '@/hooks/use-month'

type NavItem = { href: string; label: string; title: string; icon: typeof Home }

const main: NavItem[] = [
  { href: '/', label: 'Home', title: 'Overview', icon: Home },
  { href: '/expenses', label: 'Expenses', title: 'Expenses', icon: CreditCard },
  { href: '/incomes', label: 'Incomes', title: 'Incomes', icon: PiggyBank },
  { href: '/investments', label: 'Investments', title: 'Investments', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', title: 'Accounts', icon: BarChart2 }
]
const footer: NavItem[] = [{ href: '/settings', label: 'Settings', title: 'Settings', icon: Settings }]
const nav = [...main, ...footer]

// Pages put their actions next to the large title through this slot (see PageHeader)
const ActionsSlot = createContext<HTMLElement | null>(null)

// Scroll distance after which the large title has left the screen and the inline title takes over
const TITLE_COLLAPSE_AT = 36

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { year, month } = useMonth()
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null)
  const [collapsed, setCollapsed] = useLocalStorage({ key: 'buddy.sidebar-collapsed', defaultValue: false })

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))
  const current = nav.find((n) => isActive(n.href))
  // Tab roots get a large title; pushed pages (an investment) render their own
  const isRoot = nav.some((n) => n.href === pathname)

  // Desktop scrolls inside the canvas, phones scroll the document; a capturing listener hears both.
  // Past the large title the inline title takes over.
  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target instanceof HTMLElement ? e.target : document.scrollingElement
      if (!el || !(el === document.scrollingElement || el.classList.contains('canvas'))) return
      const top = el.scrollTop
      document.documentElement.toggleAttribute('data-scrolled', top > TITLE_COLLAPSE_AT)
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  return (
    <div className="app-frame" data-collapsed={collapsed || undefined}>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo" aria-hidden>
              <Wallet size={14} strokeWidth={2.1} />
            </span>
            <span className="sidebar-brand-name">Buddy</span>
          </div>
          <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right">
            <UnstyledButton
              className="sidebar-toggle"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeft size={16} strokeWidth={1.8} />
            </UnstyledButton>
          </Tooltip>
        </div>

        <nav className="sidebar-section">
          {main.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} rail={collapsed} />
          ))}
        </nav>

        <nav className="sidebar-section sidebar-footer">
          {footer.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} rail={collapsed} />
          ))}
        </nav>
      </aside>

      <main className="canvas">
        <header className="canvas-toolbar">
          <div className="canvas-toolbar-leading">
            {current && !isRoot && (
              <Link to={current.href} search={{ year, month } as never} className="breadcrumb breadcrumb-link">
                <ChevronLeft size={16} strokeWidth={2.2} />
                {current.label}
              </Link>
            )}
          </div>
          <Title order={1} className="toolbar-title">
            {current?.title ?? 'Buddy'}
          </Title>
          <MonthPicker />
        </header>

        <div className="page-content">
          {isRoot && (
            <Group justify="space-between" align="flex-end" wrap="nowrap" className="large-title-row">
              <Title order={1} className="large-title">
                {current?.title}
              </Title>
              <Group gap="xs" wrap="nowrap" ref={setActionsSlot} />
            </Group>
          )}
          <ActionsSlot.Provider value={actionsSlot}>{children}</ActionsSlot.Provider>
        </div>
      </main>

      <TabBar isActive={isActive} />
    </div>
  )
}

function SidebarLink({ item, active, rail }: { item: NavItem; active: boolean; rail: boolean }) {
  const { year, month } = useMonth()
  return (
    <Tooltip label={item.label} position="right" disabled={!rail}>
      <Link
        to={item.href}
        search={{ year, month } as never}
        className="sidebar-link"
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
      >
        <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} className="sidebar-link-icon" />
        <span className="sidebar-link-label">{item.label}</span>
      </Link>
    </Tooltip>
  )
}

// iOS 27 floating tab bar, always expanded. Every item is at least 64px wide, so extra tabs scroll sideways.
function TabBar({ isActive }: { isActive: (href: string) => boolean }) {
  const { year, month } = useMonth()
  const scroller = useRef<HTMLDivElement>(null)

  // Keep the current tab in view when it is one of the scrolled-away ones
  const activeIndex = nav.findIndex((item) => isActive(item.href))
  useEffect(() => {
    const el = scroller.current
    const active = el?.children[activeIndex] as HTMLElement | undefined
    if (el && active) el.scrollTo({ left: active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2 })
  }, [activeIndex])

  return (
    <Box component="nav" className="tab-bar">
      <div className="tab-bar-scroller" ref={scroller}>
        {nav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              search={{ year, month } as never}
              className="tab-bar-item"
              data-active={active || undefined}
            >
              <span className="tab-bar-icon">
                <item.icon size={22} strokeWidth={active ? 2.3 : 1.9} />
              </span>
              <Text component="span" className="tab-bar-label">
                {item.label}
              </Text>
            </Link>
          )
        })}
      </div>
    </Box>
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
      <ActionIcon size={30} radius="xl" aria-label="Previous month" onClick={() => go(new Date(year, month - 1))}>
        <ChevronLeft size={16} strokeWidth={2.2} />
      </ActionIcon>
      <MonthPickerInput
        value={new Date(year, month)}
        onChange={(value) => value && go(new Date(value))}
        valueFormat="MMM YYYY"
        w={82}
        aria-label="Month"
      />
      <ActionIcon size={30} radius="xl" aria-label="Next month" onClick={() => go(new Date(year, month + 1))}>
        <ChevronRight size={16} strokeWidth={2.2} />
      </ActionIcon>
    </Group>
  )
}

// A page's own actions, shown beside the large title (portalled into the shell's slot)
export function PageHeader({ actions }: { actions?: ReactNode }) {
  const slot = useContext(ActionsSlot)
  return slot ? createPortal(actions, slot) : null
}
