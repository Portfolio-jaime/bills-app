'use client'

import { useDashboardSummary } from '@/lib/queries/dashboard'
import { Card, CardContent } from '@bills/ui'
import { formatCurrency } from '@bills/utils'
import type { Currency } from '@bills/types'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

export function SummaryCards() {
  const { data, isLoading } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const currency = (data.baseCurrency as Currency) ?? 'COP'

  const cards = [
    {
      label: 'Total Balance',
      value: formatCurrency(data.totalBalanceInBaseCurrency, currency),
      icon: Wallet,
      color: 'text-blue-400',
    },
    {
      label: 'Monthly Income',
      value: formatCurrency(data.monthlyIncome, currency),
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(data.monthlyExpenses, currency),
      icon: TrendingDown,
      color: 'text-rose-400',
    },
    {
      label: 'Monthly Savings',
      value: formatCurrency(data.monthlySavings, currency),
      icon: PiggyBank,
      color: data.monthlySavings >= 0 ? 'text-emerald-400' : 'text-rose-400',
      sub: `${data.savingsRate.toFixed(1)}% savings rate`,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, sub }) => (
        <Card key={label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
