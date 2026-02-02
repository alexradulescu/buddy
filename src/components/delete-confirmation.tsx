import { Button, Modal } from '@mantine/core'

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  recordDetails?: Record<string, string | number | null | undefined>
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  recordDetails,
}: DeleteConfirmationProps) {
  return (
    <Modal opened={isOpen} onClose={onClose} title={title} centered>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--mantine-color-dimmed)' }}>
          {description}
          {recordDetails && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
              {Object.entries(recordDetails).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--mantine-color-dimmed)', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span>
                    {value === null || value === undefined ? 'N/A' : value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button
            color="red"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
