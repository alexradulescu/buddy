import { db, id } from './instantdb'
import { Investment, InvestmentContribution, InvestmentValue } from '@/types/investment'

export function useInvestmentStore() {
  const query = db.useQuery({
    investments: {},
    investmentContributions: {},
    investmentValues: {}
  })

  // Investment CRUD
  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    await db.transact([
      db.tx.investments[id()].update({
        ...investment
      })
    ])
  }

  const updateInvestment = async (investmentId: string, updates: Partial<Investment>) => {
    await db.transact([db.tx.investments[investmentId].update(updates)])
  }

  const deleteInvestment = async (investmentId: string) => {
    await db.transact([db.tx.investments[investmentId].delete()])
  }

  // Contribution CRUD
  const addContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
    await db.transact([
      db.tx.investmentContributions[id()].update({
        ...contribution
      })
    ])
  }

  const updateContribution = async (contributionId: string, updates: Partial<InvestmentContribution>) => {
    await db.transact([db.tx.investmentContributions[contributionId].update(updates)])
  }

  const deleteContribution = async (contributionId: string) => {
    await db.transact([db.tx.investmentContributions[contributionId].delete()])
  }

  // Value CRUD
  const addValue = async (value: Omit<InvestmentValue, 'id'>) => {
    await db.transact([
      db.tx.investmentValues[id()].update({
        ...value
      })
    ])
  }

  const updateValue = async (valueId: string, updates: Partial<InvestmentValue>) => {
    await db.transact([db.tx.investmentValues[valueId].update(updates)])
  }

  const deleteValue = async (valueId: string) => {
    await db.transact([db.tx.investmentValues[valueId].delete()])
  }

  // Helper functions
  const getInvestmentContributions = (investmentId: string) => {
    return (query.data?.investmentContributions || []).filter(
      (contribution) => contribution.investmentId === investmentId
    )
  }

  const getInvestmentValues = (investmentId: string) => {
    return (query.data?.investmentValues || []).filter(
      (value) => value.investmentId === investmentId
    )
  }

  const getTotalContributions = (investmentId: string) => {
    return getInvestmentContributions(investmentId).reduce(
      (total, contribution) => total + contribution.amount,
      0
    )
  }

  const getLatestValue = (investmentId: string) => {
    const values = getInvestmentValues(investmentId)
    if (values.length === 0) return null
    
    // Sort by date descending and return the latest value
    return [...values]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
  }

  return {
    investments: query.data?.investments || [],
    investmentContributions: query.data?.investmentContributions || [],
    investmentValues: query.data?.investmentValues || [],
    
    // Investment methods
    addInvestment,
    updateInvestment,
    deleteInvestment,
    
    // Contribution methods
    addContribution,
    updateContribution,
    deleteContribution,
    
    // Value methods
    addValue,
    updateValue,
    deleteValue,
    
    // Helper methods
    getInvestmentContributions,
    getInvestmentValues,
    getTotalContributions,
    getLatestValue
  }
}
