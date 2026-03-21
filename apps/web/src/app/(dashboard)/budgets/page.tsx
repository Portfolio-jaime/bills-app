import { BudgetsView } from '@/components/budgets/BudgetsView'

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your spending limits</p>
      </div>
      <BudgetsView />
    </div>
  )
}
