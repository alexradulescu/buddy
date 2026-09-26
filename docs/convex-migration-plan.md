# InstantDB → Convex migration plan

InstantDB's cloud is shutting down (team acqui-hired by OpenAI; hosted apps run until 31 Aug 2027).
Goal: (1) run Buddy on a **fresh, empty** Convex deployment, (2) once confirmed, migrate data separately.

## Current state (what we're replacing)

- All DB access lives in 2 files: `src/stores/instantdb.ts` and `src/stores/useInvestmentStore.ts`.
- ~20 components import **types** (`Expense`, `ExpenseCategory`, …) and **hooks** (`useExpenseStore`,
  `useCategoryStore`, `useIncomeStore`, `useAccountBalances`, `useInvestmentStore`) returning `{ data, isLoading, error, add/update/remove }`.
- 8 flat entities, no links; relations are string FKs (`categoryId`, `investmentId`).
- **No auth.** The app ID is public, so the data is only as private as the InstantDB permission rules.
- Every hook loads the **whole table** and filters/aggregates on the client.

## Phase 1 — Works fresh on Convex

1. `npm i convex`, `npx convex dev` → creates the dev deployment and `convex/` folder, writes `VITE_CONVEX_URL` to `.env.local`.
2. `convex/schema.ts`: mirror the 8 tables with `v.*` validators. Changes:
   - FKs become `v.id('expenseCategories')` etc. (typed references).
   - Add `legacyId: v.optional(v.string())` to every table (needed for Phase 2) with index `by_legacyId`.
   - Indexes: `expenses.by_date`, `expenses.by_categoryId`, `incomes.by_date`, `accountBalances.by_year_month`,
     `investmentContributions.by_investment`, `investmentValues.by_investment`.
   - Drop `createdAt` (Convex gives `_creationTime`) — or keep it for now to minimise UI changes.
3. `convex/<table>.ts`: `list`, `add`, `update`, `remove` query/mutations per table.
4. Wrap the app in `ConvexProvider` (`src/main.tsx`).
5. Rewrite the two store files **keeping the same hook signatures**: `useQuery(api.expenses.list)` +
   `useMutation(...)`, and map to `{ data: { expenses }, isLoading: data === undefined }`.
   Export types via `Doc<'expenses'>`. Components should need only light edits (`id` → `_id`).
6. Delete `@instantdb/react`, `VITE_INSTANTDB_APP_ID`.
7. Deploy: `npx convex deploy` in the Vercel build command, with `CONVEX_DEPLOY_KEY` set in Vercel.
8. Smoke test: add categories, expenses, incomes, balances, investments; run the AI converter and file upload; dashboard export.

## Phase 2 — Data migration (after Phase 1 is confirmed)

1. Export from InstantDB: a small Node script using `@instantdb/admin` (admin token) that dumps each entity to `*.jsonl`.
2. Import in dependency order via an internal mutation (not `npx convex import`, because FKs need remapping):
   categories/investments first → store `legacyId` → then expenses/incomes/contributions/values,
   resolving `categoryId`/`investmentId` via the `by_legacyId` index.
3. Verify: row counts per table + sum of amounts per month match the InstantDB export.
4. Run against **dev** first, check the app, then run against prod. Keep InstantDB read-only until you're happy.
5. Optional clean-up: drop `legacyId` once you're happy.

## Optimisations Convex enables

1. **Server-side filtering with indexes**: query only the selected month/year instead of loading every expense ever.
2. **Server-side aggregates** (monthly totals per category, YTD) as queries. They stay reactive and cached, so the dashboard ships much less data.
3. **Move the AI categorisation into a Convex action** (`convex/ai.ts`): it reads the historical expenses and categories itself,
   so the client stops POSTing the whole history, and the Vercel `/api/completion` function goes away. The API keys become Convex env vars.
4. **Atomic bulk insert**: saving AI-converted or uploaded expenses becomes one mutation (a transaction) instead of N writes.
5. **Referential integrity**: `v.id()` FKs, plus the delete-category mutation can refuse to delete a category that still has expenses, or reassign them.
6. **File storage**: uploaded bank statements can go to Convex storage and be parsed in an action (replaces busboy/pdf-parse in `api/upload-statement.ts`).
7. **Auth** (Convex Auth or Clerk, single user) so queries check `ctx.auth`. Convex functions are public by default.
8. **Scheduled functions/crons**: monthly snapshot of account balances, budget-overrun alerts.
9. **Backups**: `npx convex export` on a schedule.
10. End-to-end TypeScript types from the schema, so the hand-maintained `src/types/investment.ts` is no longer needed.

## Open questions

- Auth now (recommended, since Convex functions are public) or later?
- Keep the hook API identical (fast, low risk), or refactor to per-month queries in the same PR?
- Move AI to a Convex action in Phase 1, or later?
- Deploy target stays Vercel?
