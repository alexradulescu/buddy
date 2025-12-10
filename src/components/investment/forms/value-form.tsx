'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { InvestmentValue } from '@/types/investment'
import { Button, NumberInput, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { Controller, useForm } from 'react-hook-form'

interface ValueFormProps {
  investmentId: string
  value?: InvestmentValue
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ValueForm({ investmentId, value, onSuccess, onCancel }: ValueFormProps) {
  const { addValue, updateValue } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      value: value?.value || 0,
      date: value?.date ? new Date(value.date) : new Date(),
      description: value?.description || ''
    }
  })

  const onSubmit = async (data: { value: number; date: Date; description: string }) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        value: Number(data.value) || 0,
        date: (data.date instanceof Date ? data.date : new Date()).toISOString(),
        description: data.description || ''
      }

      console.info({ formattedData })

      if (value) {
        await updateValue(value.id, formattedData)
        notifications.show({
          title: 'Value updated',
          message: 'Your value entry has been updated successfully.',
          color: 'green'
        })
      } else {
        await addValue({
          ...formattedData,
          investmentId
        })
        notifications.show({
          title: 'Value added',
          message: 'Your value entry has been added successfully.',
          color: 'green'
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Value save error:', error)
      notifications.show({
        title: 'Error',
        message: 'There was an error saving your value entry. Please try again.',
        color: 'red'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 'var(--mantine-radius-md)',
        backgroundColor: 'var(--mantine-color-gray-0)'
      }}
    >
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>
        {value ? 'Edit Value' : 'Add Value'}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Controller
          name="value"
          control={control}
          rules={{
            required: 'Value is required',
            validate: (v) => v > 0 || 'Value must be greater than 0'
          }}
          render={({ field }) => (
            <NumberInput
              label="Value"
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              error={errors.value?.message}
              value={field.value}
              onChange={(val) => field.onChange(typeof val === 'number' ? val : 0)}
              onBlur={field.onBlur}
              name={field.name}
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
              clearable={false}
              error={errors.date?.message}
              value={field.value}
              onChange={(val) => field.onChange(val ?? new Date())}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description (optional)"
              placeholder="Value description"
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
            {value ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  )
}
