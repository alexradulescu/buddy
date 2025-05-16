'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ExpenseCategory, IncomeCategory } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date())
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
        amount: parseFloat(amount),
        description,
        date: date.toISOString(),
        categoryId
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit' : 'Add'} {type}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const name = 'name' in category ? category.name : category.title
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      {name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
