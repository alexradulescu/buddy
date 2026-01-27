import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Investment } from '@/types/investment'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { Button, Card, TextInput, Textarea, Switch, Stack, Group, Text, Title } from '@mantine/core'
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
        navigate({ to: '/investments' })
      }
    } catch (error) {
      console.error('Investment save error:', error)
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
    <Card>
      <Title order={5} mb="sm">{investment ? 'Edit Investment' : 'Add Investment'}</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
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
              <Group
                justify="space-between"
                p="xs"
                style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}
              >
                <Stack gap={0}>
                  <Text size="sm" fw={500}>Active</Text>
                  <Text size="xs" c="dimmed">Mark this investment as active or inactive</Text>
                </Stack>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                />
              </Group>
            )}
          />

          <Group justify="space-between" mt="xs">
            <Button variant="subtle" color="gray" onClick={() => navigate({ to: '/investments' })}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {investment ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}
