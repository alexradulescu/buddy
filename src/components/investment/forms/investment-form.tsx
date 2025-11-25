'use client'

import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button, Card, TextInput, Textarea, Switch } from '@mantine/core'
import { notifications } from '@mantine/notifications'

interface InvestmentFormProps {
  investment?: Investment
  onSuccess?: () => void
}

export default function InvestmentForm({ investment, onSuccess }: InvestmentFormProps) {
  const navigate = useNavigate()
  const { addInvestment, updateInvestment } = useInvestmentStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
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
        notifications.show({
          title: 'Investment updated',
          message: 'Your investment has been updated successfully.',
          color: 'green'
        })
      } else {
        await addInvestment({
          ...data,
          createdDate: new Date().toISOString()
        })
        notifications.show({
          title: 'Investment created',
          message: 'Your investment has been created successfully.',
          color: 'green'
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/investments')
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'There was an error saving your investment. Please try again.',
        color: 'red'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="md">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          {investment ? 'Edit Investment' : 'Add Investment'}
        </h2>
      </Card.Section>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card.Section inheritPadding py="md" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextInput
                label="Name"
                placeholder="Investment name"
                error={errors.name?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Description (optional)"
                placeholder="Investment description"
                error={errors.description?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Active</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                    Mark this investment as active or inactive
                  </div>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </Card.Section>
        <Card.Section withBorder inheritPadding py="md" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outline" onClick={() => navigate('/investments')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {investment ? 'Update' : 'Create'}
          </Button>
        </Card.Section>
      </form>
    </Card>
  )
}
