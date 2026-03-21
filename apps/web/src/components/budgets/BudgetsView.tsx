'use client'

import { useBudgetStatus } from '@/lib/queries/budgets'
import { Card, CardContent, CardHeader, CardTitle } from '@bills/ui'
import { clamp } from '@bills/utils'

export function BudgetsView() {
  const { data, isLoading } = useBudgetStatus()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No active budgets. Create your first budget to track spending limits.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((b) => {
        const pct = clamp(b.percentage, 0, 100)
        const barColor = b.isOverBudget ? 'bg-rose-500' : b.isAlertTriggered ? 'bg-amber-500' : 'bg-emerald-500'
        const textColor = b.isOverBudget ? 'text-rose-400' : b.isAlertTriggered ? 'text-amber-400' : 'text-emerald-400'

        return (
          <Card key={b.budgetId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {b.categoryIcon && <span>{b.categoryIcon}</span>}
                {b.categoryName}
                <span className="ml-auto text-xs text-muted-foreground">{b.period}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className={`text-2xl font-bold ${textColor}`}>{b.spent.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">of {b.amount.toFixed(0)} budget</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${textColor}`}>{b.percentage}%</p>
                  {b.isOverBudget && (
                    <p className="text-xs text-rose-400">Over by {(b.spent - b.amount).toFixed(0)}</p>
                  )}
                  {!b.isOverBudget && (
                    <p className="text-xs text-muted-foreground">{b.remaining.toFixed(0)} remaining</p>
                  )}
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
