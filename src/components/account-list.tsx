'use client'

import { AccountBalance, useAccountBalances } from '@/stores/instantdb'
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text
} from '@mantine/core'
import { Edit2, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { AccountForm } from '@/components/account-form'
import { useDisclosure } from '@mantine/hooks'
import { useToast } from '@/hooks/use-toast'

interface AccountListProps {
  selectedYear: number
  selectedMonth: number
}

export const AccountList: React.FC<AccountListProps> = ({ selectedYear, selectedMonth }) => {
  const { data: { accountBalances = [] } = {}, removeAccountBalance } = useAccountBalances(selectedYear, selectedMonth)
  const { toast } = useToast()
  const [editingAccount, setEditingAccount] = useState<AccountBalance | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<AccountBalance | null>(null)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)

  const handleEdit = (account: AccountBalance) => {
    setEditingAccount(account)
    openEditModal()
  }

  const handleDelete = (account: AccountBalance) => {
    setAccountToDelete(account)
    openDeleteModal()
  }

  const confirmDelete = () => {
    if (accountToDelete) {
      removeAccountBalance(accountToDelete.id)
      toast({
        title: 'Account balance deleted',
        description: `Deleted balance for ${accountToDelete.title}`
      })
      closeDeleteModal()
      setAccountToDelete(null)
    }
  }

  return (
    <>
      {accountBalances.length === 0 ? (
        <Text c="dimmed" ta="center" py="md">
          No account balances for this month.
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Account</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Balance</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {accountBalances.map((balance) => (
              <Table.Tr key={balance.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text fw={500}>{balance.title}</Text>
                    <Text size="xs" c="dimmed">ID: {balance.id}</Text>
                  </Stack>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text fw={500}>${balance.amount.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(balance)}>
                      <Edit2 size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(balance)}>
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Account Balance">
        {editingAccount && (
          <AccountForm
            initialData={editingAccount}
            onSubmit={closeEditModal}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        )}
      </Modal>

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Confirm Deletion">
        <Text size="sm" mb="lg">
          Are you sure you want to delete this account balance? This action cannot be undone.
        </Text>
        <Divider my="md" />
        <Group justify="flex-end">
          <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </>
  )
}
