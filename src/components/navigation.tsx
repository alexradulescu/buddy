'use client'

import { BarChart2, CreditCard, Home, LucideIcon, Package2, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { Tooltip } from '@mantine/core'
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

export function Navigation() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const location = useLocation()
  const pathname = location.pathname

  const getLinkStyle = (isActive: boolean) => ({
    display: 'flex',
    height: '2.25rem',
    width: '2.25rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.5rem',
    color: isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)',
    backgroundColor: isActive ? 'var(--mantine-color-gray-1)' : 'transparent',
    transition: 'all 0.2s',
    textDecoration: 'none'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 0, height: 'auto' }}>
      {/* Sidebar for larger screens */}
      <aside style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        display: 'none',
        width: '3.5rem',
        flexDirection: 'column',
        borderRight: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-white)'
      }} className="sm:flex">
        <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0.5rem' }}>
          <NavLink
            to={{
              pathname: '/',
              search: `?month=${selectedMonth}&year=${selectedYear}`
            }}
            style={{
              display: 'flex',
              height: '2.25rem',
              width: '2.25rem',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--mantine-color-blue-6)',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Package2 size={16} style={{ transition: 'all 0.2s' }} />
            <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Buddy App</span>
          </NavLink>
          {navItems.map((item) => (
            <Tooltip key={item.href} label={item.label} position="right">
              <NavLink
                to={{
                  pathname: item.href,
                  search: `?month=${selectedMonth}&year=${selectedYear}`
                }}
                style={getLinkStyle(pathname === item.href)}
              >
                <item.icon size={20} />
                <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>{item.label}</span>
              </NavLink>
            </Tooltip>
          ))}
        </nav>
      </aside>

      {/* Bottom navigation for mobile */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        height: '4rem',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-white)'
      }} className="sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={{
              pathname: item.href,
              search: `?month=${selectedMonth}&year=${selectedYear}`
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.5rem 0.25rem',
              fontSize: '0.75rem',
              color: pathname === item.href ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dimmed)',
              textDecoration: 'none'
            }}
          >
            <item.icon size={20} style={{ marginBottom: '0.25rem' }} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
