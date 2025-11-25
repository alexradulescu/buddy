'use client'

import React, { useState } from 'react'
import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
import { AccountForm } from '@/components/account-form'
import { Button, Modal, Menu, Divider } from '@mantine/core'
import { notifications } from '@mantine/notifications'

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
      <div style={{ padding: '1.5rem' }}>
        {accountBalances.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--mantine-color-dimmed)', padding: '1rem 0' }}>
            No account balances for this month.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {accountBalances.map((balance) => (
              <li key={balance.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{balance.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>ID: {balance.id}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>${balance.amount.toFixed(2)}</div>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <Button variant="subtle" size="compact-sm" p={0}>
                          <MoreVertical size={16} />
                          <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
                            Actions
                          </span>
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Edit2 size={16} />} onClick={() => handleEdit(balance)}>
                          Edit
                        </Menu.Item>
                        <Menu.Item leftSection={<Trash2 size={16} />} color="red" onClick={() => handleDelete(balance)}>
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </div>
                <Divider my="sm" />
              </li>
            ))}
          </ul>
        )}
      </div>

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
        <p>This action cannot be undone. This will permanently delete the account balance.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
