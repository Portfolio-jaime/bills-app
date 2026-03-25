'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAdminTable } from '@/lib/queries/admin'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TABLES = [
  { key: 'user', label: 'Users' },
  { key: 'account', label: 'Accounts' },
  { key: 'transaction', label: 'Transactions' },
  { key: 'category', label: 'Categories' },
  { key: 'budget', label: 'Budgets' },
  { key: 'recurringRule', label: 'Recurring Rules' },
  { key: 'exchangeRate', label: 'Exchange Rates' },
  { key: 'financialPlan', label: 'Financial Plans' },
]

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground/50 italic text-xs">null</span>
  if (typeof value === 'boolean') return <span className={value ? 'text-green-500' : 'text-rose-500'}>{String(value)}</span>
  if (typeof value === 'object') return <span className="text-blue-400 text-xs font-mono">{JSON.stringify(value)}</span>
  const s = String(value)
  if (s.length > 60) return <span className="text-xs font-mono" title={s}>{s.slice(0, 60)}…</span>
  return <span className="font-mono text-xs">{s}</span>
}

export default function AdminDatabasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('table') ?? 'user'
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAdminTable(tableParam, page)

  const setTable = (t: string) => {
    setPage(1)
    router.push(`/admin/database?table=${t}`)
  }

  const columns = data?.data.length ? Object.keys(data.data[0]) : []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Database Browser</h1>
        <p className="text-muted-foreground text-sm mt-1">Read-only view of all database tables</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABLES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTable(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tableParam === key
                ? 'bg-orange-500 text-white'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-orange-500/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-foreground text-sm capitalize">{tableParam}</p>
          {data && <p className="text-xs text-muted-foreground">{data.total.toLocaleString()} records</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <th key={i} className="px-4 py-3 text-left">
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                      </th>
                    ))
                  : columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        {col}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-2.5">
                          <div className="h-3 bg-muted animate-pulse rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((row, i) => (
                    <tr key={i} className="hover:bg-accent/30 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-foreground">
                          <CellValue value={row[col]} />
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {data.page} of {data.pages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="p-1.5 rounded-md border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
