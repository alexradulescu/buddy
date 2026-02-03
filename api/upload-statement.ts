import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildStatementPrompt, streamAIResponse } from './_lib/expense-ai'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const maxDuration = 300

/**
 * Vercel serverless function for bank statement upload
 * Accepts PDF/CSV files, extracts text, and processes with AI
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = await getFormData(req)
    const file = formData.get('file') as File | null
    const expenseCategoriesJson = formData.get('expenseCategories') as string | null
    const historicalExpensesJson = formData.get('historicalExpenses') as string | null

    // Validate file exists
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' })
    }

    // Validate file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isCsv = fileType === 'text/csv' || fileName.endsWith('.csv')

    if (!isPdf && !isCsv) {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or CSV file.' })
    }

    let extractedText: string

    try {
      if (isPdf) {
        const pdfParse = (await import('pdf-parse')).default
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text

        console.log('[upload-statement] PDF extracted, length:', extractedText.length)

        if (!extractedText || extractedText.trim().length < 50) {
          return res.status(422).json({ error: 'Could not extract text from PDF. Please try CSV format.' })
        }
      } else {
        extractedText = await file.text()
        console.log('[upload-statement] CSV content length:', extractedText.length)

        if (!extractedText || extractedText.trim().length < 10) {
          return res.status(422).json({ error: 'CSV file appears to be empty.' })
        }
      }
    } catch (error) {
      console.error('[upload-statement] Extraction error:', error)
      return res.status(422).json({ error: 'Failed to read file. Please try a different file.' })
    }

    // Parse categories and historical expenses
    const expenseCategories = JSON.parse(expenseCategoriesJson || '[]')
    const historicalExpenses = JSON.parse(historicalExpensesJson || '[]')

    // Build prompt for AI
    const prompt = buildStatementPrompt({ extractedText, expenseCategories, historicalExpenses })
    console.log('[upload-statement] Sending to AI, prompt length:', prompt.length)

    // Get streaming AI response
    const streamResponse = await streamAIResponse(prompt)

    // Add extracted text to response headers
    streamResponse.headers.set('X-Extracted-Text', encodeURIComponent(extractedText))

    // Forward headers from streaming response
    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Pipe the stream to response
    const reader = streamResponse.body?.getReader()
    if (!reader) {
      return res.status(500).json({ error: 'No response stream available' })
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }

    res.end()
  } catch (error) {
    console.error('[upload-statement] Request processing error:', error)
    res.status(500).json({
      error: 'Failed to process bank statement',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Parse FormData from Vercel request
 * Vercel's body parsing doesn't handle multipart/form-data properly
 * so we need to parse it manually
 */
async function getFormData(req: VercelRequest): Promise<FormData> {
  // Vercel might have already parsed the body
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    // Body was parsed as JSON, need to reconstruct FormData
    const formData = new FormData()
    for (const [key, value] of Object.entries(req.body)) {
      formData.append(key, value as any)
    }
    return formData
  }

  // Read raw body and parse FormData
  const busboy = await import('busboy')
  const contentType = req.headers['content-type'] || ''

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    const bb = busboy.default({ headers: { 'content-type': contentType } })

    bb.on('file', (name, file, info) => {
      const chunks: Buffer[] = []
      file.on('data', (chunk: Buffer) => chunks.push(chunk))
      file.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const blob = new Blob([buffer.buffer], { type: info.mimeType })
        formData.append(name, blob as any, info.filename)
      })
    })

    bb.on('field', (name, value) => {
      formData.append(name, value)
    })

    bb.on('finish', () => resolve(formData))
    bb.on('error', reject)

    if (req.readable) {
      req.pipe(bb)
    } else {
      bb.end()
    }
  })
}
