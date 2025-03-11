'use client'

import { ActionIcon, Box, Group, NavLink, Stack, Tooltip } from '@mantine/core'
import { IconChartBar, IconCreditCard, IconHome, IconPackage, IconPigMoney, IconSettings } from '@tabler/icons-react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function Navigation() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: '/', label: 'Home', icon: <IconHome size="1.2rem" /> },
    { href: '/expenses', label: 'Expenses', icon: <IconCreditCard size="1.2rem" /> },
    { href: '/incomes', label: 'Incomes', icon: <IconPigMoney size="1.2rem" /> },
    { href: '/accounts', label: 'Accounts', icon: <IconChartBar size="1.2rem" /> },
    { href: '/settings', label: 'Settings', icon: <IconSettings size="1.2rem" /> }
  ]

  return (
    <Box h="100%" w="100%" bg="var(--mantine-color-gray-1)">
      <Stack h="100%" justify="flex-start" align="center" gap="md" py="md" px='0'>
        <Tooltip label="Buddy App" position="right">
          <ActionIcon 
            component={Link} 
            href="/" 
            size="md" 
            radius="xl" 
            variant="filled" 
            color="blue"
          >
            <IconPackage size="1.2rem" />
          </ActionIcon>
        </Tooltip>

        <Stack gap="md" mt="md" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Tooltip key={item.href} label={item.label} position="right">
              <ActionIcon
                component={Link}
                href={{
                  pathname: item.href,
                  query: { month: selectedMonth, year: selectedYear }
                }}
                size="lg"
                radius="md"
                variant={pathname === item.href ? 'filled' : 'subtle'}
                color={pathname === item.href ? 'blue' : 'gray'}
              >
                {item.icon}
              </ActionIcon>
            </Tooltip>
          ))}
        </Stack>
      </Stack>

      {/* Mobile navigation */}
      <Box 
        display={{ base: 'block', sm: 'none' }}
        pos="fixed" 
        bottom={0} 
        left={0} 
        right={0} 
        py="xs"
        style={{ 
          borderTop: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-body)'
        }}
      >
        <Group justify="space-around" align="center">
          {navItems.map((item) => (
            <Box 
              key={item.href} 
              component={Link}
              href={{
                pathname: item.href,
                query: { month: selectedMonth, year: selectedYear }
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                color: pathname === item.href ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)'
              }}
            >
              {item.icon}
              <Box fz="xs" mt={4}>{item.label}</Box>
            </Box>
          ))}
        </Group>
      </Box>
    </Box>
  )
}
