# Implementation Plan: Home Dashboard CSV Export

## Overview
Add a single "Export to CSV" button at the top of the Home Dashboard that exports all dashboard data into a single CSV file with the filename format `Dashboard-MMM-YYYY.csv`.

## CSV Structure

The CSV will have 5 sections separated by blank rows, with section headers:

```
SECTION: YTD Overview
Metric,Value
YTD Budget,12000.00
YTD Spent,8500.00
YTD Income,15000.00
Total Invested,5000.00
Investment Value,5250.00
YTD Savings,6500.00
Savings Rate,43.3%

SECTION: Expense Categories
Category,Current,Monthly Budget,Delta,Year-to-Date,YTD Budget,YTD Delta,Annual Budget,Annual Delta
Groceries,450.00,500.00,(+50.00),2700.00,3000.00,(+300.00),6000.00,(+3300.00)
Utilities,180.00,200.00,(+20.00),1080.00,1200.00,(+120.00),2400.00,(+1320.00)

SECTION: Income Categories
Category,Current,Year-to-Date,Annual
Salary,5000.00,30000.00,60000.00
Freelance,500.00,3000.00,6000.00

SECTION: Investments Overview
Metric,Value
Total Value,5250.00
Total Invested,5000.00
Total P&L,250.00 (5.00%)

SECTION: Investments
Name,Current Value,Total Invested,P&L,P&L %
Index Fund,3500.00,3000.00,500.00,16.67%
Bonds,1750.00,2000.00,-250.00,-12.50%
TOTAL,5250.00,5000.00,250.00,5.00%
```

## Implementation Steps

### Step 1: Create CSV Export Utility
**File:** `src/utils/csv-export.ts` (new file)

Create utility functions:
- `formatNumberForCSV(value: number): string` - Format number without $ sign, 2 decimal places
- `formatDeltaForCSV(delta: number): string` - Format as `(+50.00)` or `(-50.00)`
- `formatPercentForCSV(value: number): string` - Format as `43.3%`
- `downloadCSV(content: string, filename: string): void` - Trigger browser download
- `escapeCSVField(field: string): string` - Handle commas/quotes in text fields

### Step 2: Create Dashboard Export Hook
**File:** `src/hooks/use-dashboard-export.ts` (new file)

Create a custom hook `useDashboardExport()` that:
- Accepts the same data sources as the dashboard components
- Computes all the same values (reusing calculation logic)
- Returns a `exportToCSV()` function that generates and downloads the CSV

Data needed:
- `expenses`, `incomes` from stores
- `expenseCategories`, `incomeCategories` from stores
- `investments`, `getLatestValue`, `getTotalContributions` from investment store
- `selectedYear`, `selectedMonth` from query params

### Step 3: Add Export Button to Home Dashboard
**File:** `src/routes/home-page.tsx` (modify)

Changes:
1. Import the `useDashboardExport` hook
2. Add a `Button` with download icon at the top of the dashboard
3. Wire up the button's `onClick` to call `exportToCSV()`

UI placement:
```tsx
<Stack gap="md">
  <Group justify="flex-end">
    <Button
      leftSection={<Download size={16} />}
      variant="light"
      onClick={exportToCSV}
    >
      Export CSV
    </Button>
  </Group>
  {/* rest of dashboard */}
</Stack>
```

### Step 4: Build CSV Generation Logic

The `useDashboardExport` hook will build the CSV string by:

1. **YTD Overview section:**
   - Reuse calculation logic from `ytd-overview.tsx`
   - Format each metric as `Label,Value` rows

2. **Expense Categories section:**
   - Reuse calculation logic from `expense-overview.tsx`
   - Include columns: Category, Current, Monthly Budget, Delta, YTD, YTD Budget, YTD Delta, Annual Budget, Annual Delta
   - Format deltas as `(+X.XX)` or `(-X.XX)`

3. **Income Categories section:**
   - Reuse calculation logic from `income-overview.tsx`
   - Include columns: Category, Current, Year-to-Date, Annual

4. **Investments Overview section:**
   - Total Value, Total Invested, Total P&L (with %)

5. **Investments Table section:**
   - Individual investment rows + TOTAL row at the end
   - Columns: Name, Current Value, Total Invested, P&L, P&L %

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/csv-export.ts` | Create | CSV formatting and download utilities |
| `src/hooks/use-dashboard-export.ts` | Create | Hook containing export logic and data aggregation |
| `src/routes/home-page.tsx` | Modify | Add export button and wire up the hook |

## Technical Notes

1. **Date formatting for filename:** Use `format(new Date(selectedYear, selectedMonth), 'MMM-yyyy')` from date-fns (already in project)

2. **Browser download:** Use Blob + URL.createObjectURL + anchor click pattern:
   ```ts
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
   const url = URL.createObjectURL(blob)
   const link = document.createElement('a')
   link.href = url
   link.download = filename
   link.click()
   URL.revokeObjectURL(url)
   ```

3. **Escaping:** Wrap fields containing commas or quotes in double quotes, escape internal quotes by doubling them

4. **Number formatting:** Use `toFixed(2)` for currency values, no $ prefix

5. **Delta format:**
   - Positive (under budget): `(+50.00)`
   - Negative (over budget): `(-50.00)`

## Estimated Complexity
- **Low-Medium**: Most logic already exists in components, just needs to be extracted and reformatted for CSV output
- 3 files to create/modify
- Straightforward client-side implementation with no API changes
