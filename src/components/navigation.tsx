'use client'

import { cn } from '@/lib/utils'
import { BarChart2, CreditCard, Home, LucideIcon, Package2, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

  return (
    <TooltipProvider>
      <div className="flex flex-col bg-muted/40 w-0 sm:w-14 h-auto">
        {/* Sidebar for larger screens */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <NavLink
              to={{
                pathname: '/',
                search: `?month=${selectedMonth}&year=${selectedYear}`
              }}
              prefetch="intent"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Buddy App</span>
            </NavLink>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={{
                      pathname: item.href,
                      search: `?month=${selectedMonth}&year=${selectedYear}`
                    }}
                    prefetch="intent"
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent md:h-8 md:w-8',
                      pathname === item.href && 'text-primary bg-accent'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </aside>

        {/* Bottom navigation for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t bg-background sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={{
                pathname: item.href,
                search: `?month=${selectedMonth}&year=${selectedYear}`
              }}
              prefetch="intent"
              className={cn(
                'flex flex-col items-center justify-center px-2 py-1 text-xs text-muted-foreground',
                pathname === item.href && 'text-primary'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  )
}
