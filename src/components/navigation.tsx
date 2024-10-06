'use client'

import Link from 'next/link'

import { useSharedQueryParams } from '@/hooks/use-shared-query-params'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/incomes', label: 'Incomes' },
  { href: '/overview', label: 'Overview' },
  { href: '/settings', label: 'Settings' }
]

export const Navigation = () => {
  const { selectedYear, selectedMonth } = useSharedQueryParams()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={{
                pathname: item.href,
                query: { month: selectedMonth, year: selectedYear }
              }}
              className="hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
