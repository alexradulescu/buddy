import { useState, useRef, useEffect } from 'react'
import {
  Stack,
  Card,
  Group,
  Button,
  Textarea,
  Select,
  Text,
  Title,
  Box,
  rem,
  Paper,
  ScrollArea,
  ActionIcon,
  Loader,
  Divider
} from '@mantine/core'
import { TypographyStylesProvider } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { SendHorizonal, Sparkles, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { db, useExpenseStore, useIncomeStore, useCategoryStore } from '@/stores/instantdb'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { formatCounselorData } from '@/utils/counselor-data-formatter'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const COUNSELOR_PROFILE_ID = 'counselor-profile'

function buildYearOptions() {
  const current = new Date().getFullYear()
  const years: { value: string; label: string }[] = []
  for (let y = current; y >= current - 5; y--) {
    years.push({ value: String(y), label: String(y) })
  }
  return years
}

const YEAR_OPTIONS = buildYearOptions()
const MONTH_OPTIONS = MONTHS.map((name, idx) => ({ value: String(idx), label: name }))

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function CounselorPage() {
  const now = new Date()
  const defaultToMonth = now.getMonth()
  const defaultToYear = now.getFullYear()
  const defaultFromMonth = defaultToMonth >= 2 ? defaultToMonth - 2 : (12 + defaultToMonth - 2) % 12
  const defaultFromYear = defaultToMonth >= 2 ? defaultToYear : defaultToYear - 1

  const [fromMonth, setFromMonth] = useState(defaultFromMonth)
  const [fromYear, setFromYear] = useState(defaultFromYear)
  const [toMonth, setToMonth] = useState(defaultToMonth)
  const [toYear, setToYear] = useState(defaultToYear)
  const [userContext, setUserContext] = useState('')
  const [report, setReport] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isChatting, setIsChatting] = useState(false)

  const financialDataRef = useRef<string>('')
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Data hooks
  const { data: { expenses = [] } = {} } = useExpenseStore()
  const { data: { incomes = [] } = {} } = useIncomeStore()
  const { data: { expenseCategories = [], incomeCategories = [] } = {} } = useCategoryStore()
  const { investments, investmentContributions, investmentValues } = useInvestmentStore()

  // Load profile and account balances
  const { data: profileData } = db.useQuery({ counselorProfiles: {}, accountBalances: {} })
  const accountBalances = profileData?.accountBalances ?? []

  useEffect(() => {
    const saved = profileData?.counselorProfiles?.find((p) => p.id === COUNSELOR_PROFILE_ID)
    if (saved?.context && !userContext) {
      setUserContext(saved.context)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.counselorProfiles])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  function buildFinancialData() {
    return formatCounselorData({
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      expenses,
      incomes,
      expenseCategories,
      incomeCategories,
      investments,
      investmentContributions,
      investmentValues,
      accountBalances
    })
  }

  async function saveContext(context: string) {
    await db.transact([
      db.tx.counselorProfiles[COUNSELOR_PROFILE_ID].update({
        context,
        updatedAt: Date.now()
      })
    ])
  }

  async function streamToState(
    response: Response,
    onChunk: (text: string) => void
  ) {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response stream')
    const decoder = new TextDecoder()
    let accumulated = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      onChunk(accumulated)
    }
    return accumulated
  }

  async function handleAnalyze() {
    if (isAnalyzing || isChatting) return

    const fromDate = new Date(fromYear, fromMonth)
    const toDate = new Date(toYear, toMonth)
    if (fromDate > toDate) {
      notifications.show({ color: 'red', message: '"From" date must be before or equal to "To" date.' })
      return
    }

    setIsAnalyzing(true)
    setReport('')
    setMessages([])

    try {
      await saveContext(userContext)

      const financialData = buildFinancialData()
      financialDataRef.current = financialData

      const response = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialData, userContext, messages: [] })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      await streamToState(response, (text) => setReport(text))

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      notifications.show({ color: 'red', message: 'Analysis failed. Please try again.' })
      console.error('[Counselor] Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleSendMessage() {
    const text = chatInput.trim()
    if (!text || isChatting || isAnalyzing) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    const assistantPlaceholder: ChatMessage = { role: 'assistant', content: '' }

    const updatedMessages = [...messages, userMessage]
    setMessages([...updatedMessages, assistantPlaceholder])
    setChatInput('')
    setIsChatting(true)

    try {
      const response = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialData: financialDataRef.current,
          userContext,
          messages: [...updatedMessages]
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      await streamToState(response, (text) => {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: text }
          return copy
        })
      })
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to send message. Please try again.' })
      setMessages((prev) => prev.slice(0, -1))
      console.error('[Counselor] Chat error:', err)
    } finally {
      setIsChatting(false)
    }
  }

  function handleReset() {
    setReport('')
    setMessages([])
    financialDataRef.current = ''
  }

  const hasReport = report.length > 0
  const isRangeValid = new Date(fromYear, fromMonth) <= new Date(toYear, toMonth)

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Title order={2} fw={700} style={{ color: '#1B4332' }}>Financial Counselor</Title>
          <Text size="sm" c="dimmed">Select a date range and let AI analyze your spending patterns</Text>
        </Stack>
        {hasReport && (
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            New Analysis
          </Button>
        )}
      </Group>

      {/* Setup card */}
      <Card withBorder radius="md" p="md">
        <Stack gap="md">
          <Text fw={600} size="sm">Date Range</Text>
          <Group grow gap="sm">
            <Stack gap={4}>
              <Text size="xs" c="dimmed">From</Text>
              <Group gap="xs" wrap="nowrap">
                <Select
                  data={MONTH_OPTIONS}
                  value={String(fromMonth)}
                  onChange={(v) => v !== null && setFromMonth(Number(v))}
                  style={{ flex: 1 }}
                  size="sm"
                />
                <Select
                  data={YEAR_OPTIONS}
                  value={String(fromYear)}
                  onChange={(v) => v !== null && setFromYear(Number(v))}
                  style={{ width: rem(90) }}
                  size="sm"
                />
              </Group>
            </Stack>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">To</Text>
              <Group gap="xs" wrap="nowrap">
                <Select
                  data={MONTH_OPTIONS}
                  value={String(toMonth)}
                  onChange={(v) => v !== null && setToMonth(Number(v))}
                  style={{ flex: 1 }}
                  size="sm"
                />
                <Select
                  data={YEAR_OPTIONS}
                  value={String(toYear)}
                  onChange={(v) => v !== null && setToYear(Number(v))}
                  style={{ width: rem(90) }}
                  size="sm"
                />
              </Group>
            </Stack>
          </Group>
          {!isRangeValid && (
            <Text size="xs" c="red">"From" date must be before or equal to "To" date</Text>
          )}

          <Divider />

          <Text fw={600} size="sm">Your Background</Text>
          <Textarea
            placeholder={`Tell the AI about yourself — e.g. "My wife and I share finances, we have a young child, we live in Singapore. We want to save more without cutting comfort. I earn SGD X/month, she earns SGD Y/month."`}
            value={userContext}
            onChange={(e) => setUserContext(e.currentTarget.value)}
            minRows={4}
            autosize
          />

          <Button
            leftSection={isAnalyzing ? <Loader size={14} color="white" /> : <Sparkles size={16} />}
            onClick={handleAnalyze}
            disabled={!isRangeValid || isAnalyzing || isChatting}
            loading={isAnalyzing}
            style={{ backgroundColor: '#1B4332', alignSelf: 'flex-start' }}
          >
            {isAnalyzing ? 'Analyzing…' : hasReport ? 'Re-analyze' : 'Analyze'}
          </Button>
        </Stack>
      </Card>

      {/* Report */}
      {(hasReport || isAnalyzing) && (
        <Card withBorder radius="md" p="md" ref={reportRef as any}>
          <Stack gap="sm">
            <Group gap="xs">
              <Sparkles size={16} style={{ color: '#1B4332' }} />
              <Text fw={600} size="sm">Analysis Report</Text>
            </Group>
            <TypographyStylesProvider>
              <Box
                style={{
                  fontSize: rem(14),
                  lineHeight: 1.7,
                  minHeight: isAnalyzing && !hasReport ? rem(60) : undefined
                }}
              >
                {isAnalyzing && !hasReport ? (
                  <Group gap="xs">
                    <Loader size={14} />
                    <Text size="sm" c="dimmed">Analyzing your finances…</Text>
                  </Group>
                ) : (
                  <ReactMarkdown>{report}</ReactMarkdown>
                )}
              </Box>
            </TypographyStylesProvider>
          </Stack>
        </Card>
      )}

      {/* Chat */}
      {hasReport && (
        <Card withBorder radius="md" p="md">
          <Stack gap="sm">
            <Text fw={600} size="sm">Follow-up Questions</Text>
            <Text size="xs" c="dimmed">Ask anything about your finances based on this analysis</Text>

            {messages.length > 0 && (
              <ScrollArea style={{ maxHeight: rem(400) }}>
                <Stack gap="sm" pb="xs">
                  {messages.map((msg, idx) => (
                    <Box key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <Paper
                        p="sm"
                        radius="md"
                        style={{
                          maxWidth: '80%',
                          backgroundColor: msg.role === 'user' ? '#1B4332' : '#f8f9fa',
                          color: msg.role === 'user' ? '#fff' : 'inherit'
                        }}
                      >
                        {msg.role === 'assistant' ? (
                          <TypographyStylesProvider>
                            <Box style={{ fontSize: rem(13), lineHeight: 1.6 }}>
                              {msg.content ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              ) : (
                                <Group gap="xs">
                                  <Loader size={12} />
                                  <Text size="xs" c="dimmed">Thinking…</Text>
                                </Group>
                              )}
                            </Box>
                          </TypographyStylesProvider>
                        ) : (
                          <Text size="sm">{msg.content}</Text>
                        )}
                      </Paper>
                    </Box>
                  ))}
                  <div ref={chatBottomRef} />
                </Stack>
              </ScrollArea>
            )}

            <Group gap="xs" align="flex-end">
              <Textarea
                placeholder="Ask a follow-up question…"
                value={chatInput}
                onChange={(e) => setChatInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                minRows={1}
                autosize
                maxRows={4}
                style={{ flex: 1 }}
                disabled={isChatting}
              />
              <ActionIcon
                size="lg"
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatting || isAnalyzing}
                loading={isChatting}
                style={{ backgroundColor: '#1B4332', color: '#fff', alignSelf: 'flex-end' }}
              >
                <SendHorizonal size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
