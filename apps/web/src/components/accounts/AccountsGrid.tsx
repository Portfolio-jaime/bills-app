'use client'

import { useAccounts } from '@/lib/queries/accounts'
import { useUIStore } from '@/lib/store'
import { Card, CardContent, Button } from '@bills/ui'
import { formatCurrency } from '@bills/utils'
import type { Currency } from '@bills/types'
import { Banknote, CreditCard, TrendingUp, Coins, Wallet, Plus, LucideProps } from 'lucide-react'

const ACCOUNT_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  BANK: Banknote,
  CASH: Wallet,
  INVESTMENT: TrendingUp,
  CRYPTO: Coins,
  CREDIT_CARD: CreditCard,
}

export function AccountsGrid() {
  const { data, isLoading } = useAccounts()
  const setOpen = useUIStore((s) => s.setAccountFormOpen)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data ?? []).map((account) => {
          const Icon = ACCOUNT_ICONS[account.type] ?? Wallet
          return (
            <Card key={account.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: account.color ?? '#6366f1' + '33' }}
                  >
                    <Icon
                      className="h-5 w-5"
                      color={account.color ?? '#6366f1'}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {account.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="font-semibold text-foreground">{account.name}</p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {formatCurrency(Number(account.balance), account.currency as Currency)}
                </p>
              </CardContent>
            </Card>
          )
        })}

        {(!data || data.length === 0) && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            No accounts yet. Click <strong>Add Account</strong> to get started.
          </div>
        )}
      </div>
    </div>
  )
}
