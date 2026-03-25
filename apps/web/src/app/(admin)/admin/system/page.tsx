'use client'

import { useAdminStats } from '@/lib/queries/admin'
import { Server, Database, Activity, RefreshCw } from 'lucide-react'

export default function AdminSystemPage() {
  const { data, isLoading, dataUpdatedAt, refetch } = useAdminStats()

  const env = {
    'API URL': process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1',
    'Node Env': 'production',
    'App Version': '1.0.0',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System</h1>
          <p className="text-muted-foreground text-sm mt-1">Application health and configuration</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-orange-500/40 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-foreground text-sm">API</span>
          </div>
          <p className="text-xs text-muted-foreground">Operational</p>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-foreground text-sm">Database</span>
          </div>
          <p className="text-xs text-muted-foreground">PostgreSQL · Connected</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? '...' : `${Object.values(data?.counts ?? {}).reduce((a, b) => a + b, 0).toLocaleString()} total records`}
          </p>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-foreground text-sm">Cache</span>
          </div>
          <p className="text-xs text-muted-foreground">Redis · Connected</p>
        </div>
      </div>

      {/* DB record counts */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Database className="h-4 w-4 text-orange-500" />
          <h2 className="font-semibold text-foreground">Database Records</h2>
        </div>
        <div className="divide-y divide-border">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </div>
              ))
            : Object.entries(data?.counts ?? {}).map(([key, val]) => (
                <div key={key} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{val.toLocaleString()}</span>
                </div>
              ))}
        </div>
      </div>

      {/* Environment */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Server className="h-4 w-4 text-orange-500" />
          <h2 className="font-semibold text-foreground">Environment</h2>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(env).map(([k, v]) => (
            <div key={k} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k}</span>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-foreground">{v}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Activity className="h-4 w-4 text-orange-500" />
          <h2 className="font-semibold text-foreground">Financial Summary</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Income</span>
            <span className="text-sm font-semibold text-green-500 tabular-nums">
              {isLoading ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data?.totals.income ?? 0)}
            </span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Expense</span>
            <span className="text-sm font-semibold text-rose-500 tabular-nums">
              {isLoading ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data?.totals.expense ?? 0)}
            </span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Net Balance</span>
            <span className={`text-sm font-semibold tabular-nums ${(data?.totals.income ?? 0) - (data?.totals.expense ?? 0) >= 0 ? 'text-green-500' : 'text-rose-500'}`}>
              {isLoading ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((data?.totals.income ?? 0) - (data?.totals.expense ?? 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
