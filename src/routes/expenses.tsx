import { useState, type ReactNode } from 'react'
import { Card, Group, SegmentedControl, SimpleGrid, Stack } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { SparklesIcon, TableIcon } from 'lucide-react'

import { ImportPanel } from '@/components/import-panel'
import { DraftEntry, TransactionList, type Draft } from '@/components/transactions'
import { db } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'
import { inMonth } from '@/lib/finance'

export const Route = createFileRoute('/expenses')({ component: ExpensesPage })

function ExpensesPage() {
  const { year, month } = useMonth()
  const { data } = db.useQuery({ expenses: {}, expenseCategories: {} })
  const [tab, setTab] = useState('import')
  const [drafts, setDrafts] = useState<Draft[]>([])
  useUnsavedChangesWarning(drafts.length > 0)

  const expenses = data?.expenses ?? []
  const categories = data?.expenseCategories ?? []
  const allOptions = categories.map((c) => ({ value: c.id, label: c.name }))
  const activeOptions = categories.filter((c) => !c.isArchived).map((c) => ({ value: c.id, label: c.name }))
  const monthExpenses = expenses.filter((e) => inMonth(e, year, month))
  const threeMonthsAgo = dayjs().subtract(3, 'month').format('YYYY-MM-DD')
  const history = expenses.filter((e) => e.date >= threeMonthsAgo)

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
      <Card>
        <Stack gap="sm">
          <SegmentedControl
            fullWidth
            value={tab}
            onChange={setTab}
            data={[
              { value: 'import', label: <Label icon={<SparklesIcon size={14} />} text="AI Import" /> },
              { value: 'manual', label: <Label icon={<TableIcon size={14} />} text="Manual" /> }
            ]}
          />
          {tab === 'import' ? (
            <ImportPanel
              categories={activeOptions}
              history={history}
              monthExpenses={monthExpenses}
              year={year}
              month={month}
            />
          ) : (
            <DraftEntry
              entity="expenses"
              categories={activeOptions}
              drafts={drafts}
              setDrafts={setDrafts}
              year={year}
              month={month}
            />
          )}
        </Stack>
      </Card>

      <Card>
        <TransactionList entity="expenses" rows={monthExpenses} categories={allOptions} />
      </Card>
    </SimpleGrid>
  )
}

const Label = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <Group gap={6} wrap="nowrap" justify="center">
    {icon}
    <span>{text}</span>
  </Group>
)
