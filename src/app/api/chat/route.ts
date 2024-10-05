import { openai } from '@ai-sdk/openai'
import { Message } from '@ai-sdk/react'
import { convertToCoreMessages, generateText, streamText } from 'ai'

const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.toLocaleString('default', { month: 'short' }) // 'short' gives abbreviated month name
  const day = String(now.getDate()).padStart(2, '0') // Ensure two digits for day

  return `${year}-${month}-${day}`
}

const BASE_PROMPT = `You are ChatGPT, an AI language model designed to assist users by providing helpful and accurate information. Current date: ${getCurrentDate()}. 
When interacting with users, adhere to the following principles:
Understand the Query: Accurately comprehend the user's question or request.
Provide Relevant Information: Offer information that is pertinent to the query, drawing on a wide range of knowledge.
Be Clear and Concise: Ensure that responses are easy to understand and to the point.
Maintain a Conversational Tone: Interact in a way that feels natural and engaging, similar to a human conversation.
Adapt to User Preferences: Tailor responses based on the user's stated preferences and context.
Acknowledge Knowledge Gaps: If you don't know the answer to a query, acknowledge this and do not generate false or inaccurate information.
Request Additional Information: If more information is needed to provide a quality answer, ask the user for the extra details you need.`

/** Allow streaming responses up to 26 seconds, netlify max. Vercel has a much higher limit */
// export const maxDuration = 26

interface ChatRequest {
  messages: Message[]
  userPrompt?: string | null
  model?: string | null
  channel?: string | null
  temperature?: number | null
  topP?: number | null
  maxTokens?: number | null
}

export async function POST(req: Request) {
  const { messages, userPrompt, model, temperature, topP, maxTokens }: ChatRequest = await req.json()

  if (model && model.includes('o1-')) {
    const { text } = await generateText({
      model: openai(model),
      messages: convertToCoreMessages(messages)
    })

    return new Response(text)
  } else {
    const config: Record<string, string | number> = {}
    if (temperature) config.temperature = temperature
    if (topP) config.topP = topP
    if (maxTokens) config.maxTokens = maxTokens

    const result = await streamText({
      /** Fixing the model to gpt-4o-2024-08-06 as the plain 4o can be directed in fact to different models behind the scene.  */
      model: model ? openai(model) : openai('gpt-4o-2024-08-06'),
      messages: convertToCoreMessages(messages),
      /** ChatGPT and other LLM have some base prompts when using their own UIs.
       * This base prompt is used to provide a consistent experience across different platforms and try and replicate that.
       * The based prompts are not public knowledge, this is built based on anecdotal evidence and some reverse engineering.
       */
      system: userPrompt || BASE_PROMPT,
      ...config
    })

    return result.toTextStreamResponse()
  }
}
