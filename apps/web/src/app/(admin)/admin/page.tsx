'use client'

import { useAdminStats } from '@/lib/queries/admin'
import { Users, ArrowLeftRight, Wallet, PieChart, RefreshCw, Tag, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const countMeta = [
  { key: 'users', label: 'Users', icon: Users, href: '/admin/users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '/admin/transactions', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'accounts', label: 'Accounts', icon: Wallet, href: '/admin/database?table=account', color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'budgets', label: 'Budgets', icon: PieChart, href: '/admin/database?table=budget', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { key: 'categories', label: 'Categories', icon: Tag, href: '/admin/database?table=category', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { key: 'recurringRules', label: 'Recurring Rules', icon: RefreshCw, href: '/admin/database?table=recurringRule', color: 'text-orange-500', bg: 'bg-orange-500/10' },
]

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide statistics and recent activity</p>
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {countMeta.map(({ key, label, icon: Icon, href, color, bg }) => (
          <Link
            key={key}
            href={href}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2 hover:border-orange-500/50 transition-colors"
          >
            <div className={`${bg} ${color} w-8 h-8 rounded-lg flex items-center justify-center`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : (data?.counts[key] ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-foreground">Total Income</span>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {isLoading ? '—' : formatCurrency(data?.totals.income ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time across all users</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-rose-500" />
            <span className="font-semibold text-foreground">Total Expense</span>
          </div>
          <p className="text-3xl font-bold text-rose-500">
            {isLoading ? '—' : formatCurrency(data?.totals.expense ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time across all users</p>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Users</h2>
          <Link href="/admin/users" className="text-xs text-orange-500 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))
            : data?.recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold">
                    {(u.name ?? u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${u.onboardingCompleted ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      {u.onboardingCompleted ? 'Active' : 'Onboarding'}
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  )
}
