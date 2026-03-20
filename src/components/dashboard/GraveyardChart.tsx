'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { GraveyardDay } from '@/types'
import { ExportCard } from '@/components/ExportCard'
import { seedColor } from '@/lib/utils'

interface Props {
  data: GraveyardDay[]
}

export function GraveyardChart({ data }: Props) {
  if (data.length === 0) return null

  // Collect all unique team causes across all days
  const allTeams = new Map<string, { name: string; seed: number }>()
  for (const day of data) {
    for (const seg of day.segments) {
      if (!allTeams.has(seg.teamId)) {
        allTeams.set(seg.teamId, { name: seg.teamName, seed: seg.seed })
      }
    }
  }

  // Build chart data: each day has a key per team
  const chartData = data.map(day => {
    const row: Record<string, string | number> = { name: day.label.replace(/Day \d+ – /, '') }
    for (const seg of day.segments) {
      row[seg.teamName] = seg.count
    }
    return row
  })

  // Sort teams by total eliminations for legend ordering
  const teamTotals = new Map<string, number>()
  for (const day of data) {
    for (const seg of day.segments) {
      teamTotals.set(seg.teamName, (teamTotals.get(seg.teamName) ?? 0) + seg.count)
    }
  }
  const sortedTeams = [...allTeams.entries()]
    .sort((a, b) => (teamTotals.get(b[1].name) ?? 0) - (teamTotals.get(a[1].name) ?? 0))

  return (
    <ExportCard title="Elimination Timeline">
      <p className="text-sm text-gray-400 mb-4">
        Eliminations by day, colored by which team loss caused them
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f9fafb' }}
          />
          {sortedTeams.map(([teamId, info]) => (
            <Bar key={teamId} dataKey={info.name} stackId="elim" fill={seedColor(info.seed)} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend / narrative */}
      <div className="mt-4 flex flex-wrap gap-3">
        {sortedTeams.slice(0, 10).map(([teamId, info]) => (
          <div key={teamId} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: seedColor(info.seed) }} />
            <span className="text-xs text-gray-400">
              {info.name} ({teamTotals.get(info.name)})
            </span>
          </div>
        ))}
      </div>

      {/* Narrative highlights */}
      {data.map(day => {
        if (day.totalEliminated === 0) return null
        const topCause = day.segments[0]
        if (!topCause) return null
        return (
          <div key={day.day} className="mt-2 text-xs text-gray-500">
            <span className="text-gray-400 font-medium">{day.label}:</span>{' '}
            {day.totalEliminated} eliminated
            {topCause.count > 1 && (
              <> — {topCause.teamName}&apos;s loss took out {topCause.count}</>
            )}
          </div>
        )
      })}
    </ExportCard>
  )
}
