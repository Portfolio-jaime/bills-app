'use client'

import { useBudgetStatus } from '@/lib/queries/budgets'
import { Card, CardContent, CardHeader, CardTitle } from '@bills/ui'
import { clamp } from '@bills/utils'

export function BudgetProgressList() {
  const { data, isLoading } = useBudgetStatus()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget Status — This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((b) => {
            const pct = clamp(b.percentage, 0, 100)
            const barColor = b.isOverBudget
              ? 'bg-rose-500'
              : b.isAlertTriggered
                ? 'bg-amber-500'
                : 'bg-emerald-500'

            return (
              <div key={b.budgetId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5">
                    {b.categoryIcon && <span>{b.categoryIcon}</span>}
                    <span className="font-medium text-foreground">{b.categoryName}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {b.spent.toFixed(0)} / {b.amount.toFixed(0)}{' '}
                    <span className={b.isOverBudget ? 'text-rose-400' : 'text-muted-foreground'}>
                      ({b.percentage}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
