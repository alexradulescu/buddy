'use client'

import { Edit2, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { AccountForm } from '@/components/account-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { AccountBalance, useAccountStore } from '@/stores/account-store'

interface AccountListProps {
  selectedYear: number
  selectedMonth: number
}

export const AccountList: React.FC<AccountListProps> = ({ selectedYear, selectedMonth }) => {
  const { getAccountBalances, removeAccountBalance } = useAccountStore()
  const { toast } = useToast()
  const [editingAccount, setEditingAccount] = useState<AccountBalance | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<AccountBalance | null>(null)

  const accountBalances = getAccountBalances(selectedYear, selectedMonth)

  const handleEdit = (account: AccountBalance) => {
    setEditingAccount(account)
  }

  const handleDelete = (account: AccountBalance) => {
    setAccountToDelete(account)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (accountToDelete) {
      removeAccountBalance(accountToDelete.id)
      toast({
        title: 'Account balance deleted',
        description: `Deleted balance for ${accountToDelete.title}`
      })
      setIsDeleteDialogOpen(false)
      setAccountToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Account Balances</h2>
      {accountBalances.length === 0 ? (
        <p>No account balances for this month.</p>
      ) : (
        <ul className="space-y-2">
          {accountBalances.map((account) => (
            <li key={account.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <div>
                <span className="font-semibold">{account.title}</span>: ${account.amount.toFixed(2)}
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(account)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editingAccount !== null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account Balance</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              initialData={editingAccount}
              onSubmit={() => setEditingAccount(null)}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
