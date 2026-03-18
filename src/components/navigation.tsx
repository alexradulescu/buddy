import React from 'react'
import { BarChart2, CreditCard, Home, LucideIcon, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Tooltip, Stack, rem } from '@mantine/core'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/incomes', label: 'Incomes', icon: PiggyBank },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export function DesktopNav() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Stack gap="xs" p="xs" align="center">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Tooltip key={item.href} label={item.label} position="right">
            <Link
              to={item.href}
              search={{ month: selectedMonth, year: selectedYear } as any}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: rem(36),
                height: rem(36),
                borderRadius: '8px',
                color: isActive ? '#1B4332' : '#6F767E',
                backgroundColor: isActive ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            </Link>
          </Tooltip>
        )
      })}
    </Stack>
  )
}

export function MobileNav() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        backgroundColor: 'rgba(248, 250, 251, 0.82)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '0.5px solid rgba(0, 0, 0, 0.12)',
        paddingTop: '8px',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      } as React.CSSProperties}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            search={{ month: selectedMonth, year: selectedYear } as any}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: '2px',
              paddingTop: '4px',
              paddingBottom: '4px',
              color: isActive ? '#1B4332' : '#8E8E93',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
