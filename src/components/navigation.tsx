'use client'

import { BarChart2, CreditCard, Home, LucideIcon, Package2, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { Tooltip, Stack, UnstyledButton, rem, Text } from '@mantine/core'
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
  const location = useLocation()
  const pathname = location.pathname

  return (
    <Stack gap="md" p="sm" align="center">
      <UnstyledButton
        component={NavLink}
        to={{
          pathname: '/',
          search: `?month=${selectedMonth}&year=${selectedYear}`
        }}
        w={rem(36)}
        h={rem(36)}
        style={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.blue[6],
          color: theme.white
        })}
      >
        <Package2 size={16} />
      </UnstyledButton>

      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Tooltip key={item.href} label={item.label} position="right">
            <UnstyledButton
              component={NavLink}
              to={{
                pathname: item.href,
                search: `?month=${selectedMonth}&year=${selectedYear}`
              }}
              w={rem(36)}
              h={rem(36)}
              style={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                color: isActive ? theme.colors.blue[6] : theme.colors.gray[6],
                backgroundColor: isActive ? theme.colors.gray[1] : 'transparent',
                transition: 'all 150ms ease'
              })}
            >
              <item.icon size={20} />
            </UnstyledButton>
          </Tooltip>
        )
      })}
    </Stack>
  )
}

export function MobileNav() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <UnstyledButton
            key={item.href}
            component={NavLink}
            to={{
              pathname: item.href,
              search: `?month=${selectedMonth}&year=${selectedYear}`
            }}
            style={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: `${rem(8)} ${rem(8)} ${rem(4)}`,
              color: isActive ? theme.colors.blue[6] : theme.colors.gray[6],
              transition: 'all 150ms ease'
            })}
          >
            <item.icon size={20} style={{ marginBottom: rem(4) }} />
            <Text size="xs">{item.label}</Text>
          </UnstyledButton>
        )
      })}
    </>
  )
}
