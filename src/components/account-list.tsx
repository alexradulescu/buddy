import React, { useState } from 'react'
import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import { Edit2, Trash2 } from 'lucide-react'
import { AccountForm } from '@/components/account-form'
import { Button, Modal, Group, Text, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

interface AccountListProps {
  selectedYear: number
  selectedMonth: number
}

export const AccountList: React.FC<AccountListProps> = ({ selectedYear, selectedMonth }) => {
  const { data: { accountBalances = [] } = {}, removeAccountBalance } = useAccountBalances(selectedYear, selectedMonth)
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
      notifications.show({
        title: 'Account balance deleted',
        message: `Deleted balance for ${accountToDelete.title}`,
        color: 'green'
      })
      setIsDeleteDialogOpen(false)
      setAccountToDelete(null)
    }
  }

  return (
    <>
      {accountBalances.length === 0 ? (
        <Text ta="center" c="dimmed" py="md">
          No account balances for this month.
        </Text>
      ) : (
        <Stack gap="xs">
          {accountBalances.map((balance) => (
            <Group key={balance.id} justify="space-between" wrap="nowrap">
              <Text size="sm" fw={500}>{balance.title}</Text>
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={600} className="numeric-value">
                  {currencyFormatter.format(balance.amount)}
                </Text>
                <Button size="compact-xs" variant="subtle" onClick={() => handleEdit(balance)}>
                  <Edit2 size={12} />
                </Button>
                <Button size="compact-xs" variant="subtle" color="red" onClick={() => handleDelete(balance)}>
                  <Trash2 size={12} />
                </Button>
              </Group>
            </Group>
          ))}
        </Stack>
      )}

      <Modal
        opened={editingAccount !== null}
        onClose={() => setEditingAccount(null)}
        title="Edit Account Balance"
        centered
      >
        {editingAccount && (
          <AccountForm
            initialData={editingAccount}
            onSubmit={() => setEditingAccount(null)}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        )}
      </Modal>

      <Modal
        opened={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Are you sure?"
        centered
      >
        <Text size="sm">This action cannot be undone. This will permanently delete the account balance.</Text>
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  )
}
