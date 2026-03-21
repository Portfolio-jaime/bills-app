'use client'

import { useCategoryChart } from '@/lib/queries/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@bills/ui'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function CategoryDonutChart() {
  const { data, isLoading } = useCategoryChart('EXPENSE')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 h-72 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = (data ?? []).slice(0, 7)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="amount"
              nameKey="categoryName"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.categoryId ?? index} fill={entry.color ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222.2 84% 6%)',
                border: '1px solid hsl(217.2 32.6% 17.5%)',
                borderRadius: '8px',
              }}
              formatter={(v: number, name: string) => [`${v.toFixed(0)}`, name]}
            />
            <Legend
              iconSize={10}
              formatter={(v) => <span style={{ fontSize: 12, color: 'hsl(215, 20.2%, 65.1%)' }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
