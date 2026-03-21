'use client'

import { useState } from 'react'
import { useTransactions, useDeleteTransaction } from '@/lib/queries/transactions'
import { useCategories } from '@/lib/queries/categories'
import { useAccounts } from '@/lib/queries/accounts'
import { Badge, Button, Input } from '@bills/ui'
import { formatCurrency, formatDate } from '@bills/utils'
import type { Currency, Transaction } from '@bills/types'
import { Trash2, ChevronLeft, ChevronRight, Pencil, Search, X } from 'lucide-react'
import { useUIStore } from '@/lib/store'

type TxType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | ''

function groupByDate(txs: Transaction[]): Array<{ dateLabel: string; items: Transaction[] }> {
  const map = new Map<string, Transaction[]>()
  for (const tx of txs) {
    const label = new Date(tx.date).toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(tx)
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }))
}

export function TransactionList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TxType>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')

  const { data, isLoading } = useTransactions({
    page,
    limit: 30,
    search: search || undefined,
    type: typeFilter || undefined,
    from: from || undefined,
    to: to || undefined,
    categoryId: categoryId || undefined,
    accountId: accountId || undefined,
  })

  const deleteMutation = useDeleteTransaction()
  const setFormOpen = useUIStore((s) => s.setTransactionFormOpen)
  const setEditing = useUIStore((s) => s.setEditingTransaction)

  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()

  const hasFilters = !!(search || typeFilter || from || to || categoryId || accountId)

  const clearFilters = () => {
    setSearch(''); setTypeFilter(''); setFrom(''); setTo('')
    setCategoryId(''); setAccountId(''); setPage(1)
  }

  const totalIncome = data?.data.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalExpenses = data?.data.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const grouped = data?.data ? groupByDate(data.data as unknown as Transaction[]) : []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar…" className="pl-9 h-9 w-48 text-sm" />
          </div>
          {/* Type */}
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as TxType); setPage(1) }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Todos los tipos</option>
            <option value="EXPENSE">Gastos</option>
            <option value="INCOME">Ingresos</option>
            <option value="TRANSFER">Transferencias</option>
          </select>
          {/* Category */}
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          {/* Account */}
          <select value={accountId} onChange={(e) => { setAccountId(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Todas las cuentas</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {/* Date range */}
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          {hasFilters && (
            <button onClick={clearFilters} className="h-9 px-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors">
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
        </div>
        <Button onClick={() => setFormOpen(true)} className="h-9 text-sm">+ Nueva transacción</Button>
      </div>

      {/* Totals strip */}
      {data && data.data.length > 0 && (
        <div className="flex gap-4 text-sm px-1">
          <span className="text-emerald-400 font-medium">
            ↑ {formatCurrency(totalIncome, 'USD' as Currency)} ingresos
          </span>
          <span className="text-rose-400 font-medium">
            ↓ {formatCurrency(totalExpenses, 'USD' as Currency)} gastos
          </span>
          <span className="text-muted-foreground">
            {data.total} transacciones
          </span>
        </div>
      )}

      {/* Grouped table */}
      <div className="space-y-4">
        {grouped.map(({ dateLabel, items }) => (
          <div key={dateLabel}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1 capitalize">
              {dateLabel}
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {items.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {tx.category ? (
                          <span className="text-muted-foreground text-xs">
                            {tx.category.icon} {tx.category.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {tx.account && (
                          <span className="text-xs text-muted-foreground">{tx.account.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.type === 'INCOME' ? 'income' : tx.type === 'EXPENSE' ? 'expense' : 'transfer'}>
                          {tx.type === 'INCOME' ? '↑' : tx.type === 'EXPENSE' ? '↓' : '⇄'}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-blue-400'
                      }`}>
                        {tx.type === 'EXPENSE' ? '-' : '+'}
                        {formatCurrency(Number(tx.amount), tx.currency as Currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setEditing(tx)}
                            className="text-muted-foreground hover:text-indigo-400 transition-colors" aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { if (confirm('¿Eliminar esta transacción?')) deleteMutation.mutate(tx.id) }}
                            className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {(!data?.data || data.data.length === 0) && (
          <div className="rounded-lg border border-border py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">{hasFilters ? 'No hay transacciones con esos filtros.' : 'No hay transacciones aún. ¡Agrega la primera!'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {data.page} de {data.totalPages} ({data.total} total)</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
