import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface InvestmentFormProps {
  investment?: Investment
  onSuccess?: () => void
}

export default function InvestmentForm({ investment, onSuccess }: InvestmentFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addInvestment, updateInvestment } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: investment?.name || '',
      description: investment?.description || '',
      isActive: investment?.isActive ?? true
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (investment) {
        await updateInvestment(investment.id, data)
        toast({
          title: 'Investment updated',
          description: 'Your investment has been updated successfully.'
        })
      } else {
        await addInvestment({
          ...data,
          createdDate: new Date().toISOString()
        })
        toast({
          title: 'Investment created',
          description: 'Your investment has been created successfully.'
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/investments')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error saving your investment. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{investment ? 'Edit Investment' : 'Add Investment'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Investment name" {...field} />
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
                    <Textarea placeholder="Investment description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Mark this investment as active or inactive</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/investments')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : investment ? 'Update' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
