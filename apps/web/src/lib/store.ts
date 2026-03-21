import { create } from 'zustand'
import type { Transaction } from '@bills/types'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  transactionFormOpen: boolean
  setTransactionFormOpen: (open: boolean) => void
  editingTransaction: Transaction | null
  setEditingTransaction: (tx: Transaction | null) => void
  accountFormOpen: boolean
  setAccountFormOpen: (open: boolean) => void
  budgetFormOpen: boolean
  setBudgetFormOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  transactionFormOpen: false,
  setTransactionFormOpen: (open) => set({ transactionFormOpen: open }),
  editingTransaction: null,
  setEditingTransaction: (tx) => set({ editingTransaction: tx, transactionFormOpen: tx !== null }),
  accountFormOpen: false,
  setAccountFormOpen: (open) => set({ accountFormOpen: open }),
  budgetFormOpen: false,
  setBudgetFormOpen: (open) => set({ budgetFormOpen: open }),
}))
