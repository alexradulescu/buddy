import { useEffect, useRef, useState } from 'react'
import { Button, FileInput, Stack, Text, Textarea, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery } from 'convex/react'
import { Upload } from 'lucide-react'

import { api } from '@convex/_generated/api'
import type { Option } from '@/components/entry-modal'
import { Sheet } from '@/components/sheet'
import { draftColumns, saveDrafts, type Draft } from '@/components/transactions'
import type { Expense } from '@/db'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

type Props = {
  categories: Option[] // active expense categories
  monthExpenses: Expense[] // already saved, to flag duplicates
  year: number
  month: number
}

// Paste bank text or pick a PDF/CSV statement -> AI (a Convex action) streams categorized rows -> review -> save.
// The rows live in an import job on the server, so a reload doesn't lose them.
export function ImportPanel({ categories, monthExpenses, year, month }: Props) {
  const job = useQuery(api.imports.current)
  const generateUploadUrl = useMutation(api.imports.generateUploadUrl)
  const start = useMutation(api.imports.start)
  const clear = useMutation(api.imports.clear)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<Draft[]>([]) // local, editable copy of the job's rows
  const [starting, setStarting] = useState(false)
  const seen = useRef(0) // job rows already copied into `rows`
  const loading = starting || job?.status === 'running'
  useUnsavedChangesWarning(rows.length > 0)

  useEffect(() => {
    if (!job) return
    const fresh = job.rows.slice(seen.current)
    if (fresh.length) {
      seen.current = job.rows.length
      setRows((prev) => [...prev, ...fresh.map((r) => ({ ...r, id: crypto.randomUUID() }))])
    }
    const failed = job.status === 'error' || (job.status === 'done' && !job.rows.length)
    if (!failed) return
    notifications.show(
      job.status === 'error'
        ? { title: 'Error', message: job.error ?? 'Import failed', color: 'red' }
        : { title: 'No expenses found', message: 'The AI did not find any expenses', color: 'yellow' }
    )
    seen.current = 0
    setRows([])
    void clear()
  }, [job, clear])

  const isDuplicate = (row: Draft) => monthExpenses.some((e) => e.date === row.date && e.amount === row.amount)

  async function run() {
    setStarting(true)
    seen.current = 0
    setRows([])
    try {
      if (file) {
        const res = await fetch(await generateUploadUrl(), {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file
        })
        if (!res.ok) throw new Error(`Upload failed (${res.status})`)
        const { storageId } = await res.json()
        await start({ fileId: storageId, fileName: file.name })
      } else {
        await start({ text })
      }
    } catch (e) {
      notifications.show({ title: 'Error', message: e instanceof Error ? e.message : 'Import failed', color: 'red' })
    } finally {
      setStarting(false)
    }
  }

  function reset() {
    seen.current = 0
    setRows([])
    void clear()
  }

  function discard() {
    reset()
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
        <Button disabled={loading} onClick={async () => (await saveDrafts('expenses', rows, year, month)) && discard()}>
          Save Expenses
        </Button>
        <Button color="red" onClick={discard}>
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
