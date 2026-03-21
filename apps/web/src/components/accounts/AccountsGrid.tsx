'use client'

import { useAccounts } from '@/lib/queries/accounts'
import { Card, CardContent } from '@bills/ui'
import { formatCurrency } from '@bills/utils'
import type { Currency } from '@bills/types'
import { Banknote, CreditCard, TrendingUp, Coins, Wallet, LucideProps } from 'lucide-react'

const ACCOUNT_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  BANK: Banknote,
  CASH: Wallet,
  INVESTMENT: TrendingUp,
  CRYPTO: Coins,
  CREDIT_CARD: CreditCard,
}

export function AccountsGrid() {
  const { data, isLoading } = useAccounts()

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
          No accounts yet. Add your first account to get started.
        </div>
      )}
    </div>
  )
}
