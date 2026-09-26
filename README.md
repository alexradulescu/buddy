# Buddy

Personal finance app: expenses, incomes, account balances, investments and budgets.
Vite + React + TanStack Router + Mantine + InstantDB, with Gemini-powered expense categorization.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in VITE_INSTANTDB_APP_ID and GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

AI endpoints live in `api/` (Vercel serverless functions); use `vercel dev` to run them locally.
