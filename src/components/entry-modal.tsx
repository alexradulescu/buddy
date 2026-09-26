import { useState } from 'react'
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'

export type Entry = { id?: string; date: string; amount: number; description: string; categoryId: string }
export type Option = { value: string; label: string }

type Props = {
  title: string
  entry: Entry | null // null = closed
  categories: Option[]
  onSave: (entry: Entry) => void
  onClose: () => void
}

export function EntryModal({ title, entry, categories, onSave, onClose }: Props) {
  return (
    <Modal opened={!!entry} onClose={onClose} title={title} centered>
      {entry && <EntryForm entry={entry} categories={categories} onSave={onSave} onClose={onClose} />}
    </Modal>
  )
}

function EntryForm({ entry, categories, onSave, onClose }: Omit<Props, 'title' | 'entry'> & { entry: Entry }) {
  const [values, setValues] = useState(entry)
  const set = (patch: Partial<Entry>) => setValues({ ...values, ...patch })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(values)
      }}
    >
      <Stack gap="md">
        <NumberInput
          label="Amount"
          placeholder="0.00"
          decimalScale={2}
          required
          value={values.amount}
          onChange={(v) => set({ amount: Number(v) || 0 })}
        />
        <TextInput
          label="Description"
          required
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
        />
        <DatePickerInput
          label="Date"
          required
          value={values.date}
          onChange={(d) => d && set({ date: dayjs(d).format('YYYY-MM-DD') })}
        />
        <Select
          label="Category"
          data={categories}
          required
          searchable
          value={values.categoryId}
          onChange={(v) => set({ categoryId: v ?? '' })}
        />
        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  )
}
