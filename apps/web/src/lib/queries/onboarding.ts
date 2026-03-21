import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'

export interface OnboardingAccount {
  name: string
  type: string
  currency: string
  balance?: number
}

export interface OnboardingPayload {
  name: string
  baseCurrency: string
  monthlyIncome: number
  incomeSource: string
  housingCost: number
  foodBudget: number
  transportBudget: number
  healthBudget: number
  entertainmentBudget: number
  otherExpenses: number
  goals: string[]
  accounts: OnboardingAccount[]
  notes?: string
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async (payload: OnboardingPayload) => {
      const { data } = await authApi.post('/users/onboarding', payload)
      return data
    },
  })
}
