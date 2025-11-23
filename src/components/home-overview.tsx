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
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <OverviewCard
        title={'Total Income'}
        value={formatCurrency(totalMonthlyIncomes)}
        icon={<PiggyBank size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      />
      <OverviewCard
        title={'Total Expenses'}
        value={formatCurrency(totalMonthlyExpenses)}
        icon={<CreditCard size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      />
      <OverviewCard
        title={'Net Income'}
        value={formatCurrency(netIncome)}
        icon={<Package2 size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      />
      <OverviewCard
        title={'Investments'}
        value={formatCurrency(totalInvestmentValue)}
        icon={<TrendingUp size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      />
      <OverviewCard
        title={'Saving Rate'}
        value={totalMonthlyIncomes > 0 ? `${((netIncome / totalMonthlyIncomes) * 100).toFixed(2)}%` : 'N/A'}
        icon={<BarChart2 size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      />
    </div>
  )
}
