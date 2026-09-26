# Buddy

Personal finance app: expenses, incomes, account balances, investments and budgets.
Vite + React + TanStack Router + Mantine + Convex, with Gemini-powered expense categorization.

## Setup

```bash
npm install
npx convex dev                 # first run: log in, create the project, writes VITE_CONVEX_URL to .env.local
npx @convex-dev/auth           # one-off: sets JWT_PRIVATE_KEY, JWKS and SITE_URL on the deployment
npx convex env set OWNER_EMAIL you@example.com          # the only email allowed to sign in
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY ...     # Gemini, used by convex/categorize.ts
npm run dev                    # keep `npx convex dev` running alongside
```

Open the app, choose "Create account" once with the owner email, then sign in. Sessions last 180 days per device.

The backend lives in `convex/`: schema, generic row functions (`rows.ts`), auth, and the AI import
(`imports.ts` + the `categorize.ts` action).

## Deploy (Vercel)

1. In the Convex dashboard, create a production deploy key and add it to Vercel as `CONVEX_DEPLOY_KEY`.
2. Set the prod Convex env vars: `npx convex env set --prod OWNER_EMAIL ...`, `GOOGLE_GENERATIVE_AI_API_KEY`,
   and run `npx @convex-dev/auth --prod` with `SITE_URL` set to the Vercel URL.
3. `vercel.json` builds with `npx convex deploy --cmd 'npm run build'`, which pushes the functions and sets `VITE_CONVEX_URL`.
