# Buddy - Complete Functionality Documentation

**Last Updated**: November 2025
**Purpose**: Detailed page-by-page breakdown of features, issues, and improvement plans

---

## Table of Contents

1. [Page Overview](#page-overview)
2. [Dashboard (/)](#1-dashboard-)
3. [Expenses (/expenses)](#2-expenses-expenses)
4. [Incomes (/incomes)](#3-incomes-incomes)
5. [Accounts (/accounts)](#4-accounts-accounts)
6. [Settings (/settings)](#5-settings-settings)
7. [Investments (/investments)](#6-investments-investments)
8. [Investment Detail (/investments/:id)](#7-investment-detail-investmentsid)
9. [New Investment (/investments/new)](#8-new-investment-investmentsnew)
10. [Edit Investment (/investments/:id/edit)](#9-edit-investment-investmentsidedit)
11. [Shared Components](#shared-components)
12. [Navigation](#navigation)
13. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## Page Overview

| Page | Route | Priority | Migration Complexity |
|------|-------|----------|---------------------|
| Dashboard | `/` | P0 | Medium |
| Expenses | `/expenses` | P0 | High (AI + Table) |
| Incomes | `/incomes` | P1 | Low |
| Accounts | `/accounts` | P1 | Low |
| Settings | `/settings` | P1 | Low |
| Investments List | `/investments` | P2 | Medium |
| Investment Detail | `/investments/:id` | P2 | Medium |
| New Investment | `/investments/new` | P2 | Low |
| Edit Investment | `/investments/:id/edit` | P2 | Low |

**Total Pages**: 9 routes

---

## 1. Dashboard (`/`)

**File**: `src/routes/home-page.tsx`

### Current Features ✅

#### Overview Cards
- **Total Monthly Income** - Sum of all income for selected month
- **Total Monthly Expenses** - Sum of all expenses for selected month
- **Net Income** - Monthly income minus monthly expenses
  - Green if positive, red if negative
- **Total Investment Value** - Sum of latest values from all active investments

#### Expense Overview
- **Grouped by Category** - All expenses for selected month
- **Visual Cards** - One card per category with:
  - Category name
  - Total amount spent
  - Number of transactions
  - Budget comparison (if budget set)
  - Progress bar showing % of budget used
- **Budget Warnings** - Visual indicators when over budget

#### Income Overview
- **Grouped by Category** - All income for selected month
- **Visual Cards** - One card per category with:
  - Category name (title field)
  - Total amount earned
  - Number of income entries
  - Target comparison (if target set)

#### Investment Summary
- **Grid of Active Investments** - Shows all investments with `isActive: true`
- **Per-Investment Cards**:
  - Investment name
  - Total contributions
  - Current value
  - Profit/Loss (absolute and percentage)
  - Performance indicator (green/red)

#### Month/Year Selector
- **URL State** - Month and year stored in URL params (`?year=2025&month=3`)
- **Navigation** - Previous/Next month buttons
- **Direct Selection** - Click to choose specific month/year
- **Persistence** - Selected period persists across navigation

### Current Issues ❌

1. **No Annual View** - Only monthly, no quarterly or yearly summaries
2. **Limited Visualizations** - Mostly cards, no charts on main dashboard
3. **No Trends** - Can't see month-over-month changes
4. **Performance** - Loads all investment data even if not needed
5. **No Filters** - Can't filter by specific categories or date ranges
6. **Static Layout** - Can't customize which widgets to show
7. **No Comparisons** - Can't compare current month to previous month
8. **Mobile Layout** - Cards stack awkwardly on mobile

### Proposed Improvements 🎯

#### Phase 1 (Quick Wins)
- [ ] Add month-over-month comparison (+/- from previous month)
- [ ] Add simple line chart showing last 6 months trend
- [ ] Improve mobile layout with better card stacking
- [ ] Add loading states for investment calculations
- [ ] Color-code budget status (green < 80%, yellow 80-100%, red > 100%)

#### Phase 2 (Major Features)
- [ ] Annual summary view (switchable with monthly)
- [ ] Quarterly summaries (Q1, Q2, Q3, Q4)
- [ ] Interactive charts (click to drill down)
- [ ] Customizable dashboard (drag & drop widgets)
- [ ] Export to PDF/CSV
- [ ] Budget vs. Actual chart
- [ ] Spending heatmap by category
- [ ] Income vs. Expense waterfall chart

#### Phase 3 (Advanced)
- [ ] Predictive trends (forecast next month)
- [ ] Anomaly detection (unusual spending alerts)
- [ ] Goal tracking (savings goals, debt payoff)
- [ ] Multi-currency support
- [ ] Budget recommendations based on historical data

### Technical Debt 🔧

- **Component Size**: `home-page.tsx` is large (~400 lines), should split into smaller components
- **Calculations**: Investment ROI calculated client-side, could be cached
- **Data Fetching**: Loads all data upfront, should implement pagination or lazy loading
- **Memoization**: Missing React.memo on expensive overview components

### Migration Notes (Mantine)

**ShadCN → Mantine Mapping**:
- `Card` → `Card` or `Paper`
- `Badge` → `Badge`
- Charts → Keep Recharts (works with Mantine)
- Overview cards → Create custom CSS Module

**Estimated Effort**: 2-3 days (medium complexity due to calculations)

---

## 2. Expenses (`/expenses`)

**File**: `src/routes/expenses-page.tsx`

### Current Features ✅

#### Two-Tab Interface

**Tab 1: AI Converter**
- **Text Input** - Large textarea for pasting bank statement text
- **AI Processing** - Sends to `/api/completion` endpoint
- **Streaming Response** - Real-time display of AI categorization
- **Editable Table** - Results displayed in Handsontable for review
- **Batch Save** - Save all categorized expenses at once
- **Context-Aware** - Uses last 3 months expenses + active categories

**Tab 2: Manual Entry (Table)**
- **Spreadsheet Interface** - Handsontable for bulk entry
- **Columns**:
  - Date (date picker)
  - Amount (number input)
  - Description (text)
  - Category (dropdown from active categories)
- **Inline Editing** - Click any cell to edit
- **Add Row** - Add new expense row
- **Delete Row** - Remove expense

#### Expense List
- **Filtered by Month/Year** - Shows only expenses for selected period
- **Grouped by Category** - Optionally group expenses
- **Row Display**:
  - Date
  - Description
  - Amount
  - Category name (with color badge)
  - Edit/Delete actions
- **Totals** - Sum of all expenses for the month
- **Row Numbers** - Shows expense count

#### AI Converter Component
**File**: `src/components/expense-ai-converter.tsx`

- **Historical Context** - Fetches last 3 months of expenses
- **Category Mapping** - Maps old category names to new IDs
- **Prompt Building** - Constructs context for AI
- **Streaming UI** - Shows progress as AI responds
- **Error Handling** - Basic error display
- **Edit Before Save** - Users can review and modify AI results

### Current Issues ❌

1. **Handsontable Issues**:
   - Heavy bundle size (287KB gzipped)
   - Commercial licensing concerns for future
   - Complex API, hard to customize
   - Accessibility issues (screen readers)
   - Mobile support is poor

2. **AI Converter Issues**:
   - No bank-specific parsers (DBS, UOB, OCBC)
   - Hard to handle edge cases (refunds, transfers)
   - No duplicate detection
   - Loses work if API fails mid-stream
   - No way to save partial results
   - No retry mechanism
   - Doesn't handle multi-currency well

3. **Expense List Issues**:
   - No bulk operations (delete multiple, edit multiple)
   - Can't split expenses (shared expenses)
   - No recurring expense templates
   - No expense attachments (receipts)
   - Can't tag expenses (multiple categories)
   - No search functionality
   - Limited sorting options

4. **General Issues**:
   - Two separate workflows (AI vs manual) feels disconnected
   - Can't mix AI and manual in same session
   - No validation for duplicate expenses
   - No expense rules (auto-categorize patterns)
   - Can't import from CSV/OFX files

### Proposed Improvements 🎯

#### Phase 1 (Migration)
- [ ] Replace Handsontable with **Mantine Table**
  - Lighter bundle (~50KB vs 287KB)
  - MIT license (no commercial concerns)
  - Better React integration
  - Simpler API
- [ ] Keep simple table (not full spreadsheet)
- [ ] Add row selection for bulk operations
- [ ] Improve mobile table layout (responsive cards)
- [ ] Add inline edit mode with Mantine inputs

#### Phase 2 (AI Improvements)
- [ ] **Bank-Specific Parsers**:
  - DBS/POSB format parser
  - UOB format parser
  - OCBC format parser
  - Generic fallback
- [ ] **Duplicate Detection**:
  - Fuzzy matching (description, date, amount)
  - Show duplicates before saving
  - Option to merge or skip
- [ ] **Partial Save**:
  - Save valid expenses even if some fail
  - Show progress per expense
  - Resume from last successful save
- [ ] **Retry Logic**:
  - Automatic retry on transient failures
  - Exponential backoff
  - Fallback to OpenAI if Gemini fails

#### Phase 3 (Feature Enhancements)
- [ ] **Bulk Operations**:
  - Select multiple expenses (checkboxes)
  - Bulk delete
  - Bulk recategorize
  - Bulk edit (change date, add tag)
- [ ] **Expense Splitting**:
  - Split expense across categories
  - Split with other people (shared expenses)
  - Track who owes whom
- [ ] **Recurring Expenses**:
  - Create templates (Netflix, Rent, etc.)
  - Auto-populate on schedule
  - Edit series vs single instance
- [ ] **Advanced Search**:
  - Search by description, amount, category
  - Date range filters
  - Amount range filters
  - Saved search queries
- [ ] **Attachments**:
  - Upload receipt images
  - OCR to extract amount/description
  - Link to expense entry

#### Phase 4 (Advanced AI)
- [ ] **Multi-Provider Support**:
  - A/B test Gemini vs GPT-4o
  - Track accuracy per provider
  - User preference selection
- [ ] **Learning from Corrections**:
  - Track when user changes AI category
  - Use corrections to improve future categorization
  - Periodic retraining or prompt adjustment
- [ ] **Confidence Scores**:
  - AI returns confidence per expense
  - Auto-save high confidence (>90%)
  - Flag low confidence for review
- [ ] **Expense Rules**:
  - Create rules based on patterns
  - "Starbucks" → always "Food & Dining"
  - Auto-categorize without AI (faster, cheaper)

### Technical Debt 🔧

- **Component Complexity**: `expense-ai-converter.tsx` is doing too much (parsing, API, UI)
- **State Management**: AI state not well managed (loading, error, partial results)
- **Error Handling**: Minimal error handling in AI flow
- **Validation**: No client-side validation before sending to AI
- **Performance**: Re-fetches historical context on every conversion (should cache)

### Migration Notes (Mantine)

**Components to Replace**:
- Handsontable → **Mantine Table** with inline edit
- Tabs → **Mantine Tabs**
- Buttons → **Mantine Button**
- Input/Textarea → **Mantine TextInput / Textarea**
- Category dropdown → **Mantine Select**
- Date picker → **Mantine DatePickerInput**

**New Components Needed**:
- `ExpenseTableRow` (editable row with Mantine inputs)
- `BulkActionBar` (for selected expenses)
- `DuplicateWarning` (show potential duplicates)
- `CategorySelect` (Mantine Select wrapper)

**Estimated Effort**: 5-7 days (high complexity due to AI + table replacement)

---

## 3. Incomes (`/incomes`)

**File**: `src/routes/incomes-page.tsx`

### Current Features ✅

#### Income Entry Form
**File**: `src/components/income-form.tsx`

- **Date Input** - DatePicker for income date
- **Amount Input** - Number input (positive only)
- **Description** - Text input (optional)
- **Category Selection** - Dropdown of active income categories
- **Submit Button** - Add income to database
- **Reset Form** - Clear after successful submission

#### Income List
**File**: `src/components/income-list.tsx`

- **Filtered by Month/Year** - URL state determines period
- **Table Display**:
  - Date
  - Description
  - Amount (formatted as currency)
  - Category name
  - Edit/Delete actions
- **Totals** - Sum of all income for the month
- **Row Numbers** - Shows count
- **Empty State** - Message when no income entries

#### Income Overview
**File**: `src/components/income-overview.tsx`

- **Grouped by Category** - Sum per income category
- **Visual Cards**:
  - Category title
  - Total amount
  - Number of entries
  - Target comparison (if target set)
  - Progress bar

### Current Issues ❌

1. **Limited Features**:
   - No recurring income (salary templates)
   - No income forecasting
   - Can't track multiple jobs/sources separately
   - No income attachments (payslips, invoices)
   - No tax calculation helpers

2. **Category Issues**:
   - Income categories are simpler than expense categories
   - No subcategories (e.g., "Salary" → "Full-time", "Bonus")
   - No income tagging
   - Target amounts rarely used

3. **UX Issues**:
   - Form and list on same page feels cramped
   - No bulk import (e.g., annual salary breakdown)
   - Can't duplicate entries easily
   - No income vs expense comparison on this page

4. **Missing Features**:
   - No income trends chart
   - No year-over-year comparison
   - No invoice generation
   - No client tracking (for freelancers)

### Proposed Improvements 🎯

#### Phase 1 (Quick Wins)
- [ ] Add simple income trend chart (last 6 months)
- [ ] Improve form layout (separate modal or drawer)
- [ ] Add quick actions (duplicate entry, delete)
- [ ] Better empty state with suggestions
- [ ] Add income total to page header

#### Phase 2 (Feature Enhancements)
- [ ] **Recurring Income**:
  - Create income template (e.g., monthly salary)
  - Auto-generate entries
  - Edit series vs single instance
- [ ] **Income Sources**:
  - Track separate sources (Job A, Job B, Freelance)
  - Per-source totals and trends
  - Source-specific categories
- [ ] **Tax Helpers**:
  - Mark income as taxable/non-taxable
  - Estimate tax liability
  - Generate tax reports
- [ ] **Invoice Management** (for freelancers):
  - Create invoices
  - Track payment status
  - Link invoices to income entries

#### Phase 3 (Advanced)
- [ ] Client management (freelance work)
- [ ] Income forecasting based on historical data
- [ ] Multi-currency income support
- [ ] Income goal tracking
- [ ] Comparison to expense patterns

### Technical Debt 🔧

- **Component Simplicity**: Actually well-structured, minimal debt
- **Validation**: Basic validation, could be more robust
- **Error Handling**: Minimal error UI

### Migration Notes (Mantine)

**Components to Replace**:
- Form inputs → **Mantine TextInput, NumberInput, DatePickerInput, Select**
- Form wrapper → **Mantine useForm hook**
- Table → **Mantine Table**
- Cards → **Mantine Card**
- Buttons → **Mantine Button**

**Estimated Effort**: 1-2 days (low complexity, straightforward page)

---

## 4. Accounts (`/accounts`)

**File**: `src/routes/accounts-page.tsx`

### Current Features ✅

#### Account Balance Form
**File**: `src/components/account-form.tsx`

- **Account Name** - Text input (e.g., "Checking", "Savings", "Credit Card")
- **Amount** - Number input (current balance)
- **Month/Year** - Automatically set to current selected period
- **Submit** - Save balance snapshot
- **Edit Mode** - Pre-populate form for editing existing balance

#### Account List
**File**: `src/components/account-list.tsx`

- **Filtered by Month/Year** - Shows balances for selected period
- **Table Display**:
  - Account name
  - Balance amount
  - Edit/Delete actions
- **Total Balance** - Sum of all accounts
- **Empty State** - Message when no balances recorded

#### Reconciliation Summary
**File**: `src/components/account-reconciliation.tsx` (or similar)

**Automatic Discrepancy Detection**:
1. **Previous Total** - Sum of all accounts from previous month
2. **Add Income** - Total income for current month
3. **Subtract Expenses** - Total expenses for current month
4. **Expected Total** = Previous + Income - Expenses
5. **Real Total** = Current account balances
6. **Discrepancy** = Real - Expected

**Visual Indicators**:
- Green if discrepancy is $0 (perfect match)
- Yellow if small discrepancy (< $10)
- Red if large discrepancy (> $10)
- Shows exact amount of discrepancy

**Summary Card**:
- Previous month total
- Income this month
- Expenses this month
- Expected total
- Actual total
- **Discrepancy** (highlighted)

### Current Issues ❌

1. **Reconciliation Issues**:
   - Doesn't explain WHERE the discrepancy is
   - No transaction-level reconciliation
   - Can't mark transactions as "cleared" vs "pending"
   - No bank sync (manual entry only)
   - Doesn't handle credit card payments properly
   - Transfer between accounts counted as expense

2. **Account Types**:
   - No distinction between checking, savings, credit, investment
   - Can't group accounts (e.g., "Chase Bank" → multiple accounts)
   - No account archiving (closed accounts)
   - Can't track account-specific transactions

3. **Historical Data**:
   - No balance history chart
   - Can't see balance trend over time
   - No net worth tracking (assets - liabilities)
   - Missing snapshots show as $0 (confusing)

4. **Missing Features**:
   - No balance alerts (low balance warnings)
   - No savings goals per account
   - Can't link transactions to specific accounts
   - No account reconciliation reports

### Proposed Improvements 🎯

#### Phase 1 (Reconciliation)
- [ ] **Better Discrepancy Explanation**:
  - Show potential causes (forgotten expense, uncategorized income)
  - Suggest next steps
  - Allow manual adjustments
- [ ] **Transaction Reconciliation**:
  - Mark transactions as "cleared" (matched to bank statement)
  - Show uncleared transactions
  - Highlight potential issues
- [ ] **Transfer Handling**:
  - Create "Transfer" transaction type (not expense)
  - Link from-account to to-account
  - Exclude from discrepancy calculation

#### Phase 2 (Account Types)
- [ ] **Account Categories**:
  - Checking, Savings, Credit Card, Investment, Cash
  - Different icons/colors per type
  - Type-specific features
- [ ] **Account Grouping**:
  - Group by institution (Chase, Wells Fargo, etc.)
  - Subtotals per group
  - Collapsible groups
- [ ] **Account Status**:
  - Active vs Archived
  - Hide archived by default
  - Historical view includes archived

#### Phase 3 (Visualization & Trends)
- [ ] **Balance History Chart**:
  - Line chart showing balance over time per account
  - Stacked area chart for total net worth
  - Zoom to date range
- [ ] **Net Worth Tracking**:
  - Separate assets and liabilities
  - Net worth calculation (assets - liabilities)
  - Trend over time
- [ ] **Savings Goals**:
  - Set target balance per account
  - Progress bar showing % to goal
  - Estimated time to reach goal

#### Phase 4 (Bank Sync)
- [ ] **Bank Integration** (via Plaid or similar):
  - Connect bank accounts
  - Auto-sync balances daily
  - Pull transactions automatically
  - Reconcile auto vs manual entries
- [ ] **Manual Sync Helper**:
  - Upload bank CSV
  - Parse and import balances
  - Suggest matching accounts

### Technical Debt 🔧

- **Calculation Logic**: Discrepancy calculation is simple, doesn't handle transfers
- **Data Model**: No account type field in schema
- **Missing Features**: No historical balance storage (only current month)
- **Validation**: Doesn't validate that previous month data exists

### Migration Notes (Mantine)

**Components to Replace**:
- Form → **Mantine TextInput, NumberInput**
- Table → **Mantine Table**
- Summary card → **Mantine Card** with CSS Module for discrepancy colors
- Buttons → **Mantine Button**

**New Components**:
- `AccountTypeSelect` - Dropdown for account types
- `ReconciliationSummary` - Enhanced summary with better visuals
- `BalanceHistoryChart` - Recharts line chart

**Estimated Effort**: 2-3 days (medium complexity due to reconciliation logic)

---

## 5. Settings (`/settings`)

**File**: `src/routes/settings-page.tsx`

### Current Features ✅

#### Two-Section Interface

**Section 1: Expense Categories**
**File**: `src/components/category-manager.tsx`

- **Category List**:
  - Category name
  - Monthly budget (optional)
  - Annual budget (optional)
  - Archive status
  - Edit/Delete/Archive actions
- **Add Category Form**:
  - Name input
  - Monthly budget input
  - Annual budget input
  - Submit button
- **Edit Category**:
  - Pre-populate form with existing values
  - Update category
- **Archive Category**:
  - Soft delete (set `isArchived: true`)
  - Hide from active lists
  - Preserve historical data

**Section 2: Income Categories**

- **Category List**:
  - Title (category name)
  - Target amount (optional goal)
  - Archive status
  - Edit/Delete/Archive actions
- **Add Category Form**:
  - Title input
  - Target amount input
  - Submit button
- **Similar CRUD** to expense categories

#### Data Integrity
- **Can't Delete Category with Transactions** - Validation prevents deletion if expenses/incomes exist
- **Archive Instead** - Suggests archiving rather than deleting
- **Unarchive** - Can restore archived categories

### Current Issues ❌

1. **Limited Category Features**:
   - No category icons/colors (hard to distinguish)
   - No subcategories (e.g., "Food" → "Groceries", "Dining Out")
   - Can't reorder categories (custom sort order)
   - No category groups (e.g., "Essentials", "Discretionary")
   - Budget doesn't support per-week or per-quarter

2. **Budget Management**:
   - No budget period customization (always monthly)
   - Can't set budgets for date ranges
   - No rollover budgets (unused budget to next month)
   - No budget alerts/warnings
   - Can't copy budgets from previous month

3. **UX Issues**:
   - Form and list on same page feels cramped
   - No visual indication of budget vs actual
   - Archive/unarchive flow is unclear
   - Deletion confirmation is basic
   - No bulk operations

4. **Missing Features**:
   - No category analytics (spending per category over time)
   - No category recommendations based on usage
   - Can't merge categories
   - No import/export of categories
   - No category templates (common categories for new users)

### Proposed Improvements 🎯

#### Phase 1 (Visual & UX)
- [ ] **Category Icons & Colors**:
  - Choose icon from library (Lucide)
  - Choose color from palette
  - Display in category cards and expense lists
- [ ] **Better Layout**:
  - Move forms to modal or drawer
  - Larger category cards with visual budget progress
  - Drag & drop to reorder
- [ ] **Enhanced Deletion**:
  - Clear confirmation dialog
  - Show count of affected expenses/incomes
  - Offer archive as alternative

#### Phase 2 (Budget Features)
- [ ] **Flexible Budget Periods**:
  - Monthly (default)
  - Weekly
  - Quarterly
  - Annual
  - Custom date range
- [ ] **Budget Templates**:
  - Save budget sets (e.g., "Summer", "Winter")
  - Copy budget from previous month
  - Adjust all budgets by percentage
- [ ] **Budget Rollover**:
  - Option to roll unused budget to next month
  - Track rollover separately
  - Clear rollover history

#### Phase 3 (Advanced)
- [ ] **Subcategories**:
  - Nested categories (parent → child)
  - Budget at parent or child level
  - Rollup totals to parent
- [ ] **Category Analytics**:
  - Spending trend per category
  - Compare to budget over time
  - Category usage heatmap
- [ ] **Smart Suggestions**:
  - Recommend budget based on historical spending
  - Suggest new categories based on patterns
  - Identify rarely-used categories

#### Phase 4 (Data Management)
- [ ] **Merge Categories**:
  - Combine two categories
  - Update all historical transactions
  - Preserve budget history
- [ ] **Import/Export**:
  - Export categories as JSON/CSV
  - Import from template or backup
  - Share category sets with others
- [ ] **Category Rules**:
  - Auto-categorize based on description patterns
  - Override AI categorization with rules
  - Rule priority system

### Technical Debt 🔧

- **Component Complexity**: `category-manager.tsx` handles both expense and income categories (could split)
- **Validation**: Basic validation, could improve UX with better error messages
- **State Management**: Uses InstantDB directly (good), but could use dedicated hook
- **No Tests**: Missing unit tests for category CRUD operations

### Migration Notes (Mantine)

**Components to Replace**:
- Form → **Mantine TextInput, NumberInput**
- Buttons → **Mantine Button**
- Category list → **Mantine Table** or **Card grid**
- Confirmation dialogs → **Mantine Modal**
- Section headers → **Mantine Title, Text**

**New Components**:
- `CategoryCard` - Visual card with icon, color, budget progress
- `CategoryForm` - Mantine form with icon/color pickers
- `CategoryIconPicker` - Modal with icon selection
- `CategoryColorPicker` - Color palette selector
- `DeleteCategoryModal` - Enhanced confirmation with details

**Estimated Effort**: 2-3 days (low-medium complexity)

---

## 6. Investments (`/investments`)

**File**: `src/routes/investments-page.tsx`

### Current Features ✅

#### Investment Grid
- **Card Grid Layout** - Responsive grid of investment cards
- **Per-Investment Card**:
  - Investment name
  - Created date
  - Active status badge
  - Quick stats:
    - Total contributions
    - Current value
    - Profit/Loss ($ and %)
    - Return percentage
  - Click to view details

#### Actions
- **Add New Investment** - Button → `/investments/new`
- **View Details** - Click card → `/investments/:id`
- **Empty State** - Message with "Add Investment" CTA when no investments

#### Investment Store
**File**: `src/stores/useInvestmentStore.ts`

- **Zustand Store** for derived calculations
- **Helpers**:
  - `getTotalContributions(id)` - Sum all contributions
  - `getLatestValue(id)` - Most recent value snapshot
  - `getProfitLoss(id)` - Value - Contributions
  - `getReturnPercentage(id)` - (P/L / Contributions) × 100

### Current Issues ❌

1. **Limited Overview**:
   - No portfolio summary (total value, total P/L)
   - Can't compare investments easily
   - No sorting (by return, by value, by P/L)
   - No filtering (active only, by date range)
   - Grid layout wastes space on desktop

2. **Calculations**:
   - Calculations done client-side (could be slow with many investments)
   - No time-weighted return (TWR) or money-weighted return (MWR)
   - Doesn't account for dividends or withdrawals
   - No annualized return calculation
   - Currency is assumed (no multi-currency)

3. **Missing Features**:
   - No asset allocation chart
   - Can't group investments (e.g., "Stocks", "Crypto", "Real Estate")
   - No benchmarking (vs S&P 500, etc.)
   - No investment goals
   - Can't track fees/taxes

4. **UX Issues**:
   - No bulk actions (archive multiple)
   - Can't duplicate investment setup
   - Empty state is basic
   - No search or filter UI

### Proposed Improvements 🎯

#### Phase 1 (Portfolio Overview)
- [ ] **Portfolio Summary Card**:
  - Total portfolio value
  - Total contributions
  - Total P/L ($ and %)
  - Total return %
  - Best/worst performer
- [ ] **Sorting & Filtering**:
  - Sort by return, value, P/L, name
  - Filter by active/inactive
  - Search by name
- [ ] **Better Layout**:
  - Table view option (more data-dense)
  - Toggle between grid and table
  - Responsive design improvements

#### Phase 2 (Advanced Calculations)
- [ ] **Time-Weighted Return (TWR)**:
  - Account for timing of contributions
  - More accurate performance metric
  - Compare across different contribution schedules
- [ ] **Dividends & Withdrawals**:
  - Track dividend payments
  - Track withdrawals (partial or full)
  - Include in return calculations
- [ ] **Annualized Returns**:
  - Calculate annualized ROI
  - Compare across different time periods
  - Show CAGR (Compound Annual Growth Rate)

#### Phase 3 (Asset Allocation)
- [ ] **Investment Types**:
  - Stocks, Bonds, Real Estate, Crypto, etc.
  - Categorize investments by type
  - Asset allocation pie chart
- [ ] **Diversification Analysis**:
  - % per asset type
  - Recommendations for rebalancing
  - Risk assessment
- [ ] **Benchmarking**:
  - Compare to market indices
  - Track alpha (excess return)
  - Show relative performance

#### Phase 4 (Advanced Features)
- [ ] **Investment Goals**:
  - Set target value per investment
  - Track progress to goal
  - Estimate time to reach goal
- [ ] **Tax Tracking**:
  - Mark accounts as taxable/tax-deferred
  - Estimate capital gains
  - Track cost basis
- [ ] **Fee Tracking**:
  - Management fees
  - Transaction fees
  - Impact on returns

### Technical Debt 🔧

- **Performance**: All investments loaded at once (paginate if 100+)
- **Calculations**: Client-side calculation could be slow with large datasets
- **Store Design**: Zustand store is simple, could add more helper methods
- **No Caching**: Recalculates on every render (should memoize)

### Migration Notes (Mantine)

**Components to Replace**:
- Card grid → **Mantine Grid** with **Card** components
- Badges → **Mantine Badge**
- Buttons → **Mantine Button**
- Empty state → **Mantine Text** with custom styling

**New Components**:
- `PortfolioSummary` - Summary card with total stats
- `InvestmentTable` - Table view alternative to grid
- `InvestmentFilters` - Filter/sort controls
- `AssetAllocationChart` - Pie chart for asset types

**Estimated Effort**: 2-3 days (medium complexity)

---

## 7. Investment Detail (`/investments/:id`)

**File**: `src/routes/investment-detail-page.tsx`

### Current Features ✅

#### Investment Header
- Investment name
- Created date
- Active status
- Edit button → `/investments/:id/edit`
- Delete button (with confirmation)

#### Key Metrics Cards
- **Total Contributions** - Sum of all contribution amounts
- **Current Value** - Latest value snapshot
- **Profit/Loss** - Value - Contributions ($ and %)
- **Return Percentage** - (P/L / Contributions) × 100
- Color-coded (green profit, red loss)

#### Performance Graph
**File**: `src/components/investment/performance-graph.tsx`

- **Line Chart** (Recharts)
- **Two Lines**:
  - Blue: Total contributions over time (cumulative)
  - Green: Portfolio value over time
- **X-Axis**: Date
- **Y-Axis**: Amount ($)
- **Tooltip**: Shows values on hover
- **Responsive**: Adjusts to container width

#### Contributions Tab
**File**: `src/components/investment/contribution-table.tsx`

- **Table** of all contributions:
  - Date
  - Amount
  - Description (optional)
  - Edit/Delete actions
- **Add Contribution Form**:
  - Date picker
  - Amount input
  - Description input
  - Submit button
- **Total Contributions** - Sum displayed
- **Sorted** by date (newest first)

#### Values Tab
**File**: `src/components/investment/value-table.tsx`

- **Table** of all value snapshots:
  - Date
  - Value
  - Description (optional)
  - P/L since last snapshot
  - Edit/Delete actions
- **Add Value Form**:
  - Date picker
  - Value input
  - Description input
  - Submit button
- **Latest Value** - Highlighted
- **Sorted** by date (newest first)

#### Delete Investment
- **Confirmation Modal** - "Are you sure?"
- **Cascade Delete** - Deletes all contributions and values
- **Redirect** - Returns to `/investments` after deletion

### Current Issues ❌

1. **Performance Graph Issues**:
   - Doesn't handle missing data points well (gaps in data)
   - No zoom or date range selection
   - Can't toggle lines on/off
   - No comparison to benchmark
   - Mobile view is cramped

2. **Contributions/Values Issues**:
   - Forms on same page as tables (cluttered)
   - No bulk import (e.g., CSV of contributions)
   - Can't edit inline (must use form)
   - No validation (e.g., contribution date after value date)
   - No recurring contributions

3. **Calculations**:
   - Simple P/L calculation (doesn't account for timing)
   - No annualized return shown
   - No comparison to previous period
   - Missing key metrics (IRR, Sharpe ratio, etc.)

4. **Missing Features**:
   - No transaction history (deposits, withdrawals, dividends)
   - Can't export data (CSV, PDF)
   - No notes or tags
   - Can't set alerts (e.g., "notify if value drops 10%")
   - No rebalancing suggestions

### Proposed Improvements 🎯

#### Phase 1 (UX Improvements)
- [ ] **Move Forms to Modal/Drawer**:
  - Cleaner page layout
  - Larger form inputs
  - Better mobile experience
- [ ] **Enhanced Graph**:
  - Zoom controls
  - Date range selector
  - Toggle contributions vs value lines
  - Benchmark line (optional)
  - Annotations for major events
- [ ] **Inline Editing**:
  - Click table cell to edit
  - Save/cancel per row
  - Faster workflow

#### Phase 2 (Advanced Calculations)
- [ ] **Time-Weighted Return (TWR)**:
  - More accurate performance metric
  - Show on detail page
- [ ] **Internal Rate of Return (IRR)**:
  - Account for timing of cash flows
  - Display prominently
- [ ] **Annualized Return**:
  - Calculate CAGR
  - Compare to benchmarks
- [ ] **Risk Metrics**:
  - Volatility (standard deviation)
  - Sharpe ratio (if risk-free rate known)
  - Max drawdown

#### Phase 3 (Transaction Management)
- [ ] **Full Transaction History**:
  - Contributions (already tracked)
  - Withdrawals (new)
  - Dividends (new)
  - Fees (new)
  - Rebalancing events (new)
- [ ] **CSV Import**:
  - Upload contribution history
  - Upload value history
  - Parse and validate
- [ ] **Recurring Contributions**:
  - Set up auto-contributions (e.g., $500/month)
  - Edit series vs single
  - Forecast future value

#### Phase 4 (Advanced Features)
- [ ] **Investment Notes**:
  - Add notes per investment
  - Timeline of notes
  - Attach to specific dates
- [ ] **Alerts & Notifications**:
  - Value drop alerts
  - Goal reached notifications
  - Rebalancing reminders
- [ ] **What-If Scenarios**:
  - Project future value with different contribution rates
  - Estimate time to reach goal
  - Simulate market downturns

### Technical Debt 🔧

- **Component Size**: Detail page is large (~500 lines), should split
- **Graph Performance**: Could optimize Recharts rendering
- **Data Fetching**: Loads all contributions/values upfront (paginate if 1000+)
- **Calculations**: Done in Zustand store, but could optimize with memoization

### Migration Notes (Mantine)

**Components to Replace**:
- Tabs → **Mantine Tabs**
- Tables → **Mantine Table**
- Forms → **Mantine DatePickerInput, NumberInput, TextInput, Textarea**
- Metric cards → **Mantine Card** with CSS Module
- Buttons → **Mantine Button**
- Delete modal → **Mantine Modal**

**New Components**:
- `MetricCard` - Reusable metric display
- `ContributionForm` - Modal form for adding contributions
- `ValueForm` - Modal form for adding values
- `InvestmentGraph` - Enhanced Recharts component with controls
- `TransactionTimeline` - Visual timeline of all transactions

**Estimated Effort**: 3-4 days (medium-high complexity)

---

## 8. New Investment (`/investments/new`)

**File**: `src/routes/new-investment-page.tsx`

### Current Features ✅

#### Investment Form
**File**: `src/components/investment/forms/investment-form.tsx`

- **Name Input** - Text input for investment name
- **Description Textarea** - Optional description
- **Created Date Picker** - Date when investment started
- **Active Checkbox** - Is investment currently active?
- **Submit Button** - Create investment
- **Cancel Button** - Return to `/investments`

#### Form Validation
- Name is required
- Created date defaults to today
- Active defaults to true

#### Success Flow
- Create investment in InstantDB
- Redirect to `/investments/:id` (new investment detail page)

### Current Issues ❌

1. **Limited Initial Setup**:
   - Can't add initial contribution during creation
   - Can't add initial value during creation
   - Two-step process (create, then add data)

2. **Missing Fields**:
   - No investment type (stocks, bonds, etc.)
   - No goal setting
   - No benchmark selection
   - No tags or categories

3. **No Templates**:
   - Can't duplicate existing investment
   - No pre-filled templates (401k, IRA, etc.)
   - Can't import from another account

4. **Validation**:
   - Minimal validation
   - No duplicate name check
   - Created date can be in future (bug)

### Proposed Improvements 🎯

#### Phase 1 (Enhanced Form)
- [ ] **Initial Contribution**:
  - Add contribution during creation (optional)
  - Amount and date fields
  - Auto-create contribution record
- [ ] **Initial Value**:
  - Set starting value (optional)
  - Useful for existing investments
- [ ] **Investment Type**:
  - Dropdown: Stocks, Bonds, Real Estate, Crypto, Other
  - Used for asset allocation
- [ ] **Better Validation**:
  - Check for duplicate names
  - Prevent future created dates
  - Validate amount formats

#### Phase 2 (Templates & Import)
- [ ] **Investment Templates**:
  - 401(k), IRA, Taxable Brokerage, etc.
  - Pre-fill common fields
  - Custom user templates
- [ ] **Duplicate Investment**:
  - Copy settings from existing investment
  - Useful for similar setups
- [ ] **Import from CSV**:
  - Upload investment data
  - Parse and create investment + history

#### Phase 3 (Goals & Benchmarks)
- [ ] **Goal Setting**:
  - Target value
  - Target date
  - Show progress on detail page
- [ ] **Benchmark Selection**:
  - Choose index to compare (S&P 500, etc.)
  - Show relative performance
- [ ] **Tags & Categories**:
  - Add custom tags
  - Group investments by tag

### Technical Debt 🔧

- **Form Simplicity**: Form is very basic, could enhance with wizard
- **No Error Handling**: Doesn't handle creation failures well
- **Redirect Logic**: Always redirects to detail, could offer "Add Another"

### Migration Notes (Mantine)

**Components to Replace**:
- Form → **Mantine TextInput, Textarea, DatePickerInput, Checkbox**
- Buttons → **Mantine Button**
- Layout → **Mantine Stack, Group**

**New Components**:
- `InvestmentTypeSelect` - Dropdown for investment types
- `InvestmentFormWizard` - Multi-step form (future)
- `InvestmentTemplateSelector` - Choose from templates

**Estimated Effort**: 1 day (low complexity)

---

## 9. Edit Investment (`/investments/:id/edit`)

**File**: `src/routes/edit-investment-page.tsx`

### Current Features ✅

#### Pre-Populated Form
- Same form as "New Investment"
- Fields pre-filled with existing data
- **Name**, **Description**, **Created Date**, **Active** status

#### Form Actions
- **Update Button** - Save changes
- **Cancel Button** - Return to detail page without saving

#### Success Flow
- Update investment in InstantDB
- Redirect to `/investments/:id`

### Current Issues ❌

1. **Limited Edit Scope**:
   - Can only edit metadata (name, description, date, active)
   - Can't edit contributions or values (must go to detail page)
   - No bulk edit of contributions

2. **Same Issues as New Investment**:
   - No investment type field
   - No goal setting
   - No benchmark selection

3. **UX**:
   - Separate page for editing feels unnecessary
   - Could be modal or inline edit

### Proposed Improvements 🎯

#### Phase 1 (Better UX)
- [ ] **Modal Edit** instead of separate page
  - Faster workflow
  - Less navigation
  - Keep context of detail page
- [ ] **Inline Editing** on detail page
  - Click field to edit
  - Save/cancel per field
  - No page navigation

#### Phase 2 (Enhanced Fields)
- [ ] Same enhancements as "New Investment":
  - Investment type
  - Goals
  - Benchmarks
  - Tags

### Technical Debt 🔧

- **Duplication**: Nearly identical to new investment page (could share component)
- **Navigation**: Extra page load feels slow

### Migration Notes (Mantine)

**Components to Replace**:
- Same as "New Investment"
- Consider: Replace entire page with **Mantine Modal** in detail page

**Estimated Effort**: 0.5 days (very low complexity, or remove page entirely)

---

## Shared Components

### Navigation
**File**: `src/components/navigation.tsx`

#### Features
- **Desktop**: Fixed left sidebar (140px width)
- **Mobile**: Bottom navigation bar
- **Nav Items**:
  - Home (Home icon)
  - Expenses (CreditCard icon)
  - Incomes (PiggyBank icon)
  - Investments (TrendingUp icon)
  - Accounts (BarChart2 icon)
  - Settings (Settings icon)
- **Active State**: Highlights current route
- **URL State Preservation**: Maintains month/year params on navigation

#### Issues
- ~~Theme toggle~~ (will be removed - no dark mode)
- No user profile/settings
- Icons could be customizable
- Mobile nav takes up screen space

#### Improvements
- [ ] Remove theme toggle
- [ ] Add user profile section (future auth)
- [ ] Customizable nav order
- [ ] Hide/show nav items

---

### Page Header
**File**: `src/components/page-header.tsx`

#### Features
- Consistent header across all pages
- Page title
- Optional actions (buttons)
- Month/year selector (on relevant pages)

#### Issues
- Basic styling
- No breadcrumbs
- No page descriptions

#### Improvements
- [ ] Add breadcrumbs
- [ ] Add page descriptions/help text
- [ ] Better responsive design

---

### Month/Year Selector
**Component**: Part of various pages

#### Features
- Previous/Next month buttons
- Current month/year display
- Click to open calendar picker
- URL state (`?year=2025&month=3`)

#### Issues
- No quick jumps (e.g., "Today", "Last month")
- No year-only view
- No fiscal year support

#### Improvements
- [ ] Quick jump buttons
- [ ] Year/quarter toggles
- [ ] Fiscal year option
- [ ] Date range selection

---

## Cross-Cutting Concerns

### Data Fetching & Caching

**Current**: InstantDB handles all data fetching

**Issues**:
- No request deduplication (multiple components fetching same data)
- No prefetching
- No cache invalidation strategy

**Improvements**:
- [ ] Use InstantDB's batching features
- [ ] Implement prefetching on route navigation
- [ ] Add optimistic updates for better UX

---

### Error Handling

**Current**: Minimal error handling

**Issues**:
- API errors show as console logs
- No user-friendly error messages
- No retry mechanism
- No offline handling

**Improvements**:
- [ ] **Error Boundaries** - Catch React errors
- [ ] **Toast Notifications** - Mantine notifications for errors
- [ ] **Retry Logic** - Automatic retry with exponential backoff
- [ ] **Offline Mode** - InstantDB supports offline, leverage it

---

### Loading States

**Current**: Inconsistent loading states

**Issues**:
- Some pages show nothing while loading
- No skeleton screens
- No progress indicators

**Improvements**:
- [ ] **Mantine Skeleton** - Skeleton screens for all pages
- [ ] **Loading Overlays** - Mantine LoadingOverlay for async actions
- [ ] **Progress Indicators** - Show upload/import progress

---

### Form Validation

**Current**: React Hook Form with basic validation

**Issues**:
- Inconsistent error messages
- No async validation (e.g., duplicate name check)
- Limited error display

**Improvements**:
- [ ] **Mantine useForm** - Migrate to Mantine's form system
- [ ] **Zod Integration** - Use Zod for validation schemas
- [ ] **Async Validation** - Check duplicates, validate external data
- [ ] **Better Error Display** - Inline errors, summary at top

---

### Accessibility (a11y)

**Current**: Basic accessibility

**Issues**:
- No keyboard shortcuts
- Limited ARIA labels
- Handsontable has a11y issues
- No screen reader testing

**Improvements**:
- [ ] **Keyboard Navigation** - All actions keyboard-accessible
- [ ] **ARIA Labels** - Proper labels for all interactive elements
- [ ] **Focus Management** - Logical tab order
- [ ] **Screen Reader Testing** - Test with NVDA/JAWS
- [ ] **High Contrast** - Ensure readability (even without dark mode)

---

### Responsive Design

**Current**: Tailwind responsive utilities

**Issues**:
- Tables overflow on mobile (especially Handsontable)
- Charts don't resize well
- Forms cramped on mobile
- Navigation takes up too much space on mobile

**Improvements**:
- [ ] **Mobile-First Tables** - Card view for mobile, table for desktop
- [ ] **Responsive Charts** - Better Recharts responsive config
- [ ] **Form Layout** - Stack fields on mobile, row on desktop
- [ ] **Better Mobile Nav** - Collapsible or swipeable nav

---

### Performance Optimization

**Current**: No optimization

**Issues**:
- All data loaded upfront
- No code splitting beyond routes
- No image optimization
- No bundle analysis

**Improvements**:
- [ ] **React.memo** - Memoize expensive components
- [ ] **useMemo/useCallback** - Memoize expensive calculations
- [ ] **Code Splitting** - Split large components
- [ ] **Bundle Analysis** - Use Next.js bundle analyzer
- [ ] **Pagination** - For large datasets (100+ expenses)
- [ ] **Virtual Scrolling** - For very large lists

---

## Migration Priority Matrix

| Page/Feature | Business Value | Migration Effort | Priority | Order |
|-------------|----------------|------------------|----------|-------|
| Settings | High | Low | **P0** | 1 |
| Accounts | High | Low | **P0** | 2 |
| Incomes | High | Low | **P0** | 3 |
| Dashboard | Critical | Medium | **P0** | 4 |
| Investments (all 4 pages) | Medium | Medium | **P1** | 5 |
| Expenses | Critical | High | **P0** | 6 (Last - most complex) |

**Rationale**:
- **Settings first** - Simplest, establishes Mantine patterns
- **Accounts & Incomes** - Low complexity, high confidence builders
- **Dashboard** - Critical but medium effort, do when comfortable
- **Investments** - Medium priority, medium effort, do mid-migration
- **Expenses last** - Most complex (AI + Handsontable replacement), do when all patterns established

---

## Testing Strategy

### Unit Tests
- [ ] Test utility functions (calculations, formatters)
- [ ] Test custom hooks (useExpenseStore, useInvestmentStore)
- [ ] Test TOON helpers
- [ ] Test form validation logic

### Integration Tests
- [ ] Test AI categorization flow
- [ ] Test CRUD operations (create, update, delete)
- [ ] Test reconciliation calculations
- [ ] Test investment ROI calculations

### E2E Tests (future)
- [ ] Test complete user flows (add expense → view dashboard)
- [ ] Test AI conversion workflow
- [ ] Test investment tracking workflow

---

## Documentation Checklist

- [x] AGENTS.md - AI architecture
- [x] Claude.md - Developer guide
- [x] FUNCTIONALITY.md - This document
- [ ] README.md - Update with new stack
- [ ] MIGRATION.md - Document lessons learned
- [ ] API.md - Document API routes (future)
- [ ] TESTING.md - Testing guidelines (future)

---

**End of FUNCTIONALITY.md**

This document provides a comprehensive breakdown of all pages and features in Buddy. Use it as a reference for migration planning, feature development, and understanding the application structure.
