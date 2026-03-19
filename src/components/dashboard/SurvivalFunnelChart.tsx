'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DaySummary } from '@/types'
import { ExportCard } from '@/components/ExportCard'

interface Props {
  data: DaySummary[]
  total: number
}

export function SurvivalFunnelChart({ data, total }: Props) {
  const chartData = data.map(d => ({
    name: `Day ${d.day}`,
    Survivors: d.survivors,
    Eliminated: d.eliminated,
    Buybacks: d.buybacks,
  }))

  return (
    <ExportCard title="Survival Funnel">
      <p className="text-sm text-gray-400 mb-4">
        Entries still alive by day ({total} total started)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="survGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value: number, name: string) => {
              const color = name === 'Survivors' ? '#f97316' : name === 'Buybacks' ? '#eab308' : '#ef4444'
              return [<span key={name} style={{ color }}>{value}</span>, name]
            }}
          />
          <Area
            type="monotone"
            dataKey="Survivors"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#survGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExportCard>
  )
}
