'use client'

import { useState } from 'react'
import { useTransactions, useDeleteTransaction } from '@/lib/queries/transactions'
import { Badge, Button } from '@bills/ui'
import { formatCurrency, formatDate } from '@bills/utils'
import type { Currency } from '@bills/types'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/lib/store'

export function TransactionList() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTransactions({ page, limit: 20 })
  const deleteMutation = useDeleteTransaction()
  const setFormOpen = useUIStore((s) => s.setTransactionFormOpen)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>+ New Transaction</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.data.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                  {tx.description}
                </td>
                <td className="px-4 py-3">
                  {(tx as any).category ? (
                    <span className="text-muted-foreground">
                      {(tx as any).category.icon} {(tx as any).category.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      tx.type === 'INCOME'
                        ? 'income'
                        : tx.type === 'EXPENSE'
                          ? 'expense'
                          : 'transfer'
                    }
                  >
                    {tx.type}
                  </Badge>
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold tabular-nums ${
                    tx.type === 'INCOME'
                      ? 'text-emerald-400'
                      : tx.type === 'EXPENSE'
                        ? 'text-rose-400'
                        : 'text-blue-400'
                  }`}
                >
                  {tx.type === 'EXPENSE' ? '-' : '+'}
                  {formatCurrency(Number(tx.amount), tx.currency as Currency)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      if (confirm('Delete this transaction?')) {
                        deleteMutation.mutate(tx.id)
                      }
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No transactions yet. Add your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
