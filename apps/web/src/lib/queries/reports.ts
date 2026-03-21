import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'

export interface DailyData {
  day: number
  income: number
  expenses: number
}

export interface CategoryBreakdown {
  categoryId: string | null
  categoryName: string
  color: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface TopTransaction {
  id: string
  description: string
  amount: number
  date: string
  category: { name: string; icon: string; color: string } | null
}

export interface MonthlyReport {
  year: number
  month: number
  baseCurrency: string
  income: number
  expenses: number
  savings: number
  savingsRate: number
  prevIncome: number
  prevExpenses: number
  incomeDelta: number | null
  expensesDelta: number | null
  dailyData: DailyData[]
  categoryBreakdown: CategoryBreakdown[]
  topTransactions: TopTransaction[]
}

export function useMonthlyReport(year: number, month: number) {
  return useQuery<MonthlyReport>({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: async () => {
      const { data } = await authApi.get('/dashboard/reports', { params: { year, month } })
      return data
    },
  })
}
