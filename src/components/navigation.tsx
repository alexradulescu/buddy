'use client'

import { BarChart2, CreditCard, Home, LucideIcon, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { Tooltip, Stack, UnstyledButton, rem, Text, Box } from '@mantine/core'
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
    <Stack gap="xs" p="xs" align="center">
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                color: isActive ? '#1B4332' : '#6F767E',
                backgroundColor: isActive ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: `${rem(8)} ${rem(8)} ${rem(4)}`,
              color: isActive ? '#1B4332' : '#6F767E',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {isActive && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '3px',
                  backgroundColor: '#52B788',
                  borderRadius: '2px',
                }}
              />
            )}
            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} style={{ marginBottom: rem(2) }} />
            <Text
              size="xs"
              fw={isActive ? 600 : 400}
              style={{ fontSize: '10px' }}
            >
              {item.label}
            </Text>
          </UnstyledButton>
        )
      })}
    </>
  )
}
