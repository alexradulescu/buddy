import type { ReactNode } from 'react'
import {
  Accordion,
  ActionIcon,
  Anchor,
  Box,
  type BoxProps,
  Button,
  Card,
  Menu,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text
} from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Calendar, ChevronDown, ChevronRight, Download } from 'lucide-react'

import { PageHeader } from '@/components/shell'
import { CardTitle, colorBySign, MetricList, Money, Stat } from '@/components/ui'
import { db } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { downloadCSV, fullCSV, overviewCSV, type ExportData } from '@/lib/csv'
import { expenseCategoryRows, incomeCategoryRows, monthTotal, portfolio, ytdSummary } from '@/lib/finance'
import { formatMoney, formatPercent, monthLabel } from '@/lib/format'

export const Route = createFileRoute('/')({ component: HomePage })

const positive = 'var(--color-positive)'
const negative = 'var(--color-negative)'

function HomePage() {
  const { year, month } = useMonth()
  const { data } = db.useQuery({
    expenses: {},
    incomes: {},
    expenseCategories: {},
    incomeCategories: {},
    investments: {},
    investmentContributions: {},
    investmentValues: {}
  })

  const d: ExportData = {
    expenses: data?.expenses ?? [],
    incomes: data?.incomes ?? [],
    expenseCategories: data?.expenseCategories ?? [],
    incomeCategories: data?.incomeCategories ?? [],
    investments: data?.investments ?? [],
    contributions: data?.investmentContributions ?? [],
    values: data?.investmentValues ?? []
  }
  const ytd = ytdSummary(d, year, month)
  const investments = portfolio(d.investments, d.contributions, d.values)
  const income = monthTotal(d.incomes, year, month)
  const monthSpent = monthTotal(d.expenses, year, month)
  const net = income - monthSpent

  const expenseRows = expenseCategoryRows(d.expenses, d.expenseCategories, year, month)
  const incomeRows = incomeCategoryRows(d.incomes, d.incomeCategories, year, month)

  const exportCSV = (kind: 'Overview' | 'Full') => {
    const csv = kind === 'Overview' ? overviewCSV(d, year, month) : fullCSV(d, year, month)
    downloadCSV(csv, `Dashboard-${kind}-${dayjs(new Date(year, month)).format('MMM-YYYY')}.csv`)
  }

  return (
    <Stack gap="md">
      <PageHeader
        actions={
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <Box>
                <Button
                  visibleFrom="sm"
                  variant="light"
                  leftSection={<Download size={16} />}
                  rightSection={<ChevronDown size={14} />}
                >
                  Export CSV
                </Button>
                <ActionIcon hiddenFrom="sm" variant="light" size="lg" aria-label="Export CSV">
                  <Download size={18} />
                </ActionIcon>
              </Box>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => exportCSV('Overview')}>Overview</Menu.Item>
              <Menu.Item onClick={() => exportCSV('Full')}>Full</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        <Card>
          <CardTitle icon={<Calendar size={16} />} title={`Year to Date (${year})`} />
          <MetricList
            metrics={[
              { label: 'YTD Budget', value: formatMoney(ytd.budget) },
              { label: 'YTD Spent', value: formatMoney(ytd.spent) },
              { label: 'YTD Income', value: formatMoney(ytd.income) },
              { label: 'Total Invested', value: formatMoney(ytd.totalInvested) },
              { label: 'Investment Value', value: formatMoney(ytd.investmentValue) },
              { label: 'YTD Savings', value: formatMoney(ytd.savings) },
              { label: 'Savings Rate', value: formatPercent(ytd.savingsRate) }
            ]}
          />
        </Card>
        <Card>
          <CardTitle icon={<Calendar size={16} />} title={monthLabel(year, month)} />
          <MetricList
            metrics={[
              { label: 'Total Income', value: formatMoney(income), color: positive },
              { label: 'Total Expenses', value: formatMoney(monthSpent), color: negative },
              { label: 'Net Income', value: formatMoney(net) },
              { label: 'Investments', value: formatMoney(investments.value) },
              { label: 'Saving Rate', value: income > 0 ? formatPercent(net / income) : 'N/A' }
            ]}
          />
        </Card>
      </SimpleGrid>

      <Section title="Expense Categories">
        <GroupedList hiddenFrom="sm">
          {expenseRows.map(({ category, spent, budget, delta }) => (
            <GroupedRow
              key={category.id}
              to="/expenses"
              search={{ year, month, categoryExpense: category.id }}
              title={category.name}
              subtitle={[
                `YTD ${formatMoney(spent.ytd)} / ${formatMoney(budget.ytd)}`,
                `Annual budget ${formatMoney(budget.annual)}`
              ]}
              value={
                <Text className="grouped-list-row-value" c={spent.month > budget.month ? negative : undefined}>
                  {formatMoney(spent.month)}
                </Text>
              }
              detail={<DeltaPill delta={delta.month} />}
            />
          ))}
        </GroupedList>
        <ScrollArea visibleFrom="sm">
          <Table striped miw={800}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th pl="md">Category</Table.Th>
                <Table.Th ta="right">Current</Table.Th>
                <Table.Th ta="right">Monthly Budget</Table.Th>
                <Table.Th ta="right">Year-to-Date</Table.Th>
                <Table.Th ta="right">YTD Budget</Table.Th>
                <Table.Th ta="right" pr="md">
                  Annual Budget
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {expenseRows.map(({ category, spent, budget, delta }) => (
                <Table.Tr key={category.id}>
                  <Table.Td pl="md">
                    <CategoryLink to="/expenses" search={{ year, month, categoryExpense: category.id }}>
                      {category.name}
                    </CategoryLink>
                  </Table.Td>
                  <Table.Td ta="right" c={spent.month > budget.month ? negative : undefined}>
                    <Money value={spent.month} />
                  </Table.Td>
                  <BudgetCell budget={budget.month} delta={delta.month} />
                  <Table.Td ta="right">
                    <Money value={spent.ytd} />
                  </Table.Td>
                  <BudgetCell budget={budget.ytd} delta={delta.ytd} />
                  <BudgetCell budget={budget.annual} delta={delta.annual} pr="md" />
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Section>

      <Section title="Income Categories">
        <GroupedList hiddenFrom="sm">
          {incomeRows.map((row) => (
            <GroupedRow
              key={row.category.id}
              to="/incomes"
              search={{ year, month, categoryIncome: row.category.id }}
              title={row.category.title}
              subtitle={[`YTD ${formatMoney(row.ytd)}`, `Annual ${formatMoney(row.annual)}`]}
              value={
                <Text className="grouped-list-row-value" c={row.month > 0 ? positive : undefined}>
                  {formatMoney(row.month)}
                </Text>
              }
            />
          ))}
        </GroupedList>
        <ScrollArea visibleFrom="sm">
          <Table striped miw={600}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th pl="md">Category</Table.Th>
                <Table.Th ta="right">Current</Table.Th>
                <Table.Th ta="right">Year-to-Date</Table.Th>
                <Table.Th ta="right" pr="md">
                  Annual
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {incomeRows.map((row) => (
                <Table.Tr key={row.category.id}>
                  <Table.Td pl="md">
                    <CategoryLink to="/incomes" search={{ year, month, categoryIncome: row.category.id }}>
                      {row.category.title}
                    </CategoryLink>
                  </Table.Td>
                  {[row.month, row.ytd, row.annual].map((amount, i) => (
                    <Table.Td key={i} ta="right" pr={i === 2 ? 'md' : undefined} c={amount > 0 ? positive : undefined}>
                      <Money value={amount} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Section>

      {investments.rows.length > 0 && (
        <Section title="Investments">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" px="md" pt="sm">
            <Stat size="md" label="Total Value" value={formatMoney(investments.value)} />
            <Stat size="md" label="Total Invested" value={formatMoney(investments.invested)} />
            <Stat
              size="md"
              label="Total P&L"
              value={`${formatMoney(investments.profit)} (${formatPercent(investments.returnRate, 2)})`}
              color={colorBySign(investments.profit)}
            />
          </SimpleGrid>
          <GroupedList hiddenFrom="sm" mt="sm">
            {investments.rows.map((r) => (
              <GroupedRow
                key={r.investment.id}
                to="/investments/$id"
                params={{ id: r.investment.id }}
                title={r.investment.name}
                subtitle={[`Invested ${formatMoney(r.invested)}`]}
                value={<Text className="grouped-list-row-value">{formatMoney(r.value)}</Text>}
                detail={
                  <span className={`delta-pill ${r.profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(r.returnRate, 2)}
                  </span>
                }
              />
            ))}
          </GroupedList>
          <ScrollArea mt="sm" visibleFrom="sm">
            <Table miw={500}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th pl="md">Name</Table.Th>
                  <Table.Th ta="right">Current Value</Table.Th>
                  <Table.Th ta="right">Total Invested</Table.Th>
                  <Table.Th ta="right" pr="md">
                    P&L
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {investments.rows.map((r) => (
                  <Table.Tr key={r.investment.id}>
                    <Table.Td pl="md">{r.investment.name}</Table.Td>
                    <Table.Td ta="right">
                      <Money value={r.value} />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Money value={r.invested} />
                    </Table.Td>
                    <Table.Td ta="right" pr="md" className="tabular-number" c={colorBySign(r.profit)}>
                      {formatMoney(r.profit)} ({formatPercent(r.returnRate, 2)})
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Section>
      )}
    </Stack>
  )
}

// A card holding one open-by-default accordion; on phones the card dissolves into an iOS grouped section
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card padding={0} className="home-section">
      <Accordion defaultValue={title}>
        <Accordion.Item value={title}>
          <Accordion.Control>{title}</Accordion.Control>
          <Accordion.Panel styles={{ content: { padding: 0 } }}>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Card>
  )
}

function GroupedList({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box className="grouped-list" {...props}>
      {children}
    </Box>
  )
}

// One tappable row: title and secondary line on the left, value (and optional pill) on the right, chevron
function GroupedRow({
  to,
  search,
  params,
  title,
  subtitle,
  value,
  detail
}: {
  to: string
  search?: object
  params?: object
  title: string
  subtitle: string[]
  value: ReactNode
  detail?: ReactNode
}) {
  return (
    <Link to={to} search={search as never} params={params as never} className="grouped-list-row">
      <Box className="grouped-list-row-main">
        <Text className="grouped-list-row-title">{title}</Text>
        {subtitle.map((line) => (
          <Text key={line} className="grouped-list-row-subtitle">
            {line}
          </Text>
        ))}
      </Box>
      <Stack gap={2} align="flex-end">
        {value}
        {detail}
      </Stack>
      <ChevronRight size={16} strokeWidth={2.5} className="grouped-list-chevron" />
    </Link>
  )
}

function CategoryLink({ to, search, children }: { to: string; search: object; children: ReactNode }) {
  return (
    <Anchor component={Link} to={to} search={search as never} underline="never" fz="sm" fw={500} c="var(--color-tint)">
      {children}
    </Anchor>
  )
}

// Green when under budget
function DeltaPill({ delta }: { delta: number }) {
  return (
    <span className={`delta-pill ${delta >= 0 ? 'positive' : 'negative'}`}>
      {delta >= 0 ? '+' : '−'}
      {formatMoney(Math.abs(delta))}
    </span>
  )
}

// Budget amount with a +/- pill
function BudgetCell({ budget, delta, pr }: { budget: number; delta: number; pr?: string }) {
  return (
    <Table.Td ta="right" pr={pr} className="tabular-number">
      <Stack gap={2} align="flex-end">
        <Text fz="sm">{formatMoney(budget)}</Text>
        <DeltaPill delta={delta} />
      </Stack>
    </Table.Td>
  )
}
