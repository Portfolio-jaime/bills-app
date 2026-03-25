import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart'
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <ShieldCheck className="h-4 w-4" />
          Admin Panel
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyBarChart />
        </div>
        <div>
          <CategoryDonutChart />
        </div>
      </div>

      <BudgetProgressList />
    </div>
  )
}
