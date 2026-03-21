import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  transactionFormOpen: boolean
  setTransactionFormOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  transactionFormOpen: false,
  setTransactionFormOpen: (open) => set({ transactionFormOpen: open }),
}))
