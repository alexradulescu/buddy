'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AccountBalance, useAccountStore } from '@/stores/account-store'

interface AccountFormProps {
  initialData?: AccountBalance
  onSubmit: () => void
  selectedYear: number
  selectedMonth: number
}

export const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, selectedYear, selectedMonth }) => {
  const { addAccountBalance, updateAccountBalance } = useAccountStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Omit<AccountBalance, 'id'>>({
    defaultValues: initialData || {
      title: '',
      amount: 0,
      year: selectedYear,
      month: selectedMonth
    }
  })

  const onSubmitForm = async (data: Omit<AccountBalance, 'id'>) => {
    setIsSubmitting(true)
    try {
      if (initialData) {
        updateAccountBalance(initialData.id, data)
        toast({
          title: 'Account balance updated',
          description: `Updated balance for ${data.title}`
        })
      } else {
        addAccountBalance(data)
        toast({
          title: 'Account balance added',
          description: `Added new balance for ${data.title}`
        })
      }
      reset()
      onSubmit()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving the account balance.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <Input {...register('title', { required: 'Title is required' })} placeholder="Account Title" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Input
          type="number"
          step="0.01"
          {...register('amount', { required: 'Amount is required', valueAsNumber: true })}
          placeholder="Balance Amount"
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update Balance' : 'Add Balance'}
      </Button>
    </form>
  )
}
