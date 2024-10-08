'use client'

import { Download, Upload } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAccountStore } from '@/stores/account-store'
import { useCategoryStore } from '@/stores/category-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useIncomeStore } from '@/stores/income-store'

export const BackupRestore: React.FC = () => {
  const { toast } = useToast()
  const accountStore = useAccountStore()
  const categoryStore = useCategoryStore()
  const expenseStore = useExpenseStore()
  const incomeStore = useIncomeStore()

  const handleBackup = () => {
    const backupData = {
      accountBalances: accountStore.accountBalances,
      expenseCategories: categoryStore.expenseCategories,
      incomeCategories: categoryStore.incomeCategories,
      expenses: expenseStore.expenses,
      incomes: incomeStore.incomes
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `buddy-app-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Backup created',
      description: 'Your data has been successfully backed up.'
    })
  }

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)

        accountStore.setAccountBalances(backupData.accountBalances)
        categoryStore.setExpenseCategories(backupData.expenseCategories)
        categoryStore.setIncomeCategories(backupData.incomeCategories)
        expenseStore.setExpenses(backupData.expenses)
        incomeStore.setIncomes(backupData.incomes)

        toast({
          title: 'Backup restored',
          description: 'Your data has been successfully restored from the backup file.'
        })
      } catch (error) {
        console.error('Error restoring backup:', error)
        toast({
          title: 'Restore failed',
          description: 'There was an error restoring your backup. Please try again with a valid backup file.',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Backup and Restore</h2>
      <div className="flex space-x-4">
        <Button onClick={handleBackup}>
          <Download className="mr-2 h-4 w-4" />
          Download Backup
        </Button>
        <div>
          <input type="file" id="restore-file" className="hidden" accept=".json" onChange={handleRestore} />
          <Button asChild>
            <label htmlFor="restore-file" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Restore from Backup
            </label>
          </Button>
        </div>
      </div>
    </div>
  )
}
