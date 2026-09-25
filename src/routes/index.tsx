import type { ReactNode } from 'react'
import {
  Accordion,
  ActionIcon,
  Anchor,
  Badge,
  Box,
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
import { Calendar, ChevronDown, Download } from 'lucide-react'

import { PageHeader } from '@/components/shell'
import { CardTitle, colorBySign, MetricList, Money, Stat } from '@/components/ui'
import { db } from '@/db'
import { useMonth } from '@/hooks/use-month'
import { downloadCSV, fullCSV, overviewCSV, type ExportData } from '@/lib/csv'
import { expenseCategoryRows, incomeCategoryRows, monthTotal, portfolio, ytdSummary } from '@/lib/finance'
import { formatMoney, formatPercent, monthLabel } from '@/lib/format'

export const Route = createFileRoute('/')({ component: HomePage })

const positive = '#2D6A4F'
const negative = '#D64550'

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
          <CardTitle icon={<Calendar size={16} color="#52B788" />} title={monthLabel(year, month)} />
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
        <ScrollArea>
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
              {expenseCategoryRows(d.expenses, d.expenseCategories, year, month).map(
                ({ category, spent, budget, delta }) => (
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
                )
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Section>

      <Section title="Income Categories">
        <ScrollArea>
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
              {incomeCategoryRows(d.incomes, d.incomeCategories, year, month).map((row) => (
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
          <ScrollArea mt="sm">
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

// A card holding one open-by-default accordion
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card padding={0}>
      <Accordion defaultValue={title}>
        <Accordion.Item value={title}>
          <Accordion.Control styles={{ control: { paddingTop: 0, paddingBottom: 0 } }}>{title}</Accordion.Control>
          <Accordion.Panel styles={{ content: { padding: 0 } }}>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Card>
  )
}

function CategoryLink({ to, search, children }: { to: string; search: object; children: ReactNode }) {
  return (
    <Anchor component={Link} to={to} search={search as never} underline="hover" fz="sm" fw={500} c="forest.7">
      {children}
    </Anchor>
  )
}

// Budget amount with a +/- badge: green when under budget
function BudgetCell({ budget, delta, pr }: { budget: number; delta: number; pr?: string }) {
  const color = delta >= 0 ? positive : negative
  return (
    <Table.Td ta="right" pr={pr} className="tabular-number">
      <Stack gap={0} align="flex-end">
        <Text fz="sm">{formatMoney(budget)}</Text>
        <Badge size="xs" styles={{ root: { color, backgroundColor: `${color}1A` } }}>
          {delta >= 0 ? '+' : '-'}
          {formatMoney(Math.abs(delta))}
        </Badge>
      </Stack>
    </Table.Td>
  )
}
