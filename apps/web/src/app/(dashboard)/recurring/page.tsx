'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react'

const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
]

const TYPES = [
  { value: 'INCOME', label: '↑ Income', color: 'text-green-400' },
  { value: 'EXPENSE', label: '↓ Expense', color: 'text-red-400' },
]

const CURRENCIES = ['COP', 'USD', 'EUR', 'GBP', 'BTC', 'ETH']

const emptyForm = {
  name: '',
  description: '',
  amount: '',
  currency: 'COP',
  type: 'EXPENSE',
  accountId: '',
  categoryId: '',
  frequency: 'MONTHLY',
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
  autoCreate: false,
}

function getBadgeColor(freq: string) {
  const map: Record<string, string> = {
    DAILY: 'bg-orange-500/20 text-orange-400',
    WEEKLY: 'bg-blue-500/20 text-blue-400',
    BIWEEKLY: 'bg-cyan-500/20 text-cyan-400',
    MONTHLY: 'bg-violet-500/20 text-violet-400',
    QUARTERLY: 'bg-pink-500/20 text-pink-400',
    YEARLY: 'bg-amber-500/20 text-amber-400',
  }
  return map[freq] ?? 'bg-muted text-muted-foreground'
}

export default function RecurringPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['recurring-rules'],
    queryFn: () => authApi.get('/recurring-rules').then((r) => r.data),
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts-list'],
    queryFn: () => authApi.get('/accounts').then((r) => r.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => authApi.get('/categories').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      authApi.post('/recurring-rules', {
        ...body,
        amount: parseFloat(body.amount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-rules'] })
      setShowForm(false)
      setForm(emptyForm)
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message ?? 'Failed to create rule')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      authApi.patch(`/recurring-rules/${id}`, { isActive: !isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring-rules'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.delete(`/recurring-rules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring-rules'] }),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.accountId) {
      setFormError('Please select an account')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Recurring Bills
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate rent, subscriptions and any periodic payment
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setFormError('')
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Rule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-primary/40 bg-card p-6 space-y-5">
          <h2 className="font-semibold text-foreground">New Recurring Rule</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Rule Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Netflix, Rent, Electricity…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Amount *</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency *</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {FREQUENCIES.map((fr) => (
                    <option key={fr.value} value={fr.value}>
                      {fr.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Account *</label>
                <select
                  value={form.accountId}
                  onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select account…</option>
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date *</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional note…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setForm((f) => ({ ...f, autoCreate: !f.autoCreate }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.autoCreate ? 'bg-primary' : 'bg-input'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.autoCreate ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-foreground">Auto-create transaction when due</span>
            </label>

            {formError && (
              <p className="text-sm text-destructive-foreground bg-destructive/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Creating…' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">No recurring rules yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first rule to automate recurring bills like rent or subscriptions.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create first rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule: any) => (
            <div
              key={rule.id}
              className={`rounded-xl border bg-card p-5 flex items-center gap-4 transition-opacity ${rule.isActive ? 'border-border' : 'border-border/40 opacity-60'}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${rule.type === 'INCOME' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                <RefreshCw className={`h-5 w-5 ${rule.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{rule.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeColor(rule.frequency)}`}>
                    {FREQUENCIES.find((f) => f.value === rule.frequency)?.label ?? rule.frequency}
                  </span>
                  {rule.autoCreate && (
                    <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-medium">
                      Auto
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span
                    className={`font-medium ${rule.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {rule.type === 'INCOME' ? '+' : '-'}
                    {Number(rule.amount).toLocaleString()} {rule.currency}
                  </span>
                  {rule.nextDueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Next: {new Date(rule.nextDueDate).toLocaleDateString()}
                    </span>
                  )}
                  {rule.category && (
                    <span>
                      {rule.category.icon ? `${rule.category.icon} ` : ''}
                      {rule.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleMutation.mutate({ id: rule.id, isActive: rule.isActive })}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title={rule.isActive ? 'Disable' : 'Enable'}
                >
                  {rule.isActive ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${rule.name}"?`)) deleteMutation.mutate(rule.id)
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
