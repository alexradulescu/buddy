'use client'

import { BarChart2, CreditCard, Package2, PiggyBank, TrendingUp } from 'lucide-react'
import { OverviewCard } from '@/components/overview-card'

interface HomeOverviewProps {
  totalMonthlyIncomes: number
  totalMonthlyExpenses: number
  netIncome: number
  totalInvestmentValue: number
}

export function HomeOverview({ totalMonthlyIncomes, totalMonthlyExpenses, netIncome, totalInvestmentValue }: HomeOverviewProps) {
  const formatCurrency = (amount: number | undefined): string => {
    return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <OverviewCard
        title={'Total Income'}
        value={formatCurrency(totalMonthlyIncomes)}
        icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
      />
      <OverviewCard
        title={'Total Expenses'}
        value={formatCurrency(totalMonthlyExpenses)}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
      <OverviewCard
        title={'Net Income'}
        value={formatCurrency(netIncome)}
        icon={<Package2 className="h-4 w-4 text-muted-foreground" />}
      />
      <OverviewCard
        title={'Investments'}
        value={formatCurrency(totalInvestmentValue)}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <OverviewCard
        title={'Saving Rate'}
        value={totalMonthlyIncomes > 0 ? `${((netIncome / totalMonthlyIncomes) * 100).toFixed(2)}%` : 'N/A'}
        icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
