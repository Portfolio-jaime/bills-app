'use client'

import { useState } from 'react'
import { useAdminTransactions } from '@/lib/queries/admin'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
}

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminTransactions(page)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data ? `${data.total.toLocaleString()} total transactions` : 'Loading...'}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[200px]">{t.description}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        t.type === 'INCOME'
                          ? 'bg-green-500/10 text-green-600'
                          : t.type === 'EXPENSE'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${t.user.id}`} className="text-orange-500 hover:underline text-xs">
                        {t.user.name ?? t.user.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.account.name} ({t.account.currency})</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums text-sm ${
                      t.type === 'INCOME' ? 'text-green-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount), t.account.currency)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {data.page} of {data.pages} ({data.total.toLocaleString()} total)
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
