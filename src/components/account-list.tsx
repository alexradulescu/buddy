'use client'

import React, { useState } from 'react'
import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface AccountListProps {
  selectedYear: number
  selectedMonth: number
}

export const AccountList: React.FC<AccountListProps> = ({ selectedYear, selectedMonth }) => {
  const { data: { accountBalances = [] } = {}, removeAccountBalance } = useAccountBalances(selectedYear, selectedMonth)
  const { toast } = useToast()
  const [editingAccount, setEditingAccount] = useState<AccountBalance | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<AccountBalance | null>(null)

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
    <>
      <div className="p-6">
        {accountBalances.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No account balances for this month.</p>
        ) : (
          <ul className="space-y-4">
            {accountBalances.map((balance) => (
              <li key={balance.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{balance.title}</h3>
                    <p className="text-sm text-muted-foreground">ID: {balance.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right font-semibold">${balance.amount.toFixed(2)}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(balance)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(balance)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <Separator className="my-2" />
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </>
  )
}
