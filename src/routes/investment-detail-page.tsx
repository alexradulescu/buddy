import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import ContributionTable from '@/components/investment/contribution-table'
import PerformanceGraph from '@/components/investment/performance-graph'
import ValueTable from '@/components/investment/value-table'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    investments,
    getInvestmentContributions,
    getInvestmentValues,
    getTotalContributions,
    getLatestValue,
    deleteInvestment,
    deleteContribution,
    deleteValue
  } = useInvestmentStore()
  const [activeTab, setActiveTab] = useState('overview')

  // Find the investment by ID
  const investment = investments.find((inv) => inv.id === id)

  if (!investment || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-medium">Investment not found</h2>
        <p className="text-muted-foreground mb-4">The investment you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/investments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investments
          </Link>
        </Button>
      </div>
    )
  }

  // Get contributions and values for this investment
  const contributions = getInvestmentContributions(id)
  const values = getInvestmentValues(id)

  // Calculate metrics
  const totalContributions = getTotalContributions(id)
  const currentValue = getLatestValue(id)
  const profit = currentValue !== null ? currentValue - totalContributions : 0
  const profitPercentage = totalContributions > 0 ? (profit / totalContributions) * 100 : 0

  const handleDeleteInvestment = async () => {
    if (window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      try {
        await deleteInvestment(id)
        toast({
          title: 'Investment deleted',
          description: 'The investment has been successfully deleted.'
        })
        navigate('/investments')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete the investment. Please try again.',
          variant: 'destructive'
        })
      }
    }
  }

  const handleDeleteContribution = async (contributionId: string) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await deleteContribution(contributionId)
        toast({
          title: 'Contribution deleted',
          description: 'The contribution has been successfully deleted.'
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete the contribution. Please try again.',
          variant: 'destructive'
        })
      }
    }
  }

  const handleDeleteValue = async (valueId: string) => {
    if (window.confirm('Are you sure you want to delete this value entry?')) {
      try {
        await deleteValue(valueId)
        toast({
          title: 'Value entry deleted',
          description: 'The value entry has been successfully deleted.'
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete the value entry. Please try again.',
          variant: 'destructive'
        })
      }
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/investments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investments
          </Link>
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/investments/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteInvestment}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <PageHeader title={investment.name} description={investment.description || 'No description provided'} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentValue === null ? 'N/A' : `${profitPercentage.toFixed(2)}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <PerformanceGraph contributions={contributions} values={values} />

      <Tabs defaultValue="contributions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
        </TabsList>
        <TabsContent value="contributions" className="mt-4">
          <ContributionTable investmentId={id} contributions={contributions} onDelete={handleDeleteContribution} />
        </TabsContent>
        <TabsContent value="values" className="mt-4">
          <ValueTable investmentId={id} values={values} onDelete={handleDeleteValue} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
