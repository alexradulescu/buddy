'use client'

import { BarChart2, CreditCard, Home, LucideIcon, Package2, PiggyBank, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSharedQueryParams } from '@/hooks/use-shared-query-params'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/incomes', label: 'Incomes', icon: PiggyBank },
  { href: '/overview', label: 'Overview', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export function Navigation() {
  const { selectedYear, selectedMonth } = useSharedQueryParams()
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-muted/40">
        {/* Sidebar for larger screens */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Buddy App</span>
            </Link>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={{
                      pathname: item.href,
                      query: { month: selectedMonth, year: selectedYear }
                    }}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-gray-100 md:h-8 md:w-8',
                      pathname === item.href && 'text-green-600'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </aside>

        {/* Bottom navigation for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t bg-background sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={{
                pathname: item.href,
                query: { month: selectedMonth, year: selectedYear }
              }}
              className={cn(
                'flex flex-col items-center justify-center px-2 py-1 text-xs text-muted-foreground',
                pathname === item.href && 'bg-green-600 text-white rounded-md'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  )
}
