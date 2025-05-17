import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { cn } from '@/lib/utils'

export function InvestmentOverview() {
  const { investments, getInvestmentContributions, getInvestmentValues, getLatestValue, getTotalContributions } = useInvestmentStore()

  // Get only active investments
  const activeInvestments = useMemo(() => {
    return investments.filter(investment => investment.isActive)
  }, [investments])

  // Calculate total investment value
  const totalInvestmentValue = useMemo(() => {
    return activeInvestments.reduce((total, investment) => {
      const latestValue = getLatestValue(investment.id)
      return total + (latestValue || 0)
    }, 0)
  }, [activeInvestments, getLatestValue])

  // Calculate total contributions
  const totalContributions = useMemo(() => {
    return activeInvestments.reduce((total, investment) => {
      return total + getTotalContributions(investment.id)
    }, 0)
  }, [activeInvestments, getTotalContributions])

  // Calculate total profit/loss
  const totalProfitLoss = totalInvestmentValue - totalContributions
  const profitLossPercentage = totalContributions > 0 ? (totalProfitLoss / totalContributions) * 100 : 0

  // Format currency values
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Prepare investment data for display
  const investmentData = useMemo(() => {
    return activeInvestments.map(investment => {
      const currentValue = getLatestValue(investment.id)
      const totalContributions = getTotalContributions(investment.id)
      const profit = currentValue !== null ? currentValue - totalContributions : 0
      const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

      return {
        id: investment.id,
        name: investment.name,
        currentValue,
        totalContributions,
        profit,
        profitPercentage
      }
    })
  }, [activeInvestments, getLatestValue, getTotalContributions])

  if (activeInvestments.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvestmentValue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(totalContributions)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <p className={cn(
                "text-2xl font-bold", 
                totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(totalProfitLoss)} ({profitLossPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Total Invested</TableHead>
                <TableHead className="text-right">P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentData.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(investment.currentValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(investment.totalContributions)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      investment.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(investment.profit)} ({investment.profitPercentage.toFixed(2)}%)
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
