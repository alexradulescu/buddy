import { useMemo, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InvestmentValue } from '@/types/investment'
import ValueForm from './forms/value-form'

interface ValueTableProps {
  investmentId: string
  values: InvestmentValue[]
  onDelete: (id: string) => void
}

export default function ValueTable({ investmentId, values, onDelete }: ValueTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingValue, setEditingValue] = useState<InvestmentValue | undefined>()

  // Format and sort values by date (newest first)
  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [values])

  const handleEdit = (value: InvestmentValue) => {
    setEditingValue(value)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingValue(undefined)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingValue(undefined)
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
        <CardTitle>Values</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Add Value
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <ValueForm
            investmentId={investmentId}
            value={editingValue}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : sortedValues.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedValues.map((value) => (
                <TableRow key={value.id}>
                  <TableCell>{formatDate(value.date)}</TableCell>
                  <TableCell>{formatCurrency(value.value)}</TableCell>
                  <TableCell>{value.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(value)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(value.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No values recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
