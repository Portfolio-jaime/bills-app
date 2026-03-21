'use client'

import { useState } from 'react'
import { useCreateAccount } from '@/lib/queries/accounts'
import { useUIStore } from '@/lib/store'
import { Button, Input } from '@bills/ui'
import { SUPPORTED_CURRENCIES } from '@bills/types'
import type { CreateAccountDto } from '@bills/types'
import { X } from 'lucide-react'

const ACCOUNT_TYPES = ['BANK', 'CASH', 'INVESTMENT', 'CRYPTO', 'CREDIT_CARD'] as const
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: '🏦 Bank',
  CASH: '💵 Cash',
  INVESTMENT: '📈 Investment',
  CRYPTO: '₿ Crypto',
  CREDIT_CARD: '💳 Credit Card',
}

const PRESET_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

export function AccountForm() {
  const isOpen = useUIStore((s) => s.accountFormOpen)
  const setOpen = useUIStore((s) => s.setAccountFormOpen)
  const createMutation = useCreateAccount()

  const [form, setForm] = useState({
    name: '',
    type: 'BANK' as typeof ACCOUNT_TYPES[number],
    currency: 'USD' as string,
    balance: '0',
    color: '#6366f1',
    icon: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) return setError('Account name is required.')

    const dto: CreateAccountDto = {
      name: form.name.trim(),
      type: form.type,
      currency: form.currency as any,
      balance: Number(form.balance) || 0,
      color: form.color || undefined,
      icon: form.icon || undefined,
    }

    try {
      await createMutation.mutateAsync(dto)
      setOpen(false)
      setForm({ name: '', type: 'BANK', currency: 'USD', balance: '0', color: '#6366f1', icon: '' })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create account.')
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
          <h2 className="text-lg font-semibold text-foreground">Add Account</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Account Name *</label>
            <Input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Main Checking"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Account Type</label>
            <select
              value={form.type}
              onChange={set('type')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Currency + initial balance */}
          <div className="flex gap-2">
            <div className="w-32 space-y-1">
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
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Initial Balance</label>
              <Input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={set('balance')}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    form.color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={set('color')}
                className="h-7 w-7 rounded-full border border-border cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Icon (optional emoji) */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Icon (emoji, optional)</label>
            <Input
              value={form.icon}
              onChange={set('icon')}
              placeholder="e.g. 🏦"
              maxLength={10}
            />
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
              {createMutation.isPending ? 'Saving…' : 'Save Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
