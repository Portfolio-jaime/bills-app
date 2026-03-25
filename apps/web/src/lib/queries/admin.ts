import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/stats')
      return data as {
        counts: Record<string, number>
        totals: { income: number; expense: number }
        recentUsers: Array<{ id: string; email: string; name: string | null; createdAt: string; onboardingCompleted: boolean }>
      }
    },
    refetchInterval: 30_000,
  })
}

export function useAdminUsers(page = 1, search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/users', { params: { page, limit: 20, search } })
      return data as {
        data: Array<{
          id: string; email: string; name: string | null
          baseCurrency: string; onboardingCompleted: boolean
          createdAt: string
          _count: { accounts: number; transactions: number; budgets: number }
        }>
        total: number; page: number; pages: number
      }
    },
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => {
      const { data } = await authApi.get(`/admin/users/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminTransactions(page = 1) {
  return useQuery({
    queryKey: ['admin', 'transactions', page],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/transactions', { params: { page, limit: 25 } })
      return data as {
        data: Array<{
          id: string; description: string; amount: number; type: string
          date: string
          user: { id: string; email: string; name: string | null }
          account: { name: string; currency: string }
          category: { name: string; icon: string } | null
        }>
        total: number; page: number; pages: number
      }
    },
  })
}

export function useAdminTable(table: string, page = 1) {
  return useQuery({
    queryKey: ['admin', 'db', table, page],
    queryFn: async () => {
      const { data } = await authApi.get(`/admin/db/${table}`, { params: { page, limit: 20 } })
      return data as { data: Record<string, unknown>[]; total: number; table: string; page: number; pages: number }
    },
    enabled: !!table,
  })
}
