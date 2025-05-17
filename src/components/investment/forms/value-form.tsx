import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { InvestmentValue } from '@/types/investment'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface ValueFormProps {
  investmentId: string
  value?: InvestmentValue
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ValueForm({ investmentId, value, onSuccess, onCancel }: ValueFormProps) {
  const { toast } = useToast()
  const { addValue, updateValue } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      value: value?.value?.toString() || '0',
      date: value?.date ? new Date(value.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: value?.description || ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        value: parseFloat(data.value),
        date: new Date(data.date).toISOString()
      }

      if (value) {
        await updateValue(value.id, formattedData)
        toast({
          title: 'Value updated',
          description: 'Your value entry has been updated successfully.'
        })
      } else {
        await addValue({
          ...formattedData,
          investmentId
        })
        toast({
          title: 'Value added',
          description: 'Your value entry has been added successfully.'
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error saving your value entry. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{value ? 'Edit Value' : 'Add Value'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              rules={{
                required: 'Value is required',
                validate: (value) => parseFloat(value) > 0 || 'Value must be greater than 0'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
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
                    <Textarea placeholder="Value description" {...field} />
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
              {isSubmitting ? 'Saving...' : value ? 'Update' : 'Add'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
