import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import InvestmentCard from '@/components/investment/investment-card'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'

export default function InvestmentsPage() {
  const { investments } = useInvestmentStore()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Investments"
        description="Track and manage your investments"
        action={
          <Button asChild>
            <Link to="/investments/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Link>
          </Button>
        }
      />

      {investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-background rounded-lg border p-8">
          <h3 className="text-lg font-medium">No investments yet</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first investment</p>
          <Button asChild>
            <Link to="/investments/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      )}
    </div>
  )
}
