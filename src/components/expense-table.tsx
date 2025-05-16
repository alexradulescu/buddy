'use client'

import React from 'react'
import { Expense, ExpenseCategory } from '@/stores/instantdb'
import { TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from './ui/textarea'

interface ExpenseTableProps {
  expenses: Expense[]
  expenseCategories: ExpenseCategory[]
  onInputChange: (
    index: number,
    field: 'amount' | 'categoryId' | 'date' | 'description',
    value: string | number | Date
  ) => void
  onDeleteRow: (id: string) => void
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  expenseCategories,
  onInputChange,
  onDeleteRow
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-[50vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Amount</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead className="w-[130px]">Date</TableHead>
              <TableHead className="w-[220px]">Description</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={expense.id}>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => onInputChange(index, 'amount', Number(e.target.value))}
                    step="0.01"
                    min="0"
                    required
                    className="w-full h-full rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-2"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Select
                    value={expense.categoryId}
                    onValueChange={(value) => onInputChange(index, 'categoryId', value)}
                  >
                    <SelectTrigger className="w-full h-full rounded-none">
                      <div className="w-full flex items-center truncate max-w-[100px] overflow-hidden">
                        <SelectValue placeholder={'Select Category'} className="truncate overflow-hidden" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories
                        .filter((category) => !category.isArchived)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-1">
                  <DatePicker
                    date={new Date(expense.date)}
                    onDateChange={(date) => onInputChange(index, 'date', date!)}
                    className="w-full h-full rounded-none"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Textarea
                    value={expense.description}
                    onChange={(e) => onInputChange(index, 'description', e.target.value)}
                    className="w-full h-full rounded-none py-2"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteRow(expense.id)}
                    className="w-full h-full rounded-none"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
