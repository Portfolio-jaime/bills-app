'use client'

import { useAdminUser } from '@/lib/queries/admin'
import Link from 'next/link'
import { ChevronLeft, Mail, Calendar, Globe, Wallet, ArrowLeftRight, PieChart } from 'lucide-react'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { data: user, isLoading } = useAdminUser(params.id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (!user) return <p className="text-muted-foreground">User not found</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name ?? user.email}</h1>
          <p className="text-muted-foreground text-sm">User detail</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="text-sm font-medium text-foreground">{user.baseCurrency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-sm font-medium text-foreground">{formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user.onboardingCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-foreground">{user.onboardingCompleted ? 'Active' : 'Onboarding'}</p>
          </div>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Accounts', value: user._count.accounts, icon: Wallet },
          { label: 'Transactions', value: user._count.transactions, icon: ArrowLeftRight },
          { label: 'Budgets', value: user._count.budgets, icon: PieChart },
          { label: 'Recurring Rules', value: user._count.recurringRules, icon: ArrowLeftRight },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Accounts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Accounts</h2>
          </div>
          <div className="divide-y divide-border">
            {user.accounts.length === 0
              ? <p className="px-4 py-4 text-sm text-muted-foreground">No accounts</p>
              : user.accounts.map((a: any) => (
                  <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.type}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(Number(a.balance), a.currency)}
                    </p>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-border">
            {user.transactions.length === 0
              ? <p className="px-4 py-4 text-sm text-muted-foreground">No transactions</p>
              : user.transactions.map((t: any) => (
                  <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate max-w-[180px]">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-sm font-semibold tabular-nums ${t.type === 'INCOME' ? 'text-green-500' : 'text-rose-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}
