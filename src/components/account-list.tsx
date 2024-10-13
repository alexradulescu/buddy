'use client'

import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Account Balances</CardTitle>
          <Badge variant="outline">{`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}</Badge>
        </div>
        <CardDescription>Manage your account balances for the selected period</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {accountBalances.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No account balances for this month.</p>
        ) : (
          <ul className="space-y-4">
            {accountBalances.map((account) => (
              <li key={account.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{account.title}</h3>
                    <p className="text-sm text-muted-foreground">ID: {account.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right font-semibold">${account.amount.toFixed(2)}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(account)}>
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
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
      </CardFooter>

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
    </Card>
  )
}
