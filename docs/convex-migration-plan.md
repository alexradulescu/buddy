# InstantDB → Convex migration plan

InstantDB's cloud is shutting down (team acqui-hired by OpenAI; hosted apps run until 31 Aug 2027).
Goal: (1) run Buddy on a **fresh, empty** Convex deployment, (2) migrate data separately once confirmed.

Decisions so far: AI categorisation moves into Convex; TanStack Start is deferred (little value once
there is no server code left on Vercel); Vercel stays as static hosting.

## Current state (post clean-slate rewrite, #36–#39)

- **One DB module**: `src/db.ts` holds the schema (8 flat entities), the types, and two helpers:
  `save(entity, row)` (upsert; stamps `createdAt` on expenses/incomes/accountBalances) and `remove(entity, id)`.
- **Reads** are `db.useQuery({...})` directly in 8 route files (`src/routes/*.tsx`), always whole tables.
  The only filtered query is `investments.$id.tsx` (where `id` / `investmentId`).
- **Writes**: `save`/`remove` called from `transactions.tsx`, `investment.tsx`, `accounts.tsx`,
  `settings.tsx`, `investments.$id.tsx`.
- **Aggregation** is pure client code in `src/lib/finance.ts` (`ytdSummary`, `portfolio`, `monthTotal`, …), fed the full tables.
- **AI**: `api/categorize.ts` (Vercel function) receives text or a file (PDF/CSV, 5MB max), active categories and
  history from the browser, calls `gemini-3.5-flash-lite` via AI SDK 7 `streamText` + `Output.array`,
  and streams NDJSON back to `import-panel.tsx`.
- **No auth.** The InstantDB app ID ships in the bundle.

### Issues spotted that Convex fixes naturally
1. Bulk saves are N independent writes (`transactions.tsx:56`, `settings.tsx:72`). A partial failure leaves half an import saved.
2. Deleting an investment (`investments.$id.tsx:101`) orphans its contributions and values.
   Deleting a category orphans its expenses/incomes.
3. The home page subscribes to all 7 tables to show one month plus YTD.
4. The browser uploads its whole history to the AI endpoint on every import.

## Phase 1 — Works fresh on Convex

The rewrite made this small: swap `src/db.ts` and the 8 `useQuery` calls.

1. `npm i convex` → `npx convex dev` (you log in once; it creates the project and writes `VITE_CONVEX_URL`).
2. **`convex/schema.ts`** — the same 8 tables, plus:
   - `categoryId: v.id('expenseCategories' | 'incomeCategories')`, `investmentId: v.id('investments')`.
   - Drop the explicit `id` (use `_id`). Keep `createdAt` for now so `finance.ts` is untouched.
   - `legacyId: v.optional(v.string())` + index `by_legacyId` on every table (for Phase 2).
   - Indexes: `expenses/incomes.by_date`, `by_categoryId`; `accountBalances.by_year_month`;
     `investmentContributions/investmentValues.by_investment`.
3. **Generic functions**: `convex/rows.ts` with `list(table)`, `save(table, row)`, `remove(table, id)`,
   validated per table, mirroring today's `save`/`remove`. Plus specific ones:
   - `saveMany(table, rows)`: one transaction for imports and settings.
   - `removeInvestment`: cascades to contributions and values.
   - `removeCategory`: refuses when rows still reference the category (or reassigns them).
4. **`src/db.ts`** becomes a thin client: `useTables(['expenses', …])` returning the same `data` shape, and
   `save`/`remove` wrapping `useMutation`. Types come from `Doc<'expenses'>` etc. Components change `.id` → `._id`.
5. `ConvexProvider` in `src/main.tsx`.
6. **AI → `convex/categorize.ts`** (`"use node"` action):
   - Files go to Convex storage via `generateUploadUrl`; the action reads text or a file and extracts PDFs with `pdf-parse`.
   - It loads active categories and the last 200 expenses itself (internal query), so the browser no longer sends them.
   - Streaming: the action inserts each expense into an `importDrafts` table as `elementStream` yields it.
     `import-panel.tsx` subscribes to the drafts with `useQuery`, so the live rows survive reloads.
     "Save" calls `saveMany`, then clears the drafts. Errors go into an `importJobs` status row.
   - `GOOGLE_GENERATIVE_AI_API_KEY` set with `npx convex env set`.
7. Remove `@instantdb/react`, `api/`, the `/api` rewrite and the function config in `vercel.json`.
   Vercel build command: `npx convex deploy --cmd 'npm run build'`, with `CONVEX_DEPLOY_KEY` in Vercel.
8. **Check**: `npm run typecheck && npm run lint && npm run build`, then click through every route:
   CRUD on each table, text and PDF import, CSV export, investment delete cascade.

## Phase 2 — Data migration (after Phase 1 is confirmed)

1. `scripts/export-instant.ts` uses `@instantdb/admin` (app ID + admin token) to dump the 8 entities to `data/*.json`
   (gitignored: personal finance data).
2. `convex/migrate.ts` internal mutation `importTable(table, rows)`, run in dependency order:
   categories + investments → expenses/incomes/contributions/values (remapping FKs via `by_legacyId`) → accountBalances.
   Idempotent: skip rows whose `legacyId` already exists.
3. Verify: a `migrate:verify` query compares row counts and per-month sums against the export.
4. Run on the **dev** deployment → check the app → run on **prod**. Keep InstantDB untouched until you're happy.
5. Later: drop `legacyId` and remove the migrate code.

## Phase 3 — Optimisations (optional, after the switch)

- **Server-side reads**: `monthSummary(year, month)` and `ytd(year, month)` queries using indexes. The home page stops
  loading every row ever; `finance.ts` moves into `convex/` and is reused as-is.
- **Auth**: Convex Auth (password or magic link, single allowed email). Convex functions are public
  by default, so until this is done the deployment URL alone gives access. **Recommended in Phase 1 if you
  are not comfortable with that.**
- **Crons**: nightly `npx convex export` backup; monthly budget-overrun summary.
- **Duplicate detection** in the categorize action (same date + amount + similar description).
- TanStack Start: revisit only if server-side code comes back to Vercel.

## Open questions

1. Auth in Phase 1 or Phase 3?
2. Deleting a category that is still in use: block it or reassign its rows?
