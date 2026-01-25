'use client'

import { BarChart2, CreditCard, Home, LucideIcon, Package2, PiggyBank, Settings, TrendingUp } from 'lucide-react'
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
    <Stack gap="sm" p="sm" align="center">
      {/* Logo with art deco gold accent */}
      <UnstyledButton
        component={NavLink}
        to={{
          pathname: '/',
          search: `?month=${selectedMonth}&year=${selectedYear}`
        }}
        w={rem(36)}
        h={rem(36)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '3px',
          backgroundColor: '#1C1C1C',
          color: '#C4A052',
          transition: 'all 0.2s ease',
        }}
      >
        <Package2 size={16} strokeWidth={1.5} />
      </UnstyledButton>

      {/* Decorative separator */}
      <Box
        w={20}
        h={1}
        my={4}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(196, 160, 82, 0.4), transparent)',
        }}
      />

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
                borderRadius: '3px',
                color: isActive ? '#C4A052' : '#6B6B6B',
                backgroundColor: isActive ? 'rgba(196, 160, 82, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(196, 160, 82, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
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
              color: isActive ? '#C4A052' : '#6B6B6B',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {/* Active indicator line */}
            {isActive && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '2px',
                  backgroundColor: '#C4A052',
                  borderRadius: '1px',
                }}
              />
            )}
            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} style={{ marginBottom: rem(2) }} />
            <Text
              size="xs"
              fw={isActive ? 600 : 400}
              style={{
                letterSpacing: '0.02em',
                fontSize: '10px',
              }}
            >
              {item.label}
            </Text>
          </UnstyledButton>
        )
      })}
    </>
  )
}
