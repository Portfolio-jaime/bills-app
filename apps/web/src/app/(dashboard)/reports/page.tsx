'use client'

import { useState } from 'react'
import { useMonthlyReport } from '@/lib/queries/reports'
import { formatCurrency } from '@bills/utils'
import type { Currency } from '@bills/types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight,
  BarChart3, Target, ShoppingBag,
} from 'lucide-react'
import { Button } from '@bills/ui'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-xs text-muted-foreground">—</span>
  const up = delta > 0
  const Icon = delta === 0 ? Minus : up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-rose-400' : 'text-emerald-400'}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(delta)}%
    </span>
  )
}

function SummaryCard({ label, value, currency, delta, color, icon }: {
  label: string; value: number; currency: string
  delta?: number | null; color: string; icon: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border ${color} bg-card p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">
        {formatCurrency(value, currency as Currency)}
      </p>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DeltaBadge delta={delta ?? null} />
          <span>vs mes anterior</span>
        </div>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data, isLoading } = useMonthlyReport(year, month)

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
    if (isCurrentMonth) return
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground text-sm mt-1">Análisis detallado de tus finanzas</p>
        </div>
        {/* Month picker */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse bg-muted rounded-xl" />)}
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Ingresos" value={data.income} currency={data.baseCurrency}
              delta={data.incomeDelta} color="border-emerald-500/20"
              icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} />
            <SummaryCard label="Gastos" value={data.expenses} currency={data.baseCurrency}
              delta={data.expensesDelta} color="border-rose-500/20"
              icon={<TrendingDown className="h-5 w-5 text-rose-400" />} />
            <SummaryCard label="Ahorro" value={data.savings} currency={data.baseCurrency}
              color={data.savings >= 0 ? 'border-indigo-500/20' : 'border-amber-500/20'}
              icon={<Target className="h-5 w-5 text-indigo-400" />} />
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tasa de ahorro</span>
                <BarChart3 className="h-5 w-5 text-indigo-400 opacity-60" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {data.savingsRate >= 0 ? data.savingsRate : 0}%
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${data.savingsRate >= 20 ? 'bg-emerald-500' : data.savingsRate >= 10 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, data.savingsRate))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Meta: 20%</p>
            </div>
          </div>

          {/* Daily spending chart */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Actividad diaria — {MONTH_NAMES[month - 1]} {year}
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.dailyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [formatCurrency(value, data.baseCurrency as Currency), name === 'expenses' ? 'Gastos' : 'Ingresos']}
                />
                <Bar dataKey="income" name="income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category breakdown */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Gastos por categoría
              </h2>
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin datos este mes.</p>
              ) : (
                <div className="space-y-3">
                  {data.categoryBreakdown.slice(0, 8).map((cat) => (
                    <div key={cat.categoryId ?? 'uncategorized'} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{cat.categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{cat.percentage}%</span>
                          <span className="font-medium text-foreground tabular-nums">
                            {formatCurrency(cat.amount, data.baseCurrency as Currency)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top transactions */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-400" />
                Top 5 gastos del mes
              </h2>
              {data.topTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin gastos este mes.</p>
              ) : (
                <div className="space-y-2">
                  {data.topTransactions.map((tx, i) => (
                    <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <span className="text-lg font-bold text-muted-foreground/40 w-5 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category ? `${tx.category.icon} ${tx.category.name}` : 'Sin categoría'}
                          {' · '}
                          {new Date(tx.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-rose-400 tabular-nums">
                        {formatCurrency(tx.amount, data.baseCurrency as Currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">No se pudo cargar el reporte.</p>
      )}
    </div>
  )
}
