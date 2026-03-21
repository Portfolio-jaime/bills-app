import { TransactionList } from '@/components/transactions/TransactionTable'

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">All your income and expenses</p>
      </div>
      <TransactionList />
    </div>
  )
}
