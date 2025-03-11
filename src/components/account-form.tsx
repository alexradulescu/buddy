'use client'

import React, { useState } from 'react'
import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import { useForm } from '@mantine/form'
import { Button, TextInput, NumberInput, Group, Stack } from '@mantine/core'
import { useToast } from '@/hooks/use-toast'

interface AccountFormProps {
  initialData?: AccountBalance
  onSubmit: () => void
  selectedYear: number
  selectedMonth: number
}

type AccountFormValues = {
  title: string
  amount: number
  year: number
  month: number
}

export const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, selectedYear, selectedMonth }) => {
  const { addAccountBalance, updateAccountBalance } = useAccountBalances(selectedYear, selectedMonth)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AccountFormValues>({
    initialValues: initialData ? {
      title: initialData.title,
      amount: initialData.amount,
      year: initialData.year,
      month: initialData.month
    } : {
      title: '',
      amount: 0,
      year: selectedYear,
      month: selectedMonth
    },
    validate: {
      title: (value: string) => (value ? null : 'Title is required'),
      amount: (value: number) => (value !== undefined ? null : 'Amount is required')
    }
  })

  const handleSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true)
    try {
      if (initialData) {
        updateAccountBalance(initialData.id, values)
        toast({
          title: 'Account balance updated',
          description: `Updated balance for ${values.title}`
        })
      } else {
        addAccountBalance({
          ...values,
          createdAt: Date.now()
        })
        toast({
          title: 'Account balance added',
          description: `Added new balance for ${values.title}`
        })
      }
      form.reset()
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Account Title"
          placeholder="Account Title"
          withAsterisk
          {...form.getInputProps('title')}
        />
        <NumberInput
          label="Balance Amount"
          placeholder="Balance Amount"
          withAsterisk
          decimalScale={2}
          step={0.01}
          {...form.getInputProps('amount')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isSubmitting}>
            {initialData ? 'Update Balance' : 'Add Balance'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
