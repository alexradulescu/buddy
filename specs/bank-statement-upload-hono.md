# Bank Statement Upload Feature Spec (TanStack Router + Hono)

## Overview

Same feature as `bank-statement-upload.md`, but implemented for the TanStack Router + Hono architecture.

Add the ability to upload PDF or CSV bank statement files and have the AI automatically extract and process expenses. The extracted data flows into the existing AI processing pipeline via Hono.

## Architecture Difference

```
Next.js Version:
[Browser] → POST /api/upload-statement → [Next.js API Route] → [AI]

Hono Version:
[Browser] → POST /api/upload-statement → [Hono on Vercel Serverless] → [AI]
```

The frontend behavior is identical. Only the backend implementation differs.

---

## Technical Implementation

### File Structure

```
src/api/
  completion.ts          # Existing AI endpoint
  upload-statement.ts    # New file upload endpoint (create)
  index.ts               # Hono app entry, mounts both routes (update)

api/
  [[...route]].ts        # Vercel adapter (existing, no changes needed)
```

### Hono Endpoint

**`src/api/upload-statement.ts`**:

```ts
import { Hono } from 'hono'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'
import pdf from 'pdf-parse'

const app = new Hono()

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

app.post('/api/upload-statement', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const expenseCategories = JSON.parse(formData.get('expenseCategories') as string)
  const historicalExpenses = JSON.parse(formData.get('historicalExpenses') as string)

  // Validate file exists
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File is too large. Maximum size is 5MB.' }, 400)
  }

  // Validate file type
  const fileType = file.type
  const fileName = file.name.toLowerCase()
  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
  const isCsv = fileType === 'text/csv' || fileName.endsWith('.csv')

  if (!isPdf && !isCsv) {
    return c.json({ error: 'Unsupported file type. Please upload a PDF or CSV file.' }, 400)
  }

  let extractedText: string

  try {
    if (isPdf) {
      // PDF extraction
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfData = await pdf(buffer)
      extractedText = pdfData.text

      console.log('[upload-statement] PDF extracted, length:', extractedText.length)
      console.log('[upload-statement] PDF text preview:', extractedText.substring(0, 500))

      if (!extractedText || extractedText.trim().length < 50) {
        return c.json({ error: 'Could not extract text from PDF. Please try CSV format.' }, 422)
      }
    } else {
      // CSV - read as text directly
      extractedText = await file.text()
      console.log('[upload-statement] CSV content length:', extractedText.length)
      console.log('[upload-statement] CSV preview:', extractedText.substring(0, 500))

      if (!extractedText || extractedText.trim().length < 10) {
        return c.json({ error: 'CSV file appears to be empty.' }, 422)
      }
    }
  } catch (error) {
    console.error('[upload-statement] Extraction error:', error)
    return c.json({ error: 'Failed to read file. Please try a different file.' }, 422)
  }

  // Build prompt for AI (reuse logic from completion.ts)
  const prompt = buildStatementPrompt(extractedText, expenseCategories, historicalExpenses)

  console.log('[upload-statement] Sending to AI, prompt length:', prompt.length)

  // Stream response with extracted text included
  try {
    const result = streamObject({
      model: google('gemini-3-flash-preview'),
      output: 'array',
      schema: expenseSchema,
      prompt,
      maxRetries: 2,
    })

    // Return both extracted text and streaming expenses
    // Client will receive extractedText header + streaming body
    const response = result.toTextStreamResponse()
    response.headers.set('X-Extracted-Text', encodeURIComponent(extractedText))
    return response
  } catch (geminiError) {
    console.error('[upload-statement] Gemini failed, trying OpenAI:', geminiError)

    const result = streamObject({
      model: openai('gpt-4o-mini'),
      output: 'array',
      schema: expenseSchema,
      prompt,
      maxRetries: 2,
    })

    const response = result.toTextStreamResponse()
    response.headers.set('X-Extracted-Text', encodeURIComponent(extractedText))
    return response
  }
})

// Schema for expense (same as completion.ts)
const expenseSchema = z.object({
  date: z.string().describe('Date in yyyy-MM-dd format'),
  amount: z.number().describe('Transaction amount as positive number'),
  description: z.string().describe('Transaction description'),
  categoryId: z.string().describe('Category ID from provided list'),
})

function buildStatementPrompt(
  extractedText: string,
  expenseCategories: Array<{ id: string; name: string }>,
  historicalExpenses: Array<{ date: string; amount: number; description: string; categoryId: string }>
): string {
  const categoryList = expenseCategories
    .map((c) => `- ${c.id}: ${c.name}`)
    .join('\n')

  const historyContext = historicalExpenses.length > 0
    ? `\n\nHere are recent expenses for context on categorization patterns:\n${JSON.stringify(historicalExpenses.slice(0, 50), null, 2)}`
    : ''

  return `You are processing a bank statement to extract EXPENSE transactions only.

IMPORTANT RULES:
1. Only extract EXPENSES (debits, purchases, payments, withdrawals)
2. IGNORE all income/credits (salary, refunds, transfers IN)
3. IGNORE internal transfers between accounts
4. IGNORE refunds (transactions with "REFUND" in description)
5. Include ATM/cash withdrawals
6. All amounts should be POSITIVE numbers
7. Dates must be in yyyy-MM-dd format
8. Match each expense to the most appropriate category from the list below

Available categories:
${categoryList}
${historyContext}

Bank statement content:
---
${extractedText}
---

Extract all expense transactions as a JSON array. For each expense include: date, amount (positive), description, categoryId.`
}

export default app
```

### Update Main Hono App

**`src/api/index.ts`** (or wherever routes are mounted):

```ts
import { Hono } from 'hono'
import completion from './completion'
import uploadStatement from './upload-statement'

const app = new Hono()

// Mount routes
app.route('/', completion)
app.route('/', uploadStatement)

export default app
```

### Vercel Function Config

**`vercel.json`** - Add timeout for file processing:

```json
{
  "functions": {
    "api/**": {
      "maxDuration": 300
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## Frontend Changes

### New Upload Component

**`src/components/expense-file-upload.tsx`**:

```tsx
import { useState } from 'react'
import { FileInput, Button, Stack, Accordion, Code, Alert } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useExpenseStore, useCategoryStore } from '@/stores/instantdb'
// Reuse existing preview component
import { ExpensePreview } from './expense-preview'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ExpenseFileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<Expense[] | null>(null)

  const { expenseCategories } = useCategoryStore()
  const { expenses: existingExpenses } = useExpenseStore()

  const handleFileChange = (newFile: File | null) => {
    setError(null)
    setExtractedText(null)
    setExpenses(null)

    if (newFile && newFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.')
      setFile(null)
      return
    }

    setFile(newFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('expenseCategories', JSON.stringify(expenseCategories))
    formData.append('historicalExpenses', JSON.stringify(getRecentExpenses(existingExpenses)))

    try {
      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      // Get extracted text from header
      const extractedTextHeader = response.headers.get('X-Extracted-Text')
      if (extractedTextHeader) {
        setExtractedText(decodeURIComponent(extractedTextHeader))
      }

      // Stream and parse expenses (same logic as existing AI import)
      const parsedExpenses = await parseStreamedExpenses(response)
      setExpenses(parsedExpenses)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (confirmedExpenses: Expense[]) => {
    // Same save logic as existing AI import
    // ...
    notifications.show({ message: 'Expenses imported successfully', color: 'green' })
    // Reset state for next upload
    setFile(null)
    setExtractedText(null)
    setExpenses(null)
  }

  return (
    <Stack>
      <FileInput
        label="Bank Statement"
        placeholder="Select PDF or CSV file"
        accept=".pdf,.csv"
        value={file}
        onChange={handleFileChange}
        disabled={loading}
      />

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {file && !expenses && (
        <Button onClick={handleUpload} loading={loading}>
          Process File
        </Button>
      )}

      {extractedText && (
        <Accordion>
          <Accordion.Item value="extracted-text">
            <Accordion.Control>Show extracted text</Accordion.Control>
            <Accordion.Panel>
              <Code block style={{ maxHeight: 300, overflow: 'auto' }}>
                {extractedText}
              </Code>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {expenses && (
        <ExpensePreview
          expenses={expenses}
          existingExpenses={existingExpenses}
          onSave={handleSave}
          onCancel={() => {
            setExpenses(null)
            setExtractedText(null)
            setFile(null)
          }}
        />
      )}
    </Stack>
  )
}
```

### Update Expenses Route

**`src/routes/expenses.tsx`**:

```tsx
import { Tabs } from '@mantine/core'
import { ExpenseAiConverter } from '@/components/expense-ai-converter'
import { ExpenseSpreadsheet } from '@/components/expense-spreadsheet'
import { ExpenseFileUpload } from '@/components/expense-file-upload'

function ExpensesPage() {
  return (
    <Tabs defaultValue="upload">
      <Tabs.List>
        <Tabs.Tab value="upload">Upload</Tabs.Tab>
        <Tabs.Tab value="ai-import">AI Import</Tabs.Tab>
        <Tabs.Tab value="manual">Manual Entry</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upload">
        <ExpenseFileUpload />
      </Tabs.Panel>
      <Tabs.Panel value="ai-import">
        <ExpenseAiConverter />
      </Tabs.Panel>
      <Tabs.Panel value="manual">
        <ExpenseSpreadsheet />
      </Tabs.Panel>
    </Tabs>
  )
}
```

---

## Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.4"
  }
}
```

Note: `pdf-parse` works in Node.js/Vercel Serverless. It does NOT work in edge runtime.

---

## Key Differences from Next.js Version

| Aspect | Next.js | Hono |
|--------|---------|------|
| File location | `src/app/api/upload-statement/route.ts` | `src/api/upload-statement.ts` |
| Request handling | `NextRequest` | `c.req.formData()` |
| Response | `NextResponse` | `c.json()` or stream |
| File access | `request.formData()` | `c.req.formData()` |
| Streaming | `NextResponse` with stream | `toTextStreamResponse()` |
| Config export | `export const maxDuration = 300` | `vercel.json` functions config |

---

## Hono-Specific Benefits

1. **Lighter bundle** - Hono is ~14KB vs Next.js API overhead
2. **Faster cold starts** - Minimal initialization
3. **Type-safe routing** - Better TypeScript inference
4. **Middleware composition** - Easy to add logging, auth, etc.
5. **Standard Web APIs** - Uses `FormData`, `File`, `Response` directly

---

## Alternative: Extract Text Header Approach

If the `X-Extracted-Text` header is too large (some proxies limit header size), alternative approaches:

**Option A: Two-phase response**
```ts
// Return JSON with extractedText first, then client makes second request for AI
return c.json({ extractedText, status: 'ready' })
// Client then calls /api/completion with the text
```

**Option B: Envelope the stream**
```ts
// First chunk is metadata, rest is streamed expenses
const encoder = new TextEncoder()
const metaChunk = encoder.encode(JSON.stringify({ extractedText }) + '\n---\n')
// Prepend to stream...
```

**Option C: Store in temp storage**
```ts
// Store extractedText in KV/Redis, return ID
// Client fetches separately if needed
```

Recommendation: Start with header approach, switch to Option A if issues arise.

---

## Validation Checklist

- [ ] PDF upload extracts text correctly (DBS statement)
- [ ] PDF upload extracts text correctly (UOB statement)
- [ ] CSV upload parses correctly (DBS)
- [ ] CSV upload parses correctly (UOB)
- [ ] File size validation works (>5MB rejected)
- [ ] Invalid file type rejected
- [ ] Extracted text shows in accordion
- [ ] AI categorizes expenses correctly
- [ ] Duplicate detection highlights matches
- [ ] Preview edit/delete works
- [ ] Save persists to InstantDB
- [ ] Success toast appears
- [ ] UI resets for next upload
- [ ] Vercel deployment works with streaming
