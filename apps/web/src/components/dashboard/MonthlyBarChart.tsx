'use client'

import { useMonthlyChart } from '@/lib/queries/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@bills/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatMonthLabel } from '@bills/utils'

export function MonthlyBarChart() {
  const { data, isLoading } = useMonthlyChart()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 h-72 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading chart…</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = (data ?? []).map((d) => ({
    ...d,
    label: formatMonthLabel(d.month + '-01'),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Income vs Expenses — Last 12 months</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(215, 20.2%, 65.1%)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(215, 20.2%, 65.1%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222.2 84% 6%)',
                border: '1px solid hsl(217.2 32.6% 17.5%)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(210 40% 98%)' }}
            />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
