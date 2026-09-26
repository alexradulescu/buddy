import { useState } from 'react'
import { Card, SimpleGrid } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

import { DraftEntry, newDraft, TransactionList, type Draft } from '@/components/transactions'
import { db } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'
import { inMonth } from '@/lib/finance'

export const Route = createFileRoute('/incomes')({ component: IncomesPage })

function IncomesPage() {
  const { year, month } = useMonth()
  const { data } = db.useQuery({ incomes: {}, incomeCategories: {} })
  const [drafts, setDrafts] = useState<Draft[]>(() => [newDraft(year, month)])
  useUnsavedChangesWarning(drafts.some((d) => d.amount || d.description))

  const categories = data?.incomeCategories ?? []
  const allOptions = categories.map((c) => ({ value: c.id, label: c.title }))
  const activeOptions = categories.filter((c) => !c.isArchived).map((c) => ({ value: c.id, label: c.title }))
  const monthIncomes = (data?.incomes ?? []).filter((i) => inMonth(i, year, month))

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
      <Card>
        <DraftEntry
          entity="incomes"
          categories={activeOptions}
          drafts={drafts}
          setDrafts={setDrafts}
          year={year}
          month={month}
        />
      </Card>
      <Card>
        <TransactionList entity="incomes" rows={monthIncomes} categories={allOptions} />
      </Card>
    </SimpleGrid>
  )
}
