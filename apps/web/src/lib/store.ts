import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  transactionFormOpen: boolean
  setTransactionFormOpen: (open: boolean) => void
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
  accountFormOpen: false,
  setAccountFormOpen: (open) => set({ accountFormOpen: open }),
  budgetFormOpen: false,
  setBudgetFormOpen: (open) => set({ budgetFormOpen: open }),
}))
