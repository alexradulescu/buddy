import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'
import type { QueryCtx } from './_generated/server'

const DAY = 24 * 60 * 60 * 1000

// Single-user app: only OWNER_EMAIL (a Convex env var) can sign up or sign in
const owner = Password({
  profile(params) {
    const email = String(params.email ?? '')
      .trim()
      .toLowerCase()
    if (!email || email !== process.env.OWNER_EMAIL?.trim().toLowerCase()) throw new Error('Not allowed')
    return { email }
  }
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [owner],
  // Stay signed in for ~6 months per device, even when not used for a while
  session: { totalDurationMs: 180 * DAY, inactiveDurationMs: 180 * DAY }
})

export async function requireUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Not signed in')
  return userId
}
