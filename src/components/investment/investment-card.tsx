import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvestmentCardProps {
  investment: Investment
}

export default function InvestmentCard({ investment }: InvestmentCardProps) {
  const { getTotalContributions, getLatestValue } = useInvestmentStore()

  // Calculate metrics
  const totalContributions = useMemo(() => {
    return getTotalContributions(investment.id)
  }, [getTotalContributions, investment.id])

  const currentValue = useMemo(() => {
    return getLatestValue(investment.id)
  }, [getLatestValue, investment.id])

  const profit = currentValue !== null ? currentValue - totalContributions : 0
  const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Link to={`/investments/${investment.id}`}>
      <Card className="h-full hover:bg-accent/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{investment.name}</CardTitle>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs',
                investment.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              )}
            >
              {investment.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {investment.description && <p className="text-sm text-muted-foreground mt-1">{investment.description}</p>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Contributions</p>
              <p className="font-medium">{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current Value</p>
              <p className="font-medium">{formatCurrency(currentValue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit/Loss</p>
              <p className={cn('font-medium', profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Return</p>
              <p className={cn('font-medium', profitPercentage >= 0 ? 'text-green-600' : 'text-red-600')}>
                {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
