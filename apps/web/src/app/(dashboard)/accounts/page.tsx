import { AccountsGrid } from '@/components/accounts/AccountsGrid'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your financial accounts</p>
      </div>
      <AccountsGrid />
    </div>
  )
}
