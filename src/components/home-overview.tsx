'use client'

import { IconChartBar, IconCreditCard, IconPackage, IconPigMoney } from '@tabler/icons-react'
import { OverviewCard } from '@/components/overview-card'
import { SimpleGrid } from '@mantine/core'

interface HomeOverviewProps {
  totalMonthlyIncomes: number
  totalMonthlyExpenses: number
  netIncome: number
}

export function HomeOverview({ totalMonthlyIncomes, totalMonthlyExpenses, netIncome }: HomeOverviewProps) {
  const formatCurrency = (amount: number | undefined): string => {
    return amount !== undefined ? `$${amount.toFixed(2)}` : 'N/A'
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <OverviewCard
        title={'Total Income'}
        value={formatCurrency(totalMonthlyIncomes)}
        icon={<IconPigMoney size="1.2rem" opacity={0.7} />}
      />
      <OverviewCard
        title={'Total Expenses'}
        value={formatCurrency(totalMonthlyExpenses)}
        icon={<IconCreditCard size="1.2rem" opacity={0.7} />}
      />
      <OverviewCard
        title={'Net Income'}
        value={formatCurrency(netIncome)}
        icon={<IconPackage size="1.2rem" opacity={0.7} />}
      />
      <OverviewCard
        title={'Saving Rate'}
        value={totalMonthlyIncomes > 0 ? `${((netIncome / totalMonthlyIncomes) * 100).toFixed(2)}%` : 'N/A'}
        icon={<IconChartBar size="1.2rem" opacity={0.7} />}
      />
    </SimpleGrid>
  )
}
