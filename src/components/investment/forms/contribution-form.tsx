import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { InvestmentContribution } from '@/types/investment'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface ContributionFormProps {
  investmentId: string
  contribution?: InvestmentContribution
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ContributionForm({ investmentId, contribution, onSuccess, onCancel }: ContributionFormProps) {
  const { toast } = useToast()
  const { addContribution, updateContribution } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      amount: contribution?.amount?.toString() || '0',
      date: contribution?.date
        ? new Date(contribution.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: contribution?.description || ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString()
      }

      if (contribution) {
        await updateContribution(contribution.id, formattedData)
        toast({
          title: 'Contribution updated',
          description: 'Your contribution has been updated successfully.'
        })
      } else {
        await addContribution({
          ...formattedData,
          investmentId
        })
        toast({
          title: 'Contribution added',
          description: 'Your contribution has been added successfully.'
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error saving your contribution. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contribution ? 'Edit Contribution' : 'Add Contribution'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: 'Amount is required',
                validate: (value) => parseFloat(value) > 0 || 'Amount must be greater than 0'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contribution description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : contribution ? 'Update' : 'Add'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
