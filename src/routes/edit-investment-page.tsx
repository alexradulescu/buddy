import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'

export default function EditInvestmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { investments } = useInvestmentStore()

  const investment = investments.find((inv) => inv.id === id)

  if (!investment) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/investments/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investment
          </Link>
        </Button>
      </div>

      <PageHeader title="Edit Investment" description="Update your investment details" />

      <InvestmentForm investment={investment} onSuccess={() => navigate(`/investments/${id}`)} />
    </div>
  )
}
