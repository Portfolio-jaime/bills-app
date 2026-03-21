import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@bills/types'

export function useCategories(type?: 'INCOME' | 'EXPENSE' | 'BOTH') {
  return useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data } = await authApi.get('/categories', { params: type ? { type } : {} })
      return data
    },
  })
}

export function useAllCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await authApi.get('/categories')
      return data
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) => {
      const { data } = await authApi.post('/categories', dto)
      return data as Category
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCategoryDto }) => {
      const { data } = await authApi.patch(`/categories/${id}`, dto)
      return data as Category
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await authApi.delete(`/categories/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
