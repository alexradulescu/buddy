# AI Agents in Buddy

**Last Updated**: November 2025
**Status**: Migration in progress (OpenAI → Gemini 2.5 Flash)

---

## Table of Contents

1. [Current Implementation](#current-implementation)
2. [Issues with Current Setup](#issues-with-current-setup)
3. [New Implementation (Gemini + TOON)](#new-implementation-gemini--toon)
4. [Migration Guide](#migration-guide)
5. [Cost Analysis](#cost-analysis)
6. [Future Improvements](#future-improvements)

---

## Current Implementation

### Overview

Buddy uses AI to automatically categorize expenses from raw bank statement text. Users paste transaction data, and the AI converts it into structured expense records with appropriate categories.

### Technical Stack (Current)

- **AI Provider**: OpenAI
- **Model**: GPT-4o (`gpt-4o`)
- **SDK**: Vercel AI SDK v4.1.50
- **API Endpoint**: `/api/completion`
- **Input Format**: Standard JSON
- **Output Format**: Structured JSON array with Zod validation
- **Streaming**: Yes (via `streamObject`)

### Architecture

**Location**: `src/app/api/completion/route.ts`

```typescript
// Current implementation structure
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { expenses, categories, transactions } = await req.json();

  const expenseSchema = z.object({
    expenses: z.array(z.object({
      amount: z.number().nonnegative(),
      categoryId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      description: z.string()
    }))
  });

  const result = streamObject({
    model: openai('gpt-4o'),
    schema: expenseSchema,
    system: systemPrompt,
    prompt: buildPrompt(expenses, categories, transactions)
  });

  return result.toTextStreamResponse();
}
```

### Context Provided to AI

The AI receives:

1. **Historical Expenses** (last 3 months)
   - Description → Category mapping
   - Used for pattern matching
   - Helps maintain consistency

2. **Active Categories**
   - Category ID → Category name mapping
   - Only non-archived categories
   - Prevents categorizing to deleted categories

3. **New Transactions** (user input)
   - Raw bank statement text
   - May contain multiple transactions
   - Various formats (different banks)

### Prompt Strategy

**System Prompt Instructions**:
- Skip transactions containing "Salary" or "Bullish" (income, not expenses)
- Format amounts as decimals without currency symbols
- Handle dual dates (e.g., "12/15 - 12/16") → use latest date
- Handle dual amounts (e.g., "50.00 / 45.00") → use smaller amount
- Default year to 2025 if missing
- Match historical patterns for category assignment
- Map old category names to new active categories if user renamed them

**Example Prompt Flow**:
```
Historical Expenses (last 3 months):
- "Starbucks Coffee" → categoryId: "abc-123" (Food & Dining)
- "Shell Gas Station" → categoryId: "def-456" (Transportation)
...

Active Categories:
- abc-123: "Food & Dining"
- def-456: "Transportation"
...

New Transactions to Categorize:
12/15 STARBUCKS #1234 $5.50
12/16 SHELL GAS $45.00
...
```

### Client-Side Integration

**Location**: `src/components/expense-ai-converter.tsx`

```typescript
import { useCompletion } from 'ai/react';

export function ExpenseAiConverter() {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/completion'
  });

  async function handleConvert(text: string) {
    await complete(text, {
      body: {
        expenses: historicalExpenses,
        categories: activeCategories,
        transactions: text
      }
    });
  }

  // Display streamed response in editable table
  // User can review/edit before saving to database
}
```

### User Flow

1. User pastes bank statement text into textarea
2. Clicks "Convert" button
3. AI processes text with historical context
4. Results stream into editable table (Handsontable)
5. User reviews and edits if needed
6. User clicks "Save" to commit to InstantDB
7. Expenses appear in expense list and dashboard

---

## Issues with Current Setup

### 1. High Cost 💰

**Problem**: GPT-4o is expensive for simple categorization tasks

- **Input**: $2.50 per 1M tokens
- **Output**: $10.00 per 1M tokens
- **Average conversion**: ~5,000 tokens (3K input, 2K output)
- **Cost per 1,000 conversions**: ~$50

**Why it's a problem**: For a personal finance app with frequent expense entries, costs can add up quickly.

### 2. Vendor Lock-in 🔒

**Problem**: Hard dependency on OpenAI

- No fallback provider
- If OpenAI API is down, feature is completely broken
- No ability to A/B test different providers
- Hard to migrate if OpenAI pricing changes

### 3. Token Inefficiency 📊

**Problem**: Standard JSON is verbose and token-heavy

**Example**:
```json
{
  "categories": [
    {"id": "abc-123", "name": "Food"},
    {"id": "def-456", "name": "Transport"}
  ]
}
```

**Issues**:
- Repeated field names (`"id"`, `"name"`)
- Unnecessary punctuation (`{`, `}`, `:`, `,`)
- Quoted strings for everything
- ~40% more tokens than necessary

### 4. Hard-Coded Prompts 📝

**Problem**: Prompts are embedded in route handler

- No versioning
- Difficult to A/B test
- No prompt analytics
- Hard to iterate and improve

### 5. Limited Error Handling ⚠️

**Problem**: Minimal fallback or retry logic

- Network errors kill the entire conversion
- No retry on transient failures
- No partial success handling
- User loses all work if API fails mid-stream

### 6. No Bank-Specific Parsers 🏦

**Problem**: Generic parsing doesn't handle bank-specific formats well

- DBS format differs from UOB format
- OCBC has unique transaction codes
- Manual pre-processing required by users
- Lower accuracy for certain banks

---

## New Implementation (Gemini + TOON)

### Overview

**Migration Goals**:
1. ✅ Reduce costs by 95%+
2. ✅ Improve token efficiency by 40%
3. ✅ Add multi-provider fallback
4. ✅ Maintain or improve accuracy
5. ✅ Prepare for future bank-specific parsers

### New Tech Stack

- **Primary Provider**: Google Gemini
- **Model**: `gemini-2.5-flash-preview-09-2025`
- **Fallback Provider**: OpenAI GPT-4o
- **SDK**: Vercel AI SDK latest (@ai-sdk/google)
- **Input Format**: TOON (Token-Oriented Object Notation)
- **Output Format**: Structured JSON (unchanged client-side)

### Why Gemini 2.5 Flash?

**Advantages**:
1. **Cost**: $0.075 input / $0.30 output per 1M tokens (33x cheaper)
2. **Speed**: Faster inference than GPT-4o
3. **Context**: 1M token window (vs 128K for GPT-4o)
4. **Quality**: 54% on SWE-Bench Verified (highly capable)
5. **Thinking Mode**: Built-in reasoning with `includeThoughts: true`
6. **Structured Output**: Native support for JSON schemas

**Benchmark Results** (from Google):
- 5% improvement in agentic tool use
- 24% reduction in output tokens with thinking mode
- Better instruction following than previous versions

### What is TOON Format?

**TOON** = Token-Oriented Object Notation

A compact encoding of JSON designed specifically for LLMs.

**Key Benefits**:
- **39.6% fewer tokens** than standard JSON
- **73.9% accuracy** vs 69.7% for JSON (on retrieval tasks)
- **Lossless round-trip** conversion
- **Easier for LLMs** to parse (tabular structure)

**Example Transformation**:

**Before (JSON - ~180 tokens)**:
```json
{
  "categories": [
    {"id": "abc-123", "name": "Food & Dining", "budget": 500},
    {"id": "def-456", "name": "Transportation", "budget": 200},
    {"id": "ghi-789", "name": "Entertainment", "budget": 150}
  ],
  "historicalExpenses": [
    {"date": "2025-01-15", "amount": 45.50, "description": "Starbucks Coffee", "categoryId": "abc-123"},
    {"date": "2025-01-16", "amount": 12.00, "description": "Grab Ride", "categoryId": "def-456"},
    {"date": "2025-01-17", "amount": 25.00, "description": "Cinema Ticket", "categoryId": "ghi-789"}
  ]
}
```

**After (TOON - ~110 tokens)**:
```
categories[3]{id,name,budget}:
  abc-123,Food & Dining,500
  def-456,Transportation,200
  ghi-789,Entertainment,150
historicalExpenses[3]{date,amount,description,categoryId}:
  2025-01-15,45.50,Starbucks Coffee,abc-123
  2025-01-16,12.00,Grab Ride,def-456
  2025-01-17,25.00,Cinema Ticket,ghi-789
```

**Savings**: ~40% fewer tokens = Lower costs + faster processing

### New Implementation Code

**Install Dependencies**:
```bash
npm install @ai-sdk/google@latest @toon-format/toon
```

**Environment Variables**:
```env
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_key_for_fallback
```

**Create TOON Helper** (`src/lib/toon-helpers.ts`):
```typescript
import { toTOON } from '@toon-format/toon';

export function buildTOONContext(expenses: Expense[], categories: Category[]) {
  const context = {
    historicalExpenses: expenses.map(e => ({
      description: e.description,
      categoryId: e.categoryId,
      amount: e.amount
    })),
    activeCategories: categories.map(c => ({
      id: c.id,
      name: c.name
    }))
  };

  return toTOON(context);
}
```

**Update API Route** (`src/app/api/completion/route.ts`):
```typescript
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { buildTOONContext } from '@/lib/toon-helpers';

export const maxDuration = 60;

// Expense schema (unchanged)
const expenseSchema = z.object({
  expenses: z.array(z.object({
    amount: z.number().nonnegative(),
    categoryId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string()
  }))
});

// System prompt (updated for TOON)
const systemPrompt = `You are an expense categorization assistant.
You receive historical expense context in TOON format (Token-Oriented Object Notation).
Parse the TOON data to understand category patterns, then categorize new transactions.

Rules:
- Skip transactions containing "Salary" or "Bullish" (these are income, not expenses)
- Format amounts as decimals without currency symbols
- Handle dual dates (use the latest date)
- Handle dual amounts (use the smaller amount)
- Default year to 2025 if missing
- Match historical patterns for consistent categorization
- Only use category IDs from the active categories list`;

async function categorizeWithGemini(expenses, categories, transactions) {
  const toonContext = buildTOONContext(expenses, categories);

  const result = await streamObject({
    model: google('gemini-2.5-flash-preview-09-2025'),
    schema: expenseSchema,
    system: systemPrompt,
    prompt: `${toonContext}\n\nCategorize these transactions:\n${transactions}`,
    // Optional: Enable thinking mode for better reasoning
    providerOptions: {
      includeThoughts: true
    }
  });

  return result;
}

async function categorizeWithOpenAI(expenses, categories, transactions) {
  // Fallback to original implementation
  const jsonContext = JSON.stringify({ expenses, categories });

  const result = await streamObject({
    model: openai('gpt-4o'),
    schema: expenseSchema,
    system: systemPrompt,
    prompt: `${jsonContext}\n\nCategorize these transactions:\n${transactions}`
  });

  return result;
}

export async function POST(req: Request) {
  try {
    const { expenses, categories, transactions } = await req.json();

    // Try Gemini first
    try {
      const result = await categorizeWithGemini(expenses, categories, transactions);
      return result.toTextStreamResponse();
    } catch (geminiError) {
      console.warn('Gemini failed, falling back to OpenAI:', geminiError);

      // Fallback to OpenAI
      const result = await categorizeWithOpenAI(expenses, categories, transactions);
      return result.toTextStreamResponse();
    }
  } catch (error) {
    console.error('AI categorization failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to categorize expenses' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Multi-Provider Fallback Strategy

**Fallback Chain**:
1. **Primary**: Gemini 2.5 Flash (fast, cheap)
2. **Fallback**: OpenAI GPT-4o (reliable, higher quality)
3. **Error**: Return error response to client

**When to Fallback**:
- API rate limits
- Network timeouts
- Invalid API key
- Model unavailability
- Quota exceeded

**Monitoring**:
```typescript
// Add telemetry to track provider usage
const telemetry = {
  geminiSuccess: 0,
  geminiFailure: 0,
  openaiSuccess: 0,
  openaiFailure: 0
};

// Log after each conversion
console.log('[AI Telemetry]', telemetry);
```

---

## Migration Guide

### Step 1: Install Dependencies

```bash
npm install @ai-sdk/google@latest @toon-format/toon
```

### Step 2: Add Environment Variables

Add to `.env.local`:
```env
GOOGLE_API_KEY=your_google_api_key
```

Get your API key from: https://aistudio.google.com/app/apikey

### Step 3: Create TOON Helpers

Create `src/lib/toon-helpers.ts` with the code shown above.

### Step 4: Update API Route

Replace `src/app/api/completion/route.ts` with the new implementation.

### Step 5: Test with Sample Data

```typescript
// Test TOON encoding
const testExpenses = [
  { description: 'Starbucks', categoryId: 'abc-123', amount: 5.50 },
  { description: 'Shell Gas', categoryId: 'def-456', amount: 45.00 }
];

const testCategories = [
  { id: 'abc-123', name: 'Food & Dining' },
  { id: 'def-456', name: 'Transportation' }
];

const toonOutput = buildTOONContext(testExpenses, testCategories);
console.log(toonOutput);
// Verify it's smaller and valid TOON format
```

### Step 6: A/B Test Quality

Run 100 test transactions through both systems:
- GPT-4o + JSON (baseline)
- Gemini 2.5 Flash + TOON (new)

Compare:
- Categorization accuracy (manual review)
- Token usage (from API response)
- Latency (time to completion)
- Cost (calculate from tokens)

### Step 7: Monitor in Production

Track metrics:
- Provider success/failure rates
- Average token usage
- User corrections (manual category changes after AI)
- Cost per day/week/month

---

## Cost Analysis

### Before (GPT-4o + JSON)

**Pricing**:
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

**Average Conversion**:
- Input tokens: ~3,000 (historical context + transactions)
- Output tokens: ~2,000 (structured expenses)
- Total cost per conversion: ~$0.0275

**Monthly Usage** (100 conversions):
- **Total cost**: $2.75/month
- **Annual**: $33/year

**High Volume** (1,000 conversions/month):
- **Total cost**: $27.50/month
- **Annual**: $330/year

---

### After (Gemini 2.5 Flash + TOON)

**Pricing**:
- Input: $0.075 per 1M tokens (33x cheaper)
- Output: $0.30 per 1M tokens (33x cheaper)

**Average Conversion** (with TOON):
- Input tokens: ~1,800 (40% reduction from TOON)
- Output tokens: ~2,000 (unchanged)
- Total cost per conversion: ~$0.00074

**Monthly Usage** (100 conversions):
- **Total cost**: $0.074/month
- **Annual**: $0.89/year

**High Volume** (1,000 conversions/month):
- **Total cost**: $0.74/month
- **Annual**: $8.88/year

---

### Cost Comparison Summary

| Usage Level | GPT-4o + JSON | Gemini + TOON | Savings |
|-------------|---------------|---------------|---------|
| 100/month   | $2.75         | $0.074        | **97.3%** |
| 1,000/month | $27.50        | $0.74         | **97.3%** |
| 10,000/month| $275.00       | $7.40         | **97.3%** |

**Annual Savings** (1,000 conversions/month):
- Before: $330/year
- After: $8.88/year
- **Saved**: $321.12/year

---

## Future Improvements

### 1. Bank-Specific Parsers

**Problem**: Different banks have different transaction formats

**Solution**: Pre-processing layer to normalize transactions

```typescript
// src/lib/bank-parsers.ts
export function detectBank(text: string): 'dbs' | 'uob' | 'ocbc' | 'generic' {
  if (text.includes('DBS') || text.includes('POSB')) return 'dbs';
  if (text.includes('UOB')) return 'uob';
  if (text.includes('OCBC')) return 'ocbc';
  return 'generic';
}

export function parseTransactions(text: string, bank: string) {
  switch (bank) {
    case 'dbs':
      return parseDBSFormat(text);
    case 'uob':
      return parseUOBFormat(text);
    case 'ocbc':
      return parseOCBCFormat(text);
    default:
      return text; // Let AI handle it
  }
}
```

### 2. Prompt Versioning

**Problem**: Hard to iterate and A/B test prompts

**Solution**: Version prompts and track performance

```typescript
// src/lib/prompts.ts
export const prompts = {
  'v1.0': 'You are an expense categorizer...',
  'v1.1': 'You are an AI assistant that categorizes expenses...',
  'v2.0': 'As a financial categorization expert...'
};

export function getPrompt(version = 'latest') {
  return version === 'latest' ? prompts['v2.0'] : prompts[version];
}
```

### 3. Caching Historical Context

**Problem**: Same historical expenses sent repeatedly

**Solution**: Cache TOON context, invalidate on new expenses

```typescript
// src/lib/context-cache.ts
const cache = new Map<string, string>();

export function getCachedContext(userId: string, month: string) {
  const key = `${userId}:${month}`;
  return cache.get(key);
}

export function setCachedContext(userId: string, month: string, toon: string) {
  const key = `${userId}:${month}`;
  cache.set(key, toon);
}
```

### 4. Duplicate Detection

**Problem**: Users might paste same transactions twice

**Solution**: Fuzzy matching before sending to AI

```typescript
// src/lib/duplicate-detection.ts
import { similarity } from 'string-similarity';

export function detectDuplicates(newExpenses: Expense[], existing: Expense[]) {
  return newExpenses.filter(newExp => {
    return !existing.some(existingExp => {
      const descMatch = similarity(newExp.description, existingExp.description) > 0.8;
      const dateMatch = newExp.date === existingExp.date;
      const amountMatch = Math.abs(newExp.amount - existingExp.amount) < 0.01;
      return descMatch && dateMatch && amountMatch;
    });
  });
}
```

### 5. Agentic Workflow

**Problem**: Simple one-shot categorization may miss nuances

**Solution**: Multi-step agent workflow

**Steps**:
1. **Parse** transactions → structured data
2. **Categorize** with confidence scores
3. **Review** low-confidence items with reasoning
4. **Refine** based on user feedback

```typescript
// Future: Multi-agent workflow
async function agenticCategorization(transactions: string) {
  // Step 1: Parse
  const parsed = await parseAgent(transactions);

  // Step 2: Categorize
  const categorized = await categorizeAgent(parsed);

  // Step 3: Review low confidence
  const lowConfidence = categorized.filter(e => e.confidence < 0.7);
  const refined = await reviewAgent(lowConfidence);

  return [...categorized.filter(e => e.confidence >= 0.7), ...refined];
}
```

### 6. Continuous Learning

**Problem**: AI doesn't learn from user corrections

**Solution**: Store user corrections, retrain/fine-tune

```typescript
// Track corrections for future fine-tuning
export function trackCorrection(
  original: Expense,
  corrected: Expense,
  userId: string
) {
  // Store in database
  db.corrections.create({
    userId,
    originalCategoryId: original.categoryId,
    correctedCategoryId: corrected.categoryId,
    description: original.description,
    timestamp: new Date()
  });
}

// Periodically analyze corrections to improve prompts
```

---

## Testing & Validation

### Unit Tests

```typescript
// src/lib/__tests__/toon-helpers.test.ts
import { buildTOONContext } from '../toon-helpers';

describe('TOON Helpers', () => {
  it('should convert expenses to TOON format', () => {
    const expenses = [
      { description: 'Coffee', categoryId: 'abc', amount: 5.50 }
    ];
    const categories = [{ id: 'abc', name: 'Food' }];

    const toon = buildTOONContext(expenses, categories);

    expect(toon).toContain('historicalExpenses[1]');
    expect(toon).toContain('activeCategories[1]');
  });
});
```

### Integration Tests

```typescript
// Test full API flow
describe('AI Categorization API', () => {
  it('should categorize expenses with Gemini', async () => {
    const response = await fetch('/api/completion', {
      method: 'POST',
      body: JSON.stringify({
        expenses: mockExpenses,
        categories: mockCategories,
        transactions: 'STARBUCKS $5.50'
      })
    });

    const data = await response.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].description).toContain('Starbucks');
  });
});
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Provider Usage**
   - Gemini success rate
   - OpenAI fallback rate
   - Error rate

2. **Performance**
   - Average token usage (input/output)
   - Latency (time to first token, total time)
   - TOON encoding overhead

3. **Quality**
   - User correction rate (manual category changes)
   - Duplicate detection accuracy
   - Bank format coverage

4. **Cost**
   - Daily/weekly/monthly AI spend
   - Cost per conversion
   - Savings vs. GPT-4o baseline

### Logging

```typescript
// Add structured logging
export async function POST(req: Request) {
  const startTime = Date.now();
  let provider = 'gemini';

  try {
    // ... categorization logic

    // Log success
    console.log({
      event: 'ai_categorization_success',
      provider,
      duration: Date.now() - startTime,
      tokenUsage: result.usage,
      transactionCount: result.expenses.length
    });
  } catch (error) {
    // Log failure
    console.error({
      event: 'ai_categorization_failure',
      provider,
      error: error.message,
      duration: Date.now() - startTime
    });
  }
}
```

---

## Conclusion

The migration from OpenAI GPT-4o to Gemini 2.5 Flash with TOON format provides:

✅ **97% cost reduction**
✅ **40% fewer tokens**
✅ **Similar or better accuracy**
✅ **Multi-provider resilience**
✅ **Foundation for future improvements**

This positions Buddy for scalable, cost-effective AI-powered expense management.

---

**Next Steps**:
1. Complete migration (see Migration Guide)
2. Run A/B tests to validate quality
3. Monitor metrics for 1 month
4. Implement bank-specific parsers
5. Add duplicate detection
6. Explore agentic workflows
