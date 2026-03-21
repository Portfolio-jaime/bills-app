'use client'

import { useState } from 'react'
import { useCreateBudget } from '@/lib/queries/budgets'
import { useCategories } from '@/lib/queries/categories'
import { useUIStore } from '@/lib/store'
import { Button, Input } from '@bills/ui'
import type { CreateBudgetDto } from '@bills/types'
import { getCategoryIcon } from '@/lib/categoryIcons'
import { X } from 'lucide-react'

const PERIODS = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const
const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
}

const todayDateStr = () => new Date().toISOString().slice(0, 10)

export function BudgetForm() {
  const isOpen = useUIStore((s) => s.budgetFormOpen)
  const setOpen = useUIStore((s) => s.setBudgetFormOpen)
  const createMutation = useCreateBudget()
  const { data: categories = [] } = useCategories()

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH')

  const [form, setForm] = useState({
    categoryId: '',
    amount: '',
    period: 'MONTHLY' as typeof PERIODS[number],
    startDate: todayDateStr(),
    alertAt: '80',
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.categoryId) return setError('Please select a category.')
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError('Enter a valid budget amount greater than 0.')
    if (!form.startDate) return setError('Please select a start date.')

    const alertAt = parseInt(form.alertAt)
    if (isNaN(alertAt) || alertAt < 1 || alertAt > 100)
      return setError('Alert threshold must be between 1 and 100.')

    const dto: CreateBudgetDto = {
      categoryId: form.categoryId,
      amount: Number(form.amount),
      period: form.period,
      startDate: new Date(form.startDate).toISOString(),
      alertAt,
    }

    try {
      await createMutation.mutateAsync(dto)
      setOpen(false)
      setForm({ categoryId: '', amount: '', period: 'MONTHLY', startDate: todayDateStr(), alertAt: '80' })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create budget.')
    }
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Budget</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Category *</label>
            <select
              value={form.categoryId}
              onChange={set('categoryId')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select a category…</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryIcon(c)} {c.name}
                </option>
              ))}
            </select>
            {expenseCategories.length === 0 && (
              <p className="text-xs text-amber-400">
                No expense categories found. Create categories first in your account.
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Budget Amount *</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={set('amount')}
              placeholder="0.00"
              required
            />
          </div>

          {/* Period */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Period</label>
            <div className="flex rounded-lg overflow-hidden border border-border text-sm font-medium">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, period: p }))}
                  className={`flex-1 py-2 transition-colors ${
                    form.period === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Start Date *</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              required
            />
          </div>

          {/* Alert threshold */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">
              Alert at (% of budget used)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min="10"
                max="100"
                step="5"
                value={form.alertAt}
                onChange={set('alertAt')}
                className="flex-1 h-2 accent-indigo-500"
              />
              <span className="text-sm font-semibold text-foreground w-10 text-right">
                {form.alertAt}%
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 rounded-md px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
