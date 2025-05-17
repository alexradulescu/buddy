import { useMemo, useState } from 'react'
import { InvestmentContribution } from '@/types/investment'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ContributionForm from './forms/contribution-form'

interface ContributionTableProps {
  investmentId: string
  contributions: InvestmentContribution[]
  onDelete: (id: string) => void
}

export default function ContributionTable({ investmentId, contributions, onDelete }: ContributionTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingContribution, setEditingContribution] = useState<InvestmentContribution | undefined>()

  // Format and sort contributions by date (newest first)
  const sortedContributions = useMemo(() => {
    return [...contributions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [contributions])

  const handleEdit = (contribution: InvestmentContribution) => {
    setEditingContribution(contribution)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingContribution(undefined)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContribution(undefined)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contributions</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Add Contribution
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <ContributionForm
            investmentId={investmentId}
            contribution={editingContribution}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : sortedContributions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell>{formatDate(contribution.date)}</TableCell>
                  <TableCell>{formatCurrency(contribution.amount)}</TableCell>
                  <TableCell>{contribution.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(contribution)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(contribution.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No contributions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
