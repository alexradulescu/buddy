# Buddy - Personal Finance Manager

A local-first personal finance application with AI-powered expense categorization, built with Next.js and InstantDB.

## Features

- 📊 **Dashboard** - Monthly overview of income, expenses, and investments
- 💳 **Expense Tracking** - AI-powered categorization from bank statements
- 💰 **Income Management** - Track income sources by category
- 🏦 **Account Balances** - Monthly snapshots with reconciliation
- 📈 **Investments** - Track portfolio performance with contributions and values
- ⚙️ **Budget Management** - Set monthly/annual budgets per category

## Tech Stack

- **Framework**: Next.js 14 + React Router 7 (hybrid SPA)
- **Database**: InstantDB (real-time, local-first)
- **AI**: Vercel AI SDK with Gemini 2.5 Flash (migrating from OpenAI)
- **UI**: Mantine UI v8 (migrating from ShadCN)
- **Styling**: Tailwind CSS + CSS Modules
- **Package Manager**: npm (migrated from Bun for Claude Code compatibility)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- InstantDB account (free tier available)
- Google API key for AI features (optional)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```env
NEXT_PUBLIC_INSTANTDB_APP_ID=your_instantdb_app_id
GOOGLE_API_KEY=your_google_api_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** - AI architecture and Gemini migration plan
- **[Claude.md](./Claude.md)** - Developer onboarding guide
- **[FUNCTIONALITY.md](./FUNCTIONALITY.md)** - Complete feature breakdown

## Project Status

🚧 **Active Migration** - Modernizing the tech stack:

- ✅ Phase 1: Documentation complete
- ✅ Phase 2: npm migration complete
- ⏳ Phase 3: Remove dark mode (pending)
- ⏳ Phase 4: AI upgrade to Gemini 2.5 Flash + TOON format (pending)
- ⏳ Phase 5-7: Package upgrades + Mantine UI migration (pending)

See [FUNCTIONALITY.md](./FUNCTIONALITY.md) for detailed migration plan.

## Getting Help

- Check [Claude.md](./Claude.md) for development patterns
- Check [AGENTS.md](./AGENTS.md) for AI integration details
- See [FUNCTIONALITY.md](./FUNCTIONALITY.md) for page-specific documentation

## License

MIT
