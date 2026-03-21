'use client'

import { TransactionForm } from '@/components/transactions/TransactionForm'
import { AccountForm } from '@/components/accounts/AccountForm'
import { BudgetForm } from '@/components/budgets/BudgetForm'

export function ModalProvider() {
  return (
    <>
      <TransactionForm />
      <AccountForm />
      <BudgetForm />
    </>
  )
}
