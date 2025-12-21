'use client'

import { useEffect, useState } from 'react'
import { ExpenseCategory, IncomeCategory } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Button, Modal, TextInput, NumberInput, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'

interface TransactionFormProps {
  type: 'expense' | 'income'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { amount: number; description: string; date: string; categoryId: string }) => Promise<void>
  categories: (ExpenseCategory | IncomeCategory)[]
  initialData?: {
    id?: string
    amount?: number
    description?: string
    date?: string
    categoryId?: string
  }
}

export function TransactionForm({ type, open, onOpenChange, onSubmit, categories, initialData }: TransactionFormProps) {
  const [amount, setAmount] = useState<string | number>(initialData?.amount?.toString() || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [date, setDate] = useState<Date | null>(initialData?.date ? new Date(initialData.date) : new Date())
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(initialData?.amount?.toString() || '')
      setDescription(initialData?.description || '')
      setDate(initialData?.date ? new Date(initialData.date) : new Date())
      setCategoryId(initialData?.categoryId || '')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !categoryId || !amount) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        amount: Number(amount) || 0,
        description,
        date: (date instanceof Date ? date : new Date()).toISOString(),
        categoryId
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Transaction save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title={`${initialData?.id ? 'Edit' : 'Add'} ${type}`}
      centered
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NumberInput
          label="Amount"
          value={amount}
          onChange={(value) => setAmount(value || '')}
          placeholder="0.00"
          decimalScale={2}
          required
        />

        <TextInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          required
        />

        <DatePickerInput
          label="Date"
          value={date}
          onChange={(value) => setDate(value ? (typeof value === 'string' ? new Date(value) : value) : new Date())}
          placeholder="Pick a date"
          clearable={false}
          required
        />

        <Select
          label="Category"
          value={categoryId}
          onChange={(value) => setCategoryId(value || '')}
          placeholder="Select a category"
          data={categories.map((category) => ({
            value: category.id,
            label: 'name' in category ? category.name : category.title
          }))}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
