'use client'

import { useEffect, useRef } from 'react'
import { useBudgetStatus } from '@/lib/queries/budgets'

export function BudgetAlerts() {
  const { data: budgets } = useBudgetStatus()
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!budgets) return

    for (const b of budgets) {
      if (shownRef.current.has(b.budgetId)) continue

      const pct = b.percentage ?? 0
      if (pct >= 100) {
        shownRef.current.add(b.budgetId)
        const key = `budget-alert-${b.budgetId}-${new Date().toISOString().slice(0, 7)}`
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1')
          showToast(`🚨 Presupuesto agotado: ${b.categoryName} (${Math.round(pct)}%)`, 'error')
        }
      } else if (pct >= 80) {
        shownRef.current.add(b.budgetId)
        const key = `budget-warn-${b.budgetId}-${new Date().toISOString().slice(0, 7)}`
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1')
          showToast(`⚠️ Presupuesto al ${Math.round(pct)}%: ${b.categoryName}`, 'warning')
        }
      }
    }
  }, [budgets])

  return null
}

function showToast(message: string, type: 'error' | 'warning') {
  const toast = document.createElement('div')
  toast.className = [
    'fixed bottom-4 right-4 z-[9999] max-w-xs px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white',
    'animate-in slide-in-from-bottom-4 duration-300',
    type === 'error' ? 'bg-rose-600' : 'bg-amber-600',
  ].join(' ')
  toast.textContent = message

  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.5s'
    setTimeout(() => toast.remove(), 500)
  }, 5000)
}
