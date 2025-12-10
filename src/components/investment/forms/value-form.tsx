'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { InvestmentValue } from '@/types/investment'
import { Button, TextInput, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useForm } from 'react-hook-form'

interface ValueFormProps {
  investmentId: string
  value?: InvestmentValue
  onSuccess?: () => void
  onCancel?: () => void
}

function formatDateForInput(date?: string): string {
  const d = date ? new Date(date) : new Date()
  return d.toISOString().split('T')[0]
}

export default function ValueForm({ investmentId, value, onSuccess, onCancel }: ValueFormProps) {
  const { addValue, updateValue } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      value: value?.value?.toString() || '',
      date: formatDateForInput(value?.date),
      description: value?.description || ''
    }
  })

  const onSubmit = async (data: { value: string; date: string; description: string }) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        value: parseFloat(data.value) || 0,
        date: new Date(data.date).toISOString(),
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
        <TextInput
          label="Value ($)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.value?.message}
          {...register('value', {
            required: 'Value is required',
            validate: (v) => parseFloat(v) > 0 || 'Value must be greater than 0'
          })}
        />

        <TextInput
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />

        <Textarea
          label="Description (optional)"
          placeholder="Value description"
          {...register('description')}
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
