'use client'

import React, { useMemo, useState } from 'react'
import { useIncomeStore } from '@/stores/instantdb'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface IncomeListProps {
  selectedYear: number
  selectedMonth: number
}

export const IncomeList: React.FC<IncomeListProps> = ({ selectedMonth, selectedYear }) => {
  const { data: { incomes = [] } = {}, removeIncome } = useIncomeStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSortedIncomes = useMemo(() => {
    return incomes
      .filter((income) => {
        const incomeDate = new Date(income.date)
        const matchesDate = incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() === selectedMonth
        const matchesSearch =
          income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.amount.toString().includes(searchTerm) ||
          income.category.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesDate && matchesSearch
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [incomes, selectedYear, selectedMonth, searchTerm])

  const handleDelete = (id: string) => {
    removeIncome(id)
    toast({
      title: 'Income deleted',
      description: 'The income has been successfully removed.',
      variant: 'default'
    })
  }

  return (
    <div className="space-y-4">
      <label className="relative d-block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </label>

      {filteredAndSortedIncomes.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No incomes found for this period.</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filteredAndSortedIncomes.map((income, index) => (
                <li key={income.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{income.description}</h3>
                      <p className="text-sm text-muted-foreground">{income.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${income.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(income.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(income.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
