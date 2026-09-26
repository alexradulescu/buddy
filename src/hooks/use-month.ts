import { parseAsInteger, useQueryState } from 'nuqs'

const now = new Date()

// month is 0-based (January = 0)
export function useMonth() {
  const [year, setYear] = useQueryState('year', parseAsInteger.withDefault(now.getFullYear()))
  const [month, setMonth] = useQueryState('month', parseAsInteger.withDefault(now.getMonth()))
  return { year, month, setYear, setMonth }
}
