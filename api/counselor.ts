import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { streamText, type CoreMessage } from 'ai'

export const maxDuration = 300

const SYSTEM_PROMPT = `You are an expert financial counselor specializing in personal finance optimization for families living in Singapore. You help people understand their spending patterns, identify savings opportunities, and build healthier financial habits — without sacrificing quality of life.

Your approach:
- Be specific and data-driven, referencing actual numbers from the data
- Be empathetic and practical, not preachy
- Consider Singapore's cost of living context (housing, transport, food, childcare, etc.)
- Focus on comfort-preserving savings: find the waste, not the comfort
- When multiple months are provided, highlight trends and changes over time

When providing the initial analysis, always structure your response with these sections:
1. **Executive Summary** — 3-4 sentence overview of financial health
2. **Income & Savings Rate** — How much is coming in, what percentage is being saved
3. **Spending Patterns** — Where the money is going, top categories
4. **Month-over-Month Trends** — Changes across months (if multiple months provided)
5. **Optimization Opportunities** — Specific areas to trim without losing comfort, with estimated savings
6. **Actionable Next Steps** — A prioritized list of 3-5 concrete actions to take

For follow-up questions, be conversational and specific to the data you've already analyzed.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function streamCounselorResponse(messages: CoreMessage[]): Promise<Response> {
  try {
    console.log('[Counselor] Using Gemini 3 Flash')
    const result = streamText({
      model: google('gemini-3-flash-preview'),
      messages,
      maxRetries: 2
    })
    return result.toTextStreamResponse()
  } catch (geminiError) {
    console.warn('[Counselor] Gemini failed, falling back to GPT-4o-mini:', geminiError)
    try {
      console.log('[Counselor] Using GPT-4o-mini (fallback)')
      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
        maxRetries: 2
      })
      return result.toTextStreamResponse()
    } catch (openaiError) {
      console.error('[Counselor] Both providers failed:', { geminiError, openaiError })
      throw new Error('Counselor AI failed with all providers')
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { financialData, userContext, messages } = req.body as {
      financialData: string
      userContext: string
      messages: ChatMessage[]
    }

    if (!financialData || typeof financialData !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid financialData' })
    }

    const systemContent = [
      SYSTEM_PROMPT,
      '',
      '## User Background',
      userContext?.trim() || '(No personal context provided)',
      '',
      '## Financial Data',
      financialData
    ].join('\n')

    const allMessages: CoreMessage[] = [
      { role: 'system', content: systemContent }
    ]

    if (!messages || messages.length === 0) {
      allMessages.push({
        role: 'user',
        content: 'Please analyze my financial data and provide your counseling report.'
      })
    } else {
      messages.forEach((m) => allMessages.push({ role: m.role, content: m.content }))
    }

    const streamResponse = await streamCounselorResponse(allMessages)

    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

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
    console.error('[Counselor] Request processing error:', error)
    res.status(500).json({
      error: 'Failed to process counselor request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
