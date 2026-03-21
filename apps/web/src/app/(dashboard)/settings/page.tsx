'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { authApi } from '@/lib/api'

const CURRENCIES = ['COP', 'USD', 'EUR', 'GBP', 'BTC', 'ETH', 'ARS', 'MXN', 'BRL', 'CLP']

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    baseCurrency: 'COP',
    avatar: '',
  })

  // Load current profile
  useEffect(() => {
    authApi.get('/users/me').then(({ data }) => {
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        bio: data.bio ?? '',
        baseCurrency: data.baseCurrency ?? 'COP',
        avatar: data.avatar ?? '',
      })
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const payload: Record<string, string> = {}
      if (form.name) payload.name = form.name
      if (form.phone) payload.phone = form.phone
      if (form.bio) payload.bio = form.bio
      if (form.baseCurrency) payload.baseCurrency = form.baseCurrency
      if (form.avatar) payload.avatar = form.avatar

      await authApi.patch('/users/me', payload)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
            {form.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {(form.name || (session?.user?.email ?? 'U'))[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Avatar URL</label>
            <input
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jaime Henao"
              maxLength={100}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+57 300 000 0000"
              maxLength={30}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email <span className="text-muted-foreground font-normal">(cannot be changed)</span>
          </label>
          <input
            type="email"
            value={session?.user?.email ?? ''}
            disabled
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="A short description about yourself..."
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/500</p>
        </div>

        {/* Base currency */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Base Currency</label>
          <select
            value={form.baseCurrency}
            onChange={(e) => setForm((f) => ({ ...f, baseCurrency: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            All account balances are converted to this currency in the dashboard.
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-lg bg-destructive/20 border border-destructive/50 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-500/20 border border-green-500/40 px-4 py-3 text-sm text-green-400">
            ✓ Profile updated successfully
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
