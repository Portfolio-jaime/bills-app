import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { BudgetStatus } from '@bills/types'

export function useBudgetStatus() {
  return useQuery<BudgetStatus[]>({
    queryKey: ['budgets', 'status'],
    queryFn: async () => {
      const { data } = await authApi.get('/budgets/status')
      return data
    },
  })
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await authApi.get('/budgets')
      return data
    },
  })
}
