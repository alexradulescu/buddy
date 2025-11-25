'use client'

import React, { useState } from 'react'
import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import { useForm } from 'react-hook-form'
import { Button, TextInput, NumberInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'

interface AccountFormProps {
  initialData?: AccountBalance
  onSubmit: () => void
  selectedYear: number
  selectedMonth: number
}

export const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, selectedYear, selectedMonth }) => {
  const { addAccountBalance, updateAccountBalance } = useAccountBalances(selectedYear, selectedMonth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<Omit<AccountBalance, 'id'>>({
    defaultValues: initialData || {
      title: '',
      amount: 0,
      year: selectedYear,
      month: selectedMonth
    }
  })

  const amount = watch('amount')

  const onSubmitForm = async (data: Omit<AccountBalance, 'id'>) => {
    setIsSubmitting(true)
    try {
      if (initialData) {
        updateAccountBalance(initialData.id, data)
        notifications.show({
          title: 'Account balance updated',
          message: `Updated balance for ${data.title}`,
          color: 'green'
        })
      } else {
        addAccountBalance(data)
        notifications.show({
          title: 'Account balance added',
          message: `Added new balance for ${data.title}`,
          color: 'green'
        })
      }
      reset()
      onSubmit()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred while saving the account balance.',
        color: 'red'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <TextInput {...register('title', { required: 'Title is required' })} placeholder="Account Title" />
        {errors.title && (
          <p style={{ color: 'var(--mantine-color-red-6)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.title.message}
          </p>
        )}
      </div>
      <div>
        <NumberInput
          value={amount}
          onChange={(value) => setValue('amount', Number(value) || 0)}
          placeholder="Balance Amount"
          decimalScale={2}
        />
        {errors.amount && (
          <p style={{ color: 'var(--mantine-color-red-6)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.amount.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update Balance' : 'Add Balance'}
      </Button>
    </form>
  )
}
