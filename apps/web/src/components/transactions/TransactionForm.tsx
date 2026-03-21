'use client'

import { useState } from 'react'
import { useCreateTransaction } from '@/lib/queries/transactions'
import { useAccounts } from '@/lib/queries/accounts'
import { useCategories } from '@/lib/queries/categories'
import { useUIStore } from '@/lib/store'
import { Button, Input } from '@bills/ui'
import { SUPPORTED_CURRENCIES } from '@bills/types'
import type { CreateTransactionDto } from '@bills/types'
import { getCategoryIcon } from '@/lib/categoryIcons'
import { X } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 16)

type TxType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export function TransactionForm() {
  const isOpen = useUIStore((s) => s.transactionFormOpen)
  const setOpen = useUIStore((s) => s.setTransactionFormOpen)

  const createMutation = useCreateTransaction()
  const { data: accounts = [] } = useAccounts()
  const [txType, setTxType] = useState<TxType>('EXPENSE')
  const { data: categories = [] } = useCategories()

  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'USD' as string,
    accountId: '',
    toAccountId: '',
    categoryId: '',
    date: today(),
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredCategories = categories.filter(
    (c) => c.type === 'BOTH' || c.type === txType,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.accountId) return setError('Please select an account.')
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError('Enter a valid amount greater than 0.')
    if (!form.date) return setError('Please select a date.')
    if (!form.description.trim()) return setError('Description is required.')

    const dto: CreateTransactionDto = {
      type: txType,
      amount: Number(form.amount),
      currency: form.currency as any,
      accountId: form.accountId,
      categoryId: form.categoryId || undefined,
      date: new Date(form.date).toISOString(),
      description: form.description.trim(),
      notes: form.notes || undefined,
      tags: [],
      isRecurring: false,
      ...(txType === 'TRANSFER' && form.toAccountId ? { toAccountId: form.toAccountId } : {}),
    }

    try {
      await createMutation.mutateAsync(dto)
      setOpen(false)
      setForm({ description: '', amount: '', currency: 'USD', accountId: '', toAccountId: '', categoryId: '', date: today(), notes: '' })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create transaction.')
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Transaction</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border text-sm font-medium">
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTxType(t); setForm((p) => ({ ...p, categoryId: '' })) }}
                className={`flex-1 py-2 transition-colors ${
                  txType === t
                    ? t === 'INCOME'
                      ? 'bg-emerald-600 text-white'
                      : t === 'EXPENSE'
                        ? 'bg-rose-600 text-white'
                        : 'bg-indigo-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {t === 'INCOME' ? '↑ Income' : t === 'EXPENSE' ? '↓ Expense' : '⇄ Transfer'}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Description *</label>
            <Input
              value={form.description}
              onChange={set('description')}
              placeholder="e.g. Grocery shopping"
              required
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Amount *</label>
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
            <div className="w-28 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Currency</label>
              <select
                value={form.currency}
                onChange={set('currency')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Date *</label>
            <Input
              type="datetime-local"
              value={form.date}
              onChange={set('date')}
              required
            />
          </div>

          {/* Account */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Account *</label>
            <select
              value={form.accountId}
              onChange={set('accountId')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
              ))}
            </select>
          </div>

          {/* To Account (Transfer only) */}
          {txType === 'TRANSFER' && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">To Account *</label>
              <select
                value={form.toAccountId}
                onChange={set('toAccountId')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select destination account…</option>
                {accounts
                  .filter((a) => a.id !== form.accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                  ))}
              </select>
            </div>
          )}

          {/* Category */}
          {txType !== 'TRANSFER' && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Category</label>
              <select
                value={form.categoryId}
                onChange={set('categoryId')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryIcon(c)} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Optional notes…"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 rounded-md px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving…' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
