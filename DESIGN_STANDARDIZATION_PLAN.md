# Buddy Design Standardization Plan

## Executive Summary

After reviewing 10 screenshots and the complete codebase, the app currently feels disconnected because components were built incrementally without a unified design system. This plan establishes a cohesive, modern design language using MantineUI v8's theming capabilities.

---

## Current Issues Identified

### 1. Card Styling Inconsistencies
| Component | Shadow | Border | Padding | Radius |
|-----------|--------|--------|---------|--------|
| YTDOverview | `sm` | yes | `md` | `md` |
| InvestmentCard | `sm` | yes | `lg` | `md` |
| ContributionTable | `sm` | yes | `md` | `md` |
| ExpenseList card | none | yes | `lg` | default |
| IncomeList card | none | yes | `lg` | default |
| Settings tables | none | no | varies | varies |

**Problem:** Mix of shadows and borders creates visual noise. Some cards feel heavy, others flat.

### 2. Table Styling Variations
- `expense-list.tsx`: `striped highlightOnHover withTableBorder fz="xs"`
- `contribution-table.tsx`: `striped highlightOnHover fz="xs"` (no border)
- `investment-overview.tsx`: `striped highlightOnHover` (default size)
- Settings tables: Custom Handsontable styling

**Problem:** Inconsistent density and borders make tables feel disconnected.

### 3. Button Patterns
- Cancel: Sometimes `variant="outline"`, sometimes `variant="subtle"`
- Sizes: `"sm"`, `"xs"`, `"compact-xs"`, default - all mixed
- Placement: Cancel left vs Cancel right varies by page
- Primary: Always blue filled, but placement inconsistent

### 4. Form Layouts
- Investment form: Uses `Card.Section` with borders and inline styles
- Other forms: Simple `Stack` with inputs
- Toggle switch: Custom div with inline styles instead of Mantine component

### 5. Section Headers
- Some use: `<Icon> + <Title order={4} c="dimmed">`
- Some use: Just text without icon
- Some use: `<Title order={2}>` without description
- PageHeader component not used consistently

### 6. Spacing Chaos
- Stack gaps: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` used randomly
- Card padding: `"md"`, `"lg"`, `p="xl"` mixed
- SimpleGrid spacing: `"md"`, `"lg"` mixed

### 7. Color Usage
- Positive values: `c="green.6"` or `color="green"`
- Negative values: `c="red.6"` or `color="red"`
- Dimmed text: `c="dimmed"` (consistent)
- No semantic color tokens

---

## Design Principles for Standardization

1. **Flat & Clean**: Remove all shadows, use subtle 1px borders only
2. **Consistent Density**: Single spacing scale applied everywhere
3. **Clear Hierarchy**: Typography and whitespace define importance
4. **Minimal Color**: Gray scale with blue accent, semantic red/green
5. **Modern Monospace**: All numbers in tabular monospace for alignment

---

## Phase 1: Theme Configuration

### Update `/src/app/layout.tsx`

```tsx
const theme = createTheme({
  // Typography
  fontFamily: 'system-ui, sans-serif',
  fontFamilyMonospace: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  headings: {
    fontFamily: "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
    fontWeight: '600',
  },

  // Remove default shadows
  shadows: {
    xs: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },

  // Consistent radius
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  defaultRadius: 'md',

  // Spacing scale
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // Primary color adjustments
  primaryColor: 'blue',
  primaryShade: 6,

  // Component defaults
  components: {
    Card: {
      defaultProps: {
        padding: 'md',
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--mantine-color-gray-2)',
        },
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: 'xs',
        horizontalSpacing: 'sm',
      },
      styles: {
        th: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: 'var(--mantine-color-gray-6)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Accordion: {
      styles: {
        control: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        item: {
          borderBottom: 'none',
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        variant: 'light',
      },
    },
  },
})
```

---

## Phase 2: Design Tokens

### Add to `/src/app/globals.css`

```css
:root {
  /* Existing font vars */
  --font-system: system-ui, sans-serif;
  --font-humanist: Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  /* Semantic spacing */
  --space-section: var(--mantine-spacing-lg);  /* Between major sections */
  --space-card: var(--mantine-spacing-md);      /* Inside cards */
  --space-element: var(--mantine-spacing-sm);   /* Between related elements */
  --space-tight: var(--mantine-spacing-xs);     /* Compact spacing */

  /* Semantic colors */
  --color-positive: var(--mantine-color-green-6);
  --color-negative: var(--mantine-color-red-6);
  --color-muted: var(--mantine-color-gray-6);
  --color-border: var(--mantine-color-gray-2);
  --color-bg-subtle: var(--mantine-color-gray-0);
}
```

---

## Phase 3: Component Standardization

### 3.1 Create Shared Card Component

**File: `/src/components/ui/section-card.tsx`**

```tsx
import { FC, PropsWithChildren, ReactNode } from 'react'
import { Card, Stack, Group, Title } from '@mantine/core'
import { LucideIcon } from 'lucide-react'

interface SectionCardProps {
  title?: string
  icon?: LucideIcon
  action?: ReactNode
  compact?: boolean
}

export const SectionCard: FC<PropsWithChildren<SectionCardProps>> = ({
  title,
  icon: Icon,
  action,
  compact = false,
  children,
}) => (
  <Card>
    {title && (
      <Group justify="space-between" mb={compact ? 'xs' : 'sm'}>
        <Group gap="xs">
          {Icon && <Icon size={18} style={{ color: 'var(--color-muted)' }} />}
          <Title order={5} fw={600}>{title}</Title>
        </Group>
        {action}
      </Group>
    )}
    <Stack gap={compact ? 'xs' : 'sm'}>{children}</Stack>
  </Card>
)
```

### 3.2 Create Standardized Data Table

**File: `/src/components/ui/data-table.tsx`**

```tsx
import { FC, ReactNode } from 'react'
import { Table, ScrollArea, Text, Center } from '@mantine/core'

interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: number | string
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, any>[]
  renderCell?: (row: Record<string, any>, key: string) => ReactNode
  emptyMessage?: string
}

export const DataTable: FC<DataTableProps> = ({
  columns,
  data,
  renderCell,
  emptyMessage = 'No data available',
}) => {
  if (data.length === 0) {
    return (
      <Center py="lg">
        <Text size="sm" c="dimmed">{emptyMessage}</Text>
      </Center>
    )
  }

  return (
    <ScrollArea>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key} ta={col.align} w={col.width}>
                {col.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, i) => (
            <Table.Tr key={row.id || i}>
              {columns.map((col) => (
                <Table.Td key={col.key} ta={col.align}>
                  {renderCell ? renderCell(row, col.key) : row[col.key]}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
```

### 3.3 Standardized Button Patterns

**File: `/src/components/ui/button-group.tsx`**

```tsx
import { FC, ReactNode } from 'react'
import { Group, Button } from '@mantine/core'

interface FormActionsProps {
  onCancel?: () => void
  cancelLabel?: string
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
}

export const FormActions: FC<FormActionsProps> = ({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  loading,
  disabled,
}) => (
  <Group justify="space-between">
    {onCancel && (
      <Button variant="subtle" color="gray" onClick={onCancel}>
        {cancelLabel}
      </Button>
    )}
    <Button type="submit" loading={loading} disabled={disabled} ml="auto">
      {submitLabel}
    </Button>
  </Group>
)

interface ActionButtonsProps {
  children: ReactNode
}

export const ActionButtons: FC<ActionButtonsProps> = ({ children }) => (
  <Group gap="xs" wrap="nowrap" justify="flex-end">
    {children}
  </Group>
)
```

### 3.4 Standardized Metric Display

**File: `/src/components/ui/metric-row.tsx`**

```tsx
import { FC } from 'react'
import { Group, Text } from '@mantine/core'

interface MetricRowProps {
  label: string
  value: string | number
  color?: string
  numeric?: boolean
}

export const MetricRow: FC<MetricRowProps> = ({
  label,
  value,
  color,
  numeric = true,
}) => (
  <Group justify="space-between">
    <Text size="sm" c="dimmed">{label}</Text>
    <Text
      size="sm"
      fw={600}
      c={color}
      className={numeric ? 'numeric-value' : undefined}
    >
      {value}
    </Text>
  </Group>
)
```

---

## Phase 4: Page-by-Page Updates

### 4.1 Home Page (Budget Overview)

**Current issues:**
- Cards use `shadow="sm"` and `padding={0}` for accordions
- Inconsistent gap spacing

**Changes:**
- Remove all shadows from cards
- Use consistent `gap="lg"` between sections
- Standardize accordion styling via theme

### 4.2 Expenses Page

**Current issues:**
- Left panel uses `withBorder p="lg"` without shadow
- Right panel same but different visual weight

**Changes:**
- Use `SectionCard` component
- Standardize table with `DataTable` component
- Align button styling

### 4.3 Incomes Page

**Current issues:**
- Same as expenses
- Form styling inconsistent with other pages

**Changes:**
- Mirror expenses page layout
- Use same components

### 4.4 Investments List Page

**Current issues:**
- Investment cards have shadows and hover effects
- PageHeader used but with custom action

**Changes:**
- Remove shadows from cards
- Use subtle border highlight on hover
- Standardize badge styling

### 4.5 Investment Detail Page

**Current issues:**
- Overview card has shadow
- Contribution/Value tables have shadow
- Button placement varies

**Changes:**
- Use `SectionCard` for all sections
- Standardize action button placement (top right)
- Use `FormActions` for modal buttons

### 4.6 Investment Edit Page

**Current issues:**
- Nested Card.Section with inline styles
- Custom switch toggle wrapper

**Changes:**
- Simplify to single card with Stack layout
- Use Mantine's built-in Switch styling
- Use `FormActions` component

### 4.7 Settings Page

**Current issues:**
- Custom Handsontable styling
- No card wrapper

**Changes:**
- Wrap in `SectionCard` with title
- Ensure Handsontable theme matches Mantine

---

## Phase 5: Typography Hierarchy

| Element | Component | Size | Weight | Color |
|---------|-----------|------|--------|-------|
| Page title | `Title order={1}` | h2 | 600 | default |
| Page description | `Text` | sm | 400 | dimmed |
| Section title | `Title order={5}` | sm | 600 | default |
| Card header | `Title order={5}` | sm | 600 | default |
| Table header | `Table.Th` | xs | 600 | gray.6 |
| Body text | `Text` | sm | 400 | default |
| Label | `Text` | sm | 400 | dimmed |
| Numeric values | `Text.numeric-value` | sm | 600 | varies |

---

## Phase 6: Color System

| Use Case | Token | Value |
|----------|-------|-------|
| Primary action | `blue.6` | #228be6 |
| Positive value | `green.6` | #40c057 |
| Negative value | `red.6` | #fa5252 |
| Active badge | `green` (light variant) | light green bg |
| Inactive badge | `gray` (light variant) | light gray bg |
| Dimmed text | `dimmed` | gray.6 |
| Border | `gray.2` | #e9ecef |
| Subtle background | `gray.0` | #f8f9fa |

---

## Phase 7: Spacing System

| Context | Gap | Value |
|---------|-----|-------|
| Between page sections | `lg` | 24px |
| Inside cards | `md` | 16px |
| Between form fields | `sm` | 12px |
| Between related text | `xs` | 8px |
| Table vertical spacing | `xs` | 8px |

---

## Implementation Order

1. **Theme updates** (`layout.tsx`) - Establishes foundation
2. **CSS tokens** (`globals.css`) - Semantic variables
3. **Shared components** (`/components/ui/`) - Reusable building blocks
4. **Home page** - Most visible, tests all patterns
5. **Investment pages** - Complex, multiple card types
6. **Expenses & Incomes pages** - Similar structure
7. **Settings page** - Handsontable integration

---

## Files to Modify

### Priority 1 (Theme & Foundation)
- [ ] `/src/app/layout.tsx` - Theme configuration
- [ ] `/src/app/globals.css` - CSS tokens

### Priority 2 (New Shared Components)
- [ ] `/src/components/ui/section-card.tsx` - Create
- [ ] `/src/components/ui/data-table.tsx` - Create
- [ ] `/src/components/ui/button-group.tsx` - Create
- [ ] `/src/components/ui/metric-row.tsx` - Create

### Priority 3 (Page Updates)
- [ ] `/src/routes/home-page.tsx`
- [ ] `/src/routes/investments-page.tsx`
- [ ] `/src/routes/investment-detail-page.tsx`
- [ ] `/src/routes/investment-edit-page.tsx` (or similar)
- [ ] `/src/routes/expenses-page.tsx`
- [ ] `/src/routes/incomes-page.tsx`
- [ ] `/src/routes/settings-page.tsx`

### Priority 4 (Component Updates)
- [ ] `/src/components/ytd-overview.tsx`
- [ ] `/src/components/home-overview.tsx`
- [ ] `/src/components/expense-overview.tsx`
- [ ] `/src/components/income-overview.tsx`
- [ ] `/src/components/expense-list.tsx`
- [ ] `/src/components/income-list.tsx`
- [ ] `/src/components/investment/investment-card.tsx`
- [ ] `/src/components/investment/investment-overview.tsx`
- [ ] `/src/components/investment/contribution-table.tsx`
- [ ] `/src/components/investment/value-table.tsx`
- [ ] `/src/components/investment/forms/investment-form.tsx`
- [ ] `/src/components/investment/forms/contribution-form.tsx`
- [ ] `/src/components/investment/forms/value-form.tsx`
- [ ] `/src/components/category-spreadsheet.tsx`
- [ ] `/src/components/page-header.tsx`
- [ ] `/src/components/navigation.tsx`

---

## Visual Before/After Summary

### Before
- Shadows create depth that feels outdated
- Borders + shadows = visual noise
- Inconsistent spacing = chaotic rhythm
- Mixed button styles = unclear hierarchy

### After
- Flat cards with subtle 1px borders
- Consistent 8px spacing rhythm
- Clear typography hierarchy
- Unified button language
- Professional, modern feel
