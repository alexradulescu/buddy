import type { ReactNode } from 'react'
import { ActionIcon, Button, Modal } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { Plus } from 'lucide-react'
import { createPortal } from 'react-dom'

import { PageHeader } from '@/components/shell'

// "Add expense" / "Add income": a header button (desktop), a floating + (phones) and the N shortcut,
// all opening the entry panel in a modal. The modal stays mounted so unsaved drafts survive closing it.
export function AddEntry({
  label,
  opened,
  setOpened,
  children
}: {
  label: string
  opened: boolean
  setOpened: (opened: boolean) => void
  children: ReactNode
}) {
  useHotkeys([['n', () => setOpened(true)]])

  return (
    <>
      <PageHeader
        actions={
          <Button visibleFrom="sm" leftSection={<Plus size={16} />} onClick={() => setOpened(true)}>
            {label}
          </Button>
        }
      />
      {createPortal(
        <ActionIcon
          className="fab"
          variant="filled"
          size={56}
          radius="xl"
          aria-label={label}
          onClick={() => setOpened(true)}
        >
          <Plus size={26} strokeWidth={2.2} color="#fff" />
        </ActionIcon>,
        document.body
      )}
      <Modal opened={opened} onClose={() => setOpened(false)} title={label} size="lg" keepMounted>
        {children}
      </Modal>
    </>
  )
}
