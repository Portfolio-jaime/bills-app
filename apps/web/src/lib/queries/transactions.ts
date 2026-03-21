import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { Transaction, PaginatedTransactions, CreateTransactionDto, UpdateTransactionDto } from '@bills/types'

interface TransactionQueryParams {
  page?: number
  limit?: number
  from?: string
  to?: string
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId?: string
  accountId?: string
  search?: string
}

export function useTransactions(params: TransactionQueryParams = {}) {
  return useQuery<PaginatedTransactions>({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await authApi.get('/transactions', { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateTransactionDto) => {
      const { data } = await authApi.post('/transactions', dto)
      return data as Transaction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateTransactionDto }) => {
      const { data } = await authApi.patch(`/transactions/${id}`, dto)
      return data as Transaction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await authApi.delete(`/transactions/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
