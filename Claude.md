# Claude Code Developer Guide

**Project**: Buddy - Personal Finance Management App
**Last Updated**: November 2025
**Status**: Active Migration (Phase-by-phase modernization in progress)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Tech Stack Evolution](#tech-stack-evolution)
4. [Architecture Patterns](#architecture-patterns)
5. [Development Workflow](#development-workflow)
6. [Common Tasks](#common-tasks)
7. [Migration Progress](#migration-progress)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (we use npm, not Bun/pnpm)
- **Git**: For version control
- **InstantDB Account**: For database (free tier available)
- **Google API Key**: For Gemini AI (optional during development)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd buddy

# Install dependencies with npm
npm install

# Create environment file
cp .env.example .env.local

# Add required environment variables
# Edit .env.local and add:
# NEXT_PUBLIC_INSTANTDB_APP_ID=your_instantdb_app_id
# GOOGLE_API_KEY=your_google_api_key (optional for AI features)

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Getting InstantDB App ID

1. Go to https://instantdb.com
2. Sign up for free account
3. Create new app
4. Copy App ID from dashboard
5. Add to `.env.local`

### Getting Google API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Add to `.env.local`

---

## Project Overview

**Buddy** is a personal finance management application that helps users:
- Track expenses with AI-powered categorization
- Manage income sources
- Monitor account balances with reconciliation
- Track investments and portfolio performance
- Set budgets and financial goals

### Key Features

- 📊 **Dashboard** - Overview of finances, net income, investment summary
- 💳 **Expense Tracking** - AI converter from bank statements + manual entry
- 💰 **Income Management** - Track income sources by category
- 🏦 **Account Balances** - Monthly snapshots with discrepancy detection
- 📈 **Investments** - Track contributions, values, and performance
- ⚙️ **Settings** - Manage expense/income categories and budgets

### Target Users

- Personal finance enthusiasts
- People who want to understand their spending patterns
- Users tracking investments and portfolio performance
- Anyone looking for local-first, privacy-focused finance tracking

---

## Tech Stack Evolution

### Current Stack (Before Migration)

#### ❌ Issues with Current Choices

| Technology | Issue | Impact |
|------------|-------|--------|
| **Bun** | Not supported by Claude Code Web | Can't use Claude Code in browser |
| **ShadCN UI** | 46 separate component files, verbose patterns | Hard to maintain, large codebase |
| **Handsontable** | 287KB bundle, commercial licensing concerns | Performance impact, legal concerns |
| **Dark Mode** | Unnecessary complexity for this app | Extra code, testing burden |
| **OpenAI GPT-4o** | Expensive ($2.50-$10/1M tokens) | High AI costs for simple categorization |
| **Standard JSON** | Token-inefficient for AI context | Wastes tokens, increases costs |

#### ✅ What We're Keeping

- **Next.js 14 → 15** - Excellent framework, upgrading to latest
- **React Router 7** - Client-side SPA routing works well
- **InstantDB** - Perfect local-first database
- **Tailwind CSS** - Great utility-first styling
- **React Hook Form** - Solid form management
- **Zustand** - Simple state management

---

### New Stack (After Migration)

#### Core Framework

- **Next.js 15.x** - Latest stable, App Router
- **React 19.x** - Latest stable (or 18.3.x if needed)
- **React Router 7.x** - Client-side routing (unchanged)
- **TypeScript 5.8.x** - Latest stable
- **npm** - Package manager (Claude Code compatible)

#### UI & Styling

- **Mantine UI v8.3.0** - Modern, batteries-included component library
- **Tailwind CSS 3.x** - Utility classes for layouts
- **CSS Modules** - Component-specific custom styles
- **Lucide React** - Icon library (keeping)
- **No dark mode** - Light mode only (simplified)

#### Data & State

- **InstantDB** - Real-time database (local-first)
- **Zustand** - Client state management
- **nuqs** - URL state (year/month params)
- **React Hook Form** - Form state
- **Zod** - Schema validation

#### AI & Backend

- **Vercel AI SDK latest** - AI integration framework
- **Gemini 2.5 Flash** - Primary AI provider (cheap, fast)
- **OpenAI GPT-4o** - Fallback provider (reliability)
- **TOON Format** - Token-efficient context encoding

#### Charts & Data Viz

- **Recharts** - Charts and graphs
- **Mantine Table** - Simple data tables (replacing Handsontable)
- **Mantine Charts** - Additional chart components

---

## Architecture Patterns

### Hybrid Next.js + React Router Setup

**Why this pattern?**

We use Next.js for the build system and initial HTML shell, but React Router for all client-side navigation. This gives us:
- ✅ Fast client-side navigation (SPA feel)
- ✅ Next.js build optimizations
- ✅ Server-side rendering for initial load
- ✅ Static export capability

**How it works:**

1. **Next.js Config** (`next.config.mjs`):
```javascript
export default {
  async rewrites() {
    return [
      {
        source: '/((?!api/).*)',
        destination: '/static-app-shell'
      }
    ];
  }
};
```

2. **Static Shell** (`src/app/static-app-shell/page.tsx`):
- Renders minimal HTML
- Loads React Router
- Handles all client-side routing

3. **React Router Config** (`src/routes/app.tsx`):
```typescript
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'incomes', element: <IncomesPage /> },
      // ... other routes
    ]
  }
]);
```

**Important**: All pages are in `src/routes/`, not `src/app/`

---

### Database Architecture (InstantDB)

**Why InstantDB?**

- **Local-first**: Works offline, syncs when online
- **Real-time**: Automatic UI updates on data changes
- **Zero backend**: No need to write API routes for CRUD
- **Type-safe**: TypeScript support out of the box
- **Free tier**: Generous limits for personal use

**Schema** (`src/stores/instantdb.ts`):

```typescript
import { init } from '@instantdb/react';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  schema: {
    expenses: {
      id: 'uuid',
      date: 'string',
      amount: 'number',
      description: 'string',
      categoryId: 'uuid',
      createdAt: 'number'
    },
    expenseCategories: {
      id: 'uuid',
      name: 'string',
      maxBudget: 'number',
      maxAnnualBudget: 'number',
      isArchived: 'boolean'
    },
    incomes: { /* ... */ },
    incomeCategories: { /* ... */ },
    accountBalances: { /* ... */ },
    investments: { /* ... */ },
    investmentContributions: { /* ... */ },
    investmentValues: { /* ... */ }
  }
});
```

**Custom Hooks Pattern**:

```typescript
// src/stores/instantdb.ts
export function useExpenseStore() {
  const { data } = db.useQuery({
    expenses: {},
    expenseCategories: {}
  });

  async function addExpense(expense: Expense) {
    await db.transact(db.tx.expenses[id()].update(expense));
  }

  return { expenses: data?.expenses, categories: data?.expenseCategories, addExpense };
}
```

**Usage in Components**:

```typescript
// In any component
const { expenses, categories, addExpense } = useExpenseStore();

// Data is automatically reactive
// When another component adds an expense, this component re-renders
```

---

### State Management Strategy

We use a **hybrid approach** with different tools for different state types:

| State Type | Tool | Example |
|------------|------|---------|
| **Server/DB State** | InstantDB | Expenses, incomes, accounts |
| **URL State** | nuqs | Current month/year filter |
| **Local Component State** | useState | Form inputs, modals |
| **Shared Client State** | Zustand | Investment calculations |
| **Form State** | React Hook Form | Form validation, submission |

**Example - URL State with nuqs**:

```typescript
import { useQueryState, parseAsInteger } from 'nuqs';

export function ExpensesPage() {
  const [year, setYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [month, setMonth] = useQueryState('month', parseAsInteger.withDefault(1));

  // URL: /expenses?year=2025&month=3
  // Automatically synced to URL, shareable, bookmark-able
}
```

---

### Styling Architecture

**Three-Layer Approach**:

1. **Mantine Components** - Pre-built UI primitives
2. **Tailwind Utilities** - Layout, spacing, responsive design
3. **CSS Modules** - Component-specific custom styles

**Example**:

```typescript
// expense-card.tsx
import { Card, Button } from '@mantine/core';
import styles from './expense-card.module.css';

export function ExpenseCard({ expense }) {
  return (
    <Card className={`${styles.card} flex flex-col gap-4 p-6`}>
      <h3 className={styles.title}>{expense.description}</h3>
      <div className="flex items-center justify-between">
        <span className={styles.amount}>${expense.amount}</span>
        <Button size="sm">Edit</Button>
      </div>
    </Card>
  );
}
```

```css
/* expense-card.module.css */
.card {
  border-left: 4px solid var(--mantine-color-green-6);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--mantine-color-gray-9);
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mantine-color-green-7);
}
```

**When to use what:**

- **Mantine**: Buttons, Inputs, Modals, Tables, Forms
- **Tailwind**: `flex`, `grid`, `gap-4`, `p-6`, `hidden md:block`
- **CSS Modules**: Custom animations, hover effects, complex selectors

---

## Development Workflow

### File Structure

```
/home/user/buddy/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   └── completion/       # AI categorization endpoint
│   │   ├── fonts/                # Local fonts (Geist)
│   │   ├── static-app-shell/     # SPA shell page
│   │   ├── layout.tsx            # Root layout with Mantine
│   │   └── globals.css           # Global styles
│   │
│   ├── routes/                   # Client-side routes (React Router)
│   │   ├── app.tsx              # Router configuration
│   │   ├── layout.tsx           # Shared layout (nav + content)
│   │   ├── home-page.tsx        # Dashboard
│   │   ├── expenses-page.tsx    # Expense management
│   │   ├── incomes-page.tsx     # Income tracking
│   │   ├── accounts-page.tsx    # Account balances
│   │   ├── settings-page.tsx    # Categories & settings
│   │   └── investments-*.tsx    # Investment pages (4 files)
│   │
│   ├── components/               # React components
│   │   ├── navigation.tsx       # Main nav (sidebar + mobile)
│   │   ├── page-header.tsx      # Page header component
│   │   ├── expense-*.tsx        # Expense-related components
│   │   ├── income-*.tsx         # Income-related components
│   │   ├── account-*.tsx        # Account-related components
│   │   └── investment/          # Investment components
│   │       ├── investment-card.tsx
│   │       ├── performance-graph.tsx
│   │       └── forms/           # Investment forms
│   │
│   ├── stores/                   # State management
│   │   ├── instantdb.ts         # InstantDB config + hooks
│   │   └── useInvestmentStore.ts # Investment calculations
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript types
│   └── lib/                      # Utilities
│       ├── utils.ts             # General helpers
│       └── toon-helpers.ts      # TOON format helpers (new)
│
├── .env.local                    # Environment variables (not in git)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.mjs               # Next.js config
└── README.md                     # Project documentation
```

### Development Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code (if prettier is configured)
npx prettier --write "src/**/*.{ts,tsx}"

# Type check
npx tsc --noEmit
```

---

## Common Tasks

### Adding a New Page

1. **Create route file**: `src/routes/my-new-page.tsx`
```typescript
export function MyNewPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
}
```

2. **Add to router**: `src/routes/app.tsx`
```typescript
import { MyNewPage } from './my-new-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // ... existing routes
      { path: 'my-new-page', element: <MyNewPage /> }
    ]
  }
]);
```

3. **Add to navigation**: `src/components/navigation.tsx`
```typescript
const navItems = [
  // ... existing items
  { path: '/my-new-page', icon: Icon, label: 'My Page' }
];
```

---

### Creating a New Component

**With Mantine + CSS Modules**:

1. **Create component file**: `src/components/my-component.tsx`
```typescript
import { Card, Button } from '@mantine/core';
import styles from './my-component.module.css';

export function MyComponent({ title, onAction }) {
  return (
    <Card className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <Button onClick={onAction}>Click Me</Button>
    </Card>
  );
}
```

2. **Create CSS module**: `src/components/my-component.module.css`
```css
.container {
  padding: 1.5rem;
  border-radius: 8px;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
```

3. **Use in page**:
```typescript
import { MyComponent } from '@/components/my-component';

<MyComponent title="Hello" onAction={() => console.log('Clicked')} />
```

---

### Adding a New Database Entity

1. **Update InstantDB schema**: `src/stores/instantdb.ts`
```typescript
const db = init({
  schema: {
    // ... existing entities
    myNewEntity: {
      id: 'uuid',
      name: 'string',
      amount: 'number',
      createdAt: 'number'
    }
  }
});
```

2. **Create custom hook**:
```typescript
export function useMyEntityStore() {
  const { data } = db.useQuery({ myNewEntity: {} });

  async function addEntity(entity) {
    await db.transact(db.tx.myNewEntity[id()].update(entity));
  }

  async function updateEntity(id, updates) {
    await db.transact(db.tx.myNewEntity[id].update(updates));
  }

  async function deleteEntity(id) {
    await db.transact(db.tx.myNewEntity[id].delete());
  }

  return {
    entities: data?.myNewEntity || [],
    addEntity,
    updateEntity,
    deleteEntity
  };
}
```

3. **Use in component**:
```typescript
const { entities, addEntity } = useMyEntityStore();

// Entities are automatically reactive
```

---

### Working with Forms (Mantine + React Hook Form)

```typescript
import { TextInput, NumberInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

export function MyForm({ onSubmit }) {
  const form = useForm({
    initialValues: {
      name: '',
      amount: 0
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name too short' : null),
      amount: (value) => (value <= 0 ? 'Amount must be positive' : null)
    }
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        label="Name"
        placeholder="Enter name"
        {...form.getInputProps('name')}
      />
      <NumberInput
        label="Amount"
        placeholder="0.00"
        {...form.getInputProps('amount')}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

### Adding a Chart with Recharts

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function MyChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#46A758" />
    </LineChart>
  );
}
```

---

### Filtering Data by Month/Year (URL State)

```typescript
import { useQueryState, parseAsInteger } from 'nuqs';

export function MyPage() {
  const [year, setYear] = useQueryState('year', parseAsInteger.withDefault(2025));
  const [month, setMonth] = useQueryState('month', parseAsInteger.withDefault(1));

  const { expenses } = useExpenseStore();

  const filtered = expenses.filter(e => {
    const date = new Date(e.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });

  return (
    <div>
      <MonthYearPicker year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      <ExpenseList expenses={filtered} />
    </div>
  );
}
```

---

## Migration Progress

### Completed ✅

- [x] Project analysis and documentation
- [x] Created AGENTS.md (AI architecture)
- [x] Created Claude.md (this file)
- [ ] Created FUNCTIONALITY.md (page details) - **In Progress**

### Phase 2: Package Manager (Not Started)

- [ ] Remove bun.lockb
- [ ] Generate package-lock.json with npm
- [ ] Test all npm scripts
- [ ] Update documentation

### Phase 3: Remove Dark Mode (Not Started)

- [ ] Uninstall next-themes
- [ ] Remove ThemeProvider
- [ ] Delete theme components
- [ ] Clean up CSS variables
- [ ] Update Tailwind config

### Phase 4: AI Upgrade (Not Started)

- [ ] Install @ai-sdk/google
- [ ] Implement Gemini 2.5 Flash
- [ ] Add multi-provider fallback
- [ ] Test AI quality

### Phase 5: TOON Format (Not Started)

- [ ] Install @toon-format/toon
- [ ] Create TOON helpers
- [ ] Update API route
- [ ] Measure improvements

### Phase 6: Package Upgrades (Not Started)

- [ ] Upgrade Next.js to 15.x
- [ ] Upgrade React to latest
- [ ] Upgrade all dependencies
- [ ] Skip ShadCN (will be removed)

### Phase 7: Mantine Migration (Not Started)

- [ ] Install Mantine v8.3.0
- [ ] Setup MantineProvider
- [ ] Migrate 9 pages
- [ ] Replace Handsontable
- [ ] Remove all ShadCN/Radix
- [ ] Convert to CSS Modules

### Phase 8-10: Testing, Optimization, Documentation (Not Started)

---

## Troubleshooting

### "Module not found" errors

**Cause**: Using Bun-specific syntax or missing npm install

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### InstantDB "Unauthorized" error

**Cause**: Missing or invalid `NEXT_PUBLIC_INSTANTDB_APP_ID`

**Solution**:
1. Check `.env.local` file exists
2. Verify `NEXT_PUBLIC_INSTANTDB_APP_ID` is set
3. Restart dev server (`npm run dev`)

---

### AI categorization not working

**Cause**: Missing Google API key or network issues

**Solution**:
1. Check `.env.local` has `GOOGLE_API_KEY`
2. Verify API key is valid at https://aistudio.google.com
3. Check browser console for errors
4. Verify `/api/completion` endpoint is accessible

---

### CSS styles not applying

**Cause**: CSS Module naming or Tailwind purge issue

**Solution**:
1. Verify CSS Module filename: `component.module.css`
2. Import correctly: `import styles from './component.module.css'`
3. For Tailwind, check `tailwind.config.ts` content paths include your files
4. Restart dev server

---

### Build fails with TypeScript errors

**Cause**: Type mismatches after package upgrades

**Solution**:
```bash
# Check types
npx tsc --noEmit

# Fix imports and type annotations
# May need to update to latest @types packages
npm install -D @types/react@latest @types/react-dom@latest @types/node@latest
```

---

### React Router navigation not working

**Cause**: Using `<a>` instead of `<Link>` or incorrect router setup

**Solution**:
1. Always use `<Link>` from `react-router` for internal links
2. Verify `src/routes/app.tsx` router config is correct
3. Check `next.config.mjs` rewrites are in place

---

## Best Practices

### 1. State Management

- ✅ **DO**: Use InstantDB hooks for server state
- ✅ **DO**: Use nuqs for URL state (filters, params)
- ✅ **DO**: Use useState for local component state
- ❌ **DON'T**: Mix state management approaches unnecessarily

### 2. Styling

- ✅ **DO**: Use Mantine components for UI primitives
- ✅ **DO**: Use Tailwind for layout and spacing
- ✅ **DO**: Use CSS Modules for custom component styles
- ❌ **DON'T**: Write inline styles unless absolutely necessary
- ❌ **DON'T**: Use `!important` (shows architectural issue)

### 3. Components

- ✅ **DO**: Keep components small and focused
- ✅ **DO**: Extract reusable logic into custom hooks
- ✅ **DO**: Use TypeScript for props and state
- ❌ **DON'T**: Create "god components" with too many responsibilities

### 4. Performance

- ✅ **DO**: Use React.memo for expensive components
- ✅ **DO**: Use useMemo/useCallback for expensive calculations
- ✅ **DO**: Lazy load heavy components
- ❌ **DON'T**: Premature optimization (measure first)

### 5. AI Integration

- ✅ **DO**: Use TOON format for context (saves tokens)
- ✅ **DO**: Implement fallback providers
- ✅ **DO**: Validate AI output with Zod schemas
- ❌ **DON'T**: Trust AI output blindly (always validate)

---

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Router v7](https://reactrouter.com)
- [Mantine UI v8](https://mantine.dev)
- [InstantDB Docs](https://instantdb.com/docs)
- [Vercel AI SDK](https://ai-sdk.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Internal Docs

- `AGENTS.md` - AI architecture and migration
- `FUNCTIONALITY.md` - Page-by-page feature breakdown
- `README.md` - Project overview
- `MIGRATION.md` - Migration lessons (to be created)

---

## Getting Help

### For Claude Code Sessions

- This file (`Claude.md`) is your starting point
- Check `AGENTS.md` for AI-specific questions
- Check `FUNCTIONALITY.md` for page-specific details
- Review code in `src/` for implementation patterns

### For Issues

- Check console for errors (browser + terminal)
- Review this Troubleshooting section
- Check InstantDB dashboard for data issues
- Verify environment variables are set correctly

---

**Welcome to Buddy development! 🎉**

This codebase is undergoing a significant modernization. Follow the migration plan, use the new patterns documented here, and we'll have a cleaner, faster, cheaper application soon.
