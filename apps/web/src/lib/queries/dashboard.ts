import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { DashboardSummary, MonthlyChartData, CategoryChartData } from '@bills/types'

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await authApi.get('/dashboard/summary')
      return data
    },
  })
}

export function useMonthlyChart() {
  return useQuery<MonthlyChartData[]>({
    queryKey: ['dashboard', 'chart', 'monthly'],
    queryFn: async () => {
      const { data } = await authApi.get('/dashboard/chart/monthly')
      return data
    },
  })
}

export function useCategoryChart(type: 'INCOME' | 'EXPENSE' = 'EXPENSE') {
  return useQuery<CategoryChartData[]>({
    queryKey: ['dashboard', 'chart', 'category', type],
    queryFn: async () => {
      const { data } = await authApi.get('/dashboard/chart/by-category', { params: { type } })
      return data
    },
  })
}
