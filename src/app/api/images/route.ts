import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/** Allow streaming responses up to 26 seconds, netlify max. Vercel has a much higher limit */
export const maxDuration = 26

/** Currently not fully implemented, to be done in post MVP as uit needs a more dedicated UI/UX */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1, // Dall-e 3 only supports 1 image in parallel.
    size: '1024x1024', // Maybe configurable in the future.
    style: 'vivid', // Natural look looks off and strange
    quality: 'standard' // Standard because HD would take longer and timeout on Netlify
  })

  return NextResponse.json({ imageUrl: response.data[0].url })
}
