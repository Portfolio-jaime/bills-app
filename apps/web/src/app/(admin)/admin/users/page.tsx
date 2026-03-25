'use client'

import { useState } from 'react'
import { useAdminUsers, useDeleteUser } from '@/lib/queries/admin'
import Link from 'next/link'
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { data, isLoading } = useAdminUsers(page, debouncedSearch || undefined)
  const deleteUser = useDeleteUser()

  const handleSearch = (v: string) => {
    setSearch(v)
    clearTimeout((window as any).__adminSearchTimer)
    ;(window as any).__adminSearchTimer = setTimeout(() => {
      setDebouncedSearch(v)
      setPage(1)
    }, 400)
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}? This will remove all their data permanently.`)) return
    await deleteUser.mutateAsync(id)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data ? `${data.total.toLocaleString()} total users` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Currency</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accounts</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transactions</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.name ?? u.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[160px]">{u.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.baseCurrency}</td>
                    <td className="px-4 py-3 tabular-nums">{u._count.accounts}</td>
                    <td className="px-4 py-3 tabular-nums">{u._count.transactions}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${u.onboardingCompleted ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        {u.onboardingCompleted ? 'Active' : 'Onboarding'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
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
