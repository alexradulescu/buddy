'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { InvestmentContribution } from '@/types/investment'
import { useForm, Controller } from 'react-hook-form'
import { Button, NumberInput, Textarea, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'

interface ContributionFormProps {
  investmentId: string
  contribution?: InvestmentContribution
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ContributionForm({ investmentId, contribution, onSuccess, onCancel }: ContributionFormProps) {
  const { addContribution, updateContribution } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      amount: contribution?.amount || 0,
      date: contribution?.date ? new Date(contribution.date) : new Date(),
      description: contribution?.description || ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        amount: data.amount,
        date: data.date.toISOString(),
        description: data.description
      }

      if (contribution) {
        await updateContribution(contribution.id, formattedData)
        notifications.show({
          title: 'Contribution updated',
          message: 'Your contribution has been updated successfully.',
          color: 'green'
        })
      } else {
        await addContribution({
          ...formattedData,
          investmentId
        })
        notifications.show({
          title: 'Contribution added',
          message: 'Your contribution has been added successfully.',
          color: 'green'
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'There was an error saving your contribution. Please try again.',
        color: 'red'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>
        {contribution ? 'Edit Contribution' : 'Add Contribution'}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: 'Amount is required',
            validate: (value) => value > 0 || 'Amount must be greater than 0'
          }}
          render={({ field }) => (
            <NumberInput
              label="Amount"
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              error={errors.amount?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{ required: 'Date is required' }}
          render={({ field }) => (
            <DatePickerInput
              label="Date"
              placeholder="Select date"
              valueFormat="YYYY-MM-DD"
              error={errors.date?.message}
              value={field.value}
              onChange={(value) => field.onChange(value || new Date())}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description (optional)"
              placeholder="Contribution description"
              error={errors.description?.message}
              {...field}
            />
          )}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {contribution ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  )
}
