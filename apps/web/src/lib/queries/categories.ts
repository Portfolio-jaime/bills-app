import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { Category } from '@bills/types'

export function useCategories(type?: 'INCOME' | 'EXPENSE' | 'BOTH') {
  return useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data } = await authApi.get('/categories', { params: type ? { type } : {} })
      return data
    },
  })
}
