import { BarChart2, CreditCard, Home, LucideIcon, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Tooltip, Stack, rem, Text, Box } from '@mantine/core'
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
    <>
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
              padding: `${rem(8)} ${rem(8)} ${rem(4)}`,
              color: isActive ? '#1B4332' : '#6F767E',
              transition: 'all 0.15s ease',
              position: 'relative',
              textDecoration: 'none',
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
          </Link>
        )
      })}
    </>
  )
}
