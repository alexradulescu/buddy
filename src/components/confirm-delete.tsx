import { Button, Group, Modal, Paper, Stack, Text } from '@mantine/core'

type Props = {
  title: string
  opened: boolean
  details?: Record<string, string> // shown as "Key: value" lines
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDelete({ title, opened, details, onConfirm, onClose }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          This action cannot be undone.
        </Text>
        {details && (
          <Paper withBorder p="sm">
            {Object.entries(details).map(([key, value]) => (
              <Group key={key} justify="space-between" mb={4}>
                <Text size="sm" fw={500} c="dimmed">
                  {key}:
                </Text>
                <Text size="sm">{value}</Text>
              </Group>
            ))}
          </Paper>
        )}
        <Group justify="flex-end" gap="xs">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
