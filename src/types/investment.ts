import { InstaQLEntity } from '@instantdb/react'
import { schema } from '@/stores/instantdb'

export type Investment = InstaQLEntity<typeof schema, 'investments'>
export type InvestmentContribution = InstaQLEntity<typeof schema, 'investmentContributions'>
export type InvestmentValue = InstaQLEntity<typeof schema, 'investmentValues'>
