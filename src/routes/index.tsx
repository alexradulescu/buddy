import type { ReactNode } from 'react'
import { ActionIcon, Box, Button, Card, Menu, ScrollArea, Stack, Table, Text } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Download } from 'lucide-react'

import { PageHeader } from '@/components/shell'
import { BudgetRemaining, CardTitle, colorBySign, Meter, Money, StatTile } from '@/components/ui'
import { db } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { downloadCSV, fullCSV, overviewCSV, type ExportData } from '@/lib/csv'
import { expenseCategoryRows, incomeCategoryRows, monthTotal, portfolio, ytdSummary } from '@/lib/finance'
import { formatMoney, formatPercent } from '@/lib/format'

export const Route = createFileRoute('/')({ component: HomePage })

const positive = 'var(--color-positive)'

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
  const holdings = [...investments.rows].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  const totals = expenseRows.reduce(
    (t, r) => ({
      spentMonth: t.spentMonth + r.spent.month,
      spentYtd: t.spentYtd + r.spent.ytd,
      budgetMonth: t.budgetMonth + r.budget.month,
      budgetYtd: t.budgetYtd + r.budget.ytd,
      budgetAnnual: t.budgetAnnual + r.budget.annual,
      spentAnnual: t.spentAnnual + (r.budget.annual - r.delta.annual)
    }),
    { spentMonth: 0, spentYtd: 0, budgetMonth: 0, budgetYtd: 0, budgetAnnual: 0, spentAnnual: 0 }
  )
  const incomeTotals = incomeRows.reduce(
    (t, r) => ({ month: t.month + r.month, ytd: t.ytd + r.ytd, annual: t.annual + r.annual }),
    { month: 0, ytd: 0, annual: 0 }
  )

  const monthName = dayjs(new Date(year, month)).format('MMMM')
  const monthShort = dayjs(new Date(year, month)).format('MMM')

  const exportCSV = (kind: 'Overview' | 'Full') => {
    const csv = kind === 'Overview' ? overviewCSV(d, year, month) : fullCSV(d, year, month)
    downloadCSV(csv, `Dashboard-${kind}-${dayjs(new Date(year, month)).format('MMM-YYYY')}.csv`)
  }

  return (
    <Stack gap="lg">
      <PageHeader
        actions={
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Box>
                <Button
                  visibleFrom="sm"
                  variant="default"
                  leftSection={<Download size={16} />}
                  rightSection={<ChevronDown size={14} />}
                >
                  Export
                </Button>
                <ActionIcon hiddenFrom="sm" variant="light" size="lg" aria-label="Export">
                  <Download size={18} />
                </ActionIcon>
              </Box>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Export as CSV</Menu.Label>
              <Menu.Item onClick={() => exportCSV('Overview')}>Overview</Menu.Item>
              <Menu.Item onClick={() => exportCSV('Full')}>Full</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      <div className="summary-grid">
        <Card className="summary-card">
          <CardTitle title="This month" trailing={<Text className="card-title-note">{`${monthName} ${year}`}</Text>} />
          <div className="stat-tile-grid">
            <StatTile label="Income" value={formatMoney(income)} color={income > 0 ? positive : undefined} />
            <StatTile
              label="Spent"
              value={formatMoney(monthSpent)}
              meter={{ used: monthSpent, limit: totals.budgetMonth }}
              footnote={
                <>
                  <BudgetRemaining spent={monthSpent} budget={totals.budgetMonth} /> of{' '}
                  {formatMoney(totals.budgetMonth)}
                </>
              }
            />
            <StatTile label="Net income" value={formatMoney(net)} color={colorBySign(net)} />
            <StatTile label="Saving rate" value={income > 0 ? formatPercent(net / income) : 'N/A'} />
          </div>
        </Card>
        <Card className="summary-card">
          <CardTitle
            title={`${year} so far`}
            trailing={<Text className="card-title-note">{month === 0 ? 'Jan' : `Jan – ${monthShort}`}</Text>}
          />
          <div className="stat-tile-grid">
            <StatTile label="Income" value={formatMoney(ytd.income)} color={ytd.income > 0 ? positive : undefined} />
            <StatTile
              label="Spent"
              value={formatMoney(ytd.spent)}
              meter={{ used: ytd.spent, limit: ytd.budget }}
              footnote={
                <>
                  <BudgetRemaining spent={ytd.spent} budget={ytd.budget} /> of {formatMoney(ytd.budget)}
                </>
              }
            />
            <StatTile label="Savings" value={formatMoney(ytd.savings)} color={colorBySign(ytd.savings)} />
            <StatTile
              label="Savings rate"
              value={formatPercent(ytd.savingsRate)}
              footnote="Investments not counted as spent"
            />
          </div>
        </Card>
      </div>

      <Section title="Expenses by category">
        <div className="grouped-list" data-mobile>
          {expenseRows.map(({ category, spent, budget }) => (
            <GroupedRow
              key={category.id}
              to="/expenses"
              search={{ year, month, categoryExpense: category.id }}
              title={category.name}
              subtitle={`YTD ${formatMoney(spent.ytd)} / ${formatMoney(budget.ytd)}`}
              value={formatMoney(spent.month)}
              detail={<BudgetRemaining spent={spent.month} budget={budget.month} />}
              meter={<Meter used={spent.month} limit={budget.month} />}
            />
          ))}
        </div>
        <ScrollArea className="home-table" type="auto">
          <Table miw={860} className="data-table home-data-table">
            <Table.Thead>
              <Table.Tr className="column-group-row">
                <Table.Th rowSpan={2}>Category</Table.Th>
                <Table.Th colSpan={2} className="column-group">
                  {monthName}
                </Table.Th>
                <Table.Th colSpan={2} className="column-group">
                  {year} to date
                </Table.Th>
                <Table.Th className="column-group">Full year</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th ta="right" className="group-start">
                  Spent
                </Table.Th>
                <Table.Th>Budget</Table.Th>
                <Table.Th ta="right" className="group-start">
                  Spent
                </Table.Th>
                <Table.Th>Budget</Table.Th>
                <Table.Th className="group-start">Budget</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {expenseRows.map(({ category, spent, budget, delta }) => (
                <Table.Tr key={category.id}>
                  <Table.Td>
                    <Link
                      to="/expenses"
                      search={{ year, month, categoryExpense: category.id } as never}
                      className="row-link"
                    >
                      {category.name}
                    </Link>
                  </Table.Td>
                  <SpentCell value={spent.month} over={spent.month > budget.month} />
                  <BudgetCell spent={spent.month} budget={budget.month} />
                  <SpentCell value={spent.ytd} over={spent.ytd > budget.ytd} />
                  <BudgetCell spent={spent.ytd} budget={budget.ytd} />
                  <BudgetCell spent={budget.annual - delta.annual} budget={budget.annual} groupStart />
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr data-total>
                <Table.Td>Total</Table.Td>
                <SpentCell value={totals.spentMonth} over={totals.spentMonth > totals.budgetMonth} />
                <BudgetCell spent={totals.spentMonth} budget={totals.budgetMonth} />
                <SpentCell value={totals.spentYtd} over={totals.spentYtd > totals.budgetYtd} />
                <BudgetCell spent={totals.spentYtd} budget={totals.budgetYtd} />
                <BudgetCell spent={totals.spentAnnual} budget={totals.budgetAnnual} groupStart />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </ScrollArea>
      </Section>

      <Section title="Income by category">
        <div className="grouped-list" data-mobile>
          {incomeRows.map((row) => (
            <GroupedRow
              key={row.category.id}
              to="/incomes"
              search={{ year, month, categoryIncome: row.category.id }}
              title={row.category.title}
              subtitle={`YTD ${formatMoney(row.ytd)} · Year ${formatMoney(row.annual)}`}
              value={formatMoney(row.month)}
              valueColor={row.month > 0 ? positive : undefined}
            />
          ))}
        </div>
        <ScrollArea className="home-table" type="auto">
          <Table miw={600} className="data-table home-data-table">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th ta="right">{monthName}</Table.Th>
                <Table.Th ta="right">{year} to date</Table.Th>
                <Table.Th ta="right">Full year</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {incomeRows.map((row) => (
                <Table.Tr key={row.category.id}>
                  <Table.Td>
                    <Link
                      to="/incomes"
                      search={{ year, month, categoryIncome: row.category.id } as never}
                      className="row-link"
                    >
                      {row.category.title}
                    </Link>
                  </Table.Td>
                  {[row.month, row.ytd, row.annual].map((amount, i) => (
                    <Table.Td key={i} ta="right" c={amount > 0 ? positive : 'var(--color-text-muted)'}>
                      <Money value={amount} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr data-total>
                <Table.Td>Total</Table.Td>
                {[incomeTotals.month, incomeTotals.ytd, incomeTotals.annual].map((amount, i) => (
                  <Table.Td key={i} ta="right">
                    <Money value={amount} />
                  </Table.Td>
                ))}
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </ScrollArea>
      </Section>

      {investments.rows.length > 0 && (
        <Section title="Investments">
          <div className="stat-tile-grid investments-stats">
            <StatTile label="Value" value={formatMoney(investments.value)} />
            <StatTile label="Invested" value={formatMoney(investments.invested)} />
            <StatTile
              label="Profit/loss"
              value={formatMoney(investments.profit)}
              color={colorBySign(investments.profit)}
              footnote={`${formatPercent(investments.returnRate, 2)} return`}
            />
            <StatTile
              label="All contributions"
              value={formatMoney(ytd.totalInvested)}
              footnote="Including closed holdings"
            />
          </div>
          <div className="grouped-list" data-mobile>
            {holdings.map((r) => (
              <GroupedRow
                key={r.investment.id}
                to="/investments/$id"
                params={{ id: r.investment.id }}
                title={r.investment.name}
                subtitle={`Invested ${formatMoney(r.invested)}`}
                value={formatMoney(r.value)}
                detail={
                  <span className={r.profit >= 0 ? 'positive' : 'negative'}>
                    {formatMoney(r.profit)} · {formatPercent(r.returnRate, 2)}
                  </span>
                }
              />
            ))}
          </div>
          <ScrollArea className="home-table" type="auto">
            <Table miw={560} className="data-table home-data-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Holding</Table.Th>
                  <Table.Th ta="right">Value</Table.Th>
                  <Table.Th ta="right">Invested</Table.Th>
                  <Table.Th ta="right">Profit/loss</Table.Th>
                  <Table.Th ta="right">Return</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {holdings.map((r) => (
                  <Table.Tr key={r.investment.id}>
                    <Table.Td>
                      <Link to="/investments/$id" params={{ id: r.investment.id }} className="row-link">
                        {r.investment.name}
                      </Link>
                    </Table.Td>
                    <Table.Td ta="right" fw={600}>
                      <Money value={r.value} />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Money value={r.invested} />
                    </Table.Td>
                    <Table.Td ta="right" c={colorBySign(r.profit)}>
                      <Money value={r.profit} />
                    </Table.Td>
                    <Table.Td ta="right" className="tabular-number" c={colorBySign(r.profit)}>
                      {formatPercent(r.returnRate, 2)}
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

// A card with a title on desktop; on phones the card chrome goes and the title heads a grouped list
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card padding={0} className="home-section">
      <Box className="home-section-header">
        <CardTitle title={title} />
      </Box>
      {children}
    </Card>
  )
}

// One tappable phone row: title and secondary line on the left, value and detail on the right
function GroupedRow({
  to,
  search,
  params,
  title,
  subtitle,
  value,
  valueColor,
  detail,
  meter
}: {
  to: string
  search?: object
  params?: object
  title: string
  subtitle: string
  value: string
  valueColor?: string
  detail?: ReactNode
  meter?: ReactNode
}) {
  return (
    <Link to={to} search={search as never} params={params as never} className="grouped-list-row">
      <Box className="grouped-list-row-main">
        <Text className="grouped-list-row-title">{title}</Text>
        <Text className="grouped-list-row-subtitle">{subtitle}</Text>
        {meter && <Box mt={6}>{meter}</Box>}
      </Box>
      <Stack gap={2} align="flex-end">
        <Text className="grouped-list-row-value" c={valueColor}>
          {value}
        </Text>
        {detail && <Text className="grouped-list-row-detail">{detail}</Text>}
      </Stack>
      <ChevronRight size={16} strokeWidth={2.5} className="grouped-list-chevron" />
    </Link>
  )
}

function SpentCell({ value, over }: { value: number; over: boolean }) {
  return (
    <Table.Td ta="right" className="group-start spent-cell" data-over={over || undefined}>
      <Money value={value} />
    </Table.Td>
  )
}

// "$40 left" over "of $600" and a meter
function BudgetCell({ spent, budget, groupStart }: { spent: number; budget: number; groupStart?: boolean }) {
  return (
    <Table.Td className={groupStart ? 'budget-cell group-start' : 'budget-cell'}>
      <div className="budget-cell-text">
        <BudgetRemaining spent={spent} budget={budget} />
        <span className="budget-cell-of">of {formatMoney(budget)}</span>
      </div>
      <Meter used={spent} limit={budget} />
    </Table.Td>
  )
}
