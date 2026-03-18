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
    <Box
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(229, 233, 235, 0.5)',
        paddingTop: rem(8),
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        alignItems: 'flex-start',
      }}
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
              padding: `${rem(4)} ${rem(4)}`,
              color: isActive ? '#1B4332' : '#6F767E',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
              borderRadius: '10px',
              backgroundColor: isActive ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
              gap: rem(3),
            }}
          >
            <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            <Text
              size="xs"
              fw={isActive ? 600 : 400}
              style={{ fontSize: '10px', lineHeight: 1.2 }}
            >
              {item.label}
            </Text>
          </Link>
        )
      })}
    </Box>
  )
}
