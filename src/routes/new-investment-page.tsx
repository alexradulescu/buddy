import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'

export default function NewInvestmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/investments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investments
          </Link>
        </Button>
      </div>

      <PageHeader title="Add Investment" description="Create a new investment to track" />

      <InvestmentForm />
    </div>
  )
}
