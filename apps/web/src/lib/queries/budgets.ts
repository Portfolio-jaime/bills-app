import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { BudgetStatus, CreateBudgetDto } from '@bills/types'

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

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateBudgetDto) => {
      const { data } = await authApi.post('/budgets', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}
