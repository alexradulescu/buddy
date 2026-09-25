import { useState } from 'react'
import { Button, FileInput, Stack, Text, Textarea, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Upload } from 'lucide-react'

import type { Option } from '@/components/entry-modal'
import { Sheet } from '@/components/sheet'
import { draftColumns, saveDrafts, type Draft } from '@/components/transactions'
import type { Expense } from '@/db'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

type Props = {
  categories: Option[] // active expense categories
  history: Expense[] // recent expenses, to learn categorization from
  monthExpenses: Expense[] // already saved, to flag duplicates
  year: number
  month: number
}

// Paste bank text or pick a PDF/CSV statement -> AI streams categorized rows -> review -> save
export function ImportPanel({ categories, history, monthExpenses, year, month }: Props) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<Draft[]>([])
  const [loading, setLoading] = useState(false)
  useUnsavedChangesWarning(rows.length > 0)

  const isDuplicate = (row: Draft) => monthExpenses.some((e) => e.date === row.date && e.amount === row.amount)

  async function run() {
    const form = new FormData()
    if (file) form.append('file', file)
    else form.append('text', text)
    form.append('categories', JSON.stringify(categories.map((c) => ({ id: c.value, name: c.label }))))
    form.append(
      'history',
      JSON.stringify(history.map(({ description, categoryId, amount }) => ({ description, categoryId, amount })))
    )

    setLoading(true)
    setRows([])
    try {
      const res = await fetch('/api/categorize', { method: 'POST', body: form })
      if (!res.ok || !res.body)
        throw new Error((await res.json().catch(() => null))?.error ?? `Server error ${res.status}`)

      // One JSON expense per line, appended as they arrive
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      let found = 0
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        buffer += chunk.value
        const lines = buffer.split('\n')
        buffer = lines.pop()!
        const parsed = lines.filter(Boolean).map((l) => ({ ...JSON.parse(l), id: crypto.randomUUID() }) as Draft)
        found += parsed.length
        setRows((prev) => [...prev, ...parsed])
      }
      notifications.show(
        found
          ? { title: 'Expenses processed', message: `${found} expenses ready for review`, color: 'green' }
          : { title: 'No expenses found', message: 'The AI did not find any expenses', color: 'yellow' }
      )
    } catch (e) {
      notifications.show({ title: 'Error', message: e instanceof Error ? e.message : 'Import failed', color: 'red' })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setRows([])
    setText('')
    setFile(null)
  }

  if (rows.length > 0) {
    return (
      <Stack gap="md">
        <Title order={3} size="h5">
          {loading ? 'Processing…' : 'Processed Expenses'}
        </Title>
        <Text size="sm" c="dimmed">
          {rows.length} {rows.length === 1 ? 'item' : 'items'}
        </Text>
        <Sheet
          rows={rows}
          columns={draftColumns(categories)}
          highlight={isDuplicate}
          onChange={(row) => setRows(rows.map((r) => (r.id === row.id ? row : r)))}
          onDelete={(row) => setRows(rows.filter((r) => r.id !== row.id))}
        />
        <Button disabled={loading} onClick={() => saveDrafts('expenses', rows, year, month) && reset()}>
          Save Expenses
        </Button>
        <Button color="red" onClick={reset}>
          Discard
        </Button>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <FileInput
        label="Bank Statement"
        description="PDF or CSV file (max 5MB)"
        placeholder="Select file..."
        accept=".pdf,.csv"
        value={file}
        onChange={setFile}
        disabled={loading}
        leftSection={<Upload size={16} />}
        clearable
      />
      {!file && (
        <Textarea
          label="Or paste transactions"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your expense details here..."
          minRows={4}
          maxRows={10}
          readOnly={loading}
        />
      )}
      <Button onClick={run} disabled={!file && !text.trim()} loading={loading} fullWidth>
        {file ? 'Process File' : 'Convert'}
      </Button>
    </Stack>
  )
}
