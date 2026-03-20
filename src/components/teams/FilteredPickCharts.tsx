'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { ExportCard } from '@/components/ExportCard'
import { cn } from '@/lib/utils'

interface TeamInfo {
  id: string
  name: string
  seed: number
  seedBgClass: string
  seedColor: string
}

interface PickRow {
  day: number
  teamIds: string[]
}

interface Props {
  teams: TeamInfo[]
  picks: PickRow[]
  totalEntries: number
}

const ROUND_FILTERS = [
  { label: 'All Rounds', days: null },
  { label: 'Round 1 (Day 1–2)', days: [1, 2] },
  { label: 'Round 2 (Day 3–4)', days: [3, 4] },
  { label: 'Sweet 16 (Day 5–6)', days: [5, 6] },
  { label: 'Elite 8 (Day 7–8)', days: [7, 8] },
] as const

export function FilteredPickCharts({ teams, picks, totalEntries }: Props) {
  const [filterIdx, setFilterIdx] = useState(0)
  const filter = ROUND_FILTERS[filterIdx]

  const filteredPicks = useMemo(() => {
    if (!filter.days) return picks
    const daySet = new Set<number>(filter.days)
    return picks.filter(p => daySet.has(p.day))
  }, [picks, filter])

  // Count picks per team
  const teamPickCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const pick of filteredPicks) {
      for (const tid of pick.teamIds) {
        counts.set(tid, (counts.get(tid) ?? 0) + 1)
      }
    }
    return counts
  }, [filteredPicks])

  // Seed histogram data
  const seedData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const seed = i + 1
      const seedTeams = teams.filter(t => t.seed === seed)
      const pickCount = seedTeams.reduce((acc, t) => acc + (teamPickCounts.get(t.id) ?? 0), 0)
      return { seed, picks: pickCount, color: seedTeams[0]?.seedColor ?? '#6b7280' }
    })
  }, [teams, teamPickCounts])

  // Team frequency sorted
  const sortedTeams = useMemo(() => {
    return teams.map(team => ({
      team,
      count: teamPickCounts.get(team.id) ?? 0,
      rate: totalEntries > 0 ? (teamPickCounts.get(team.id) ?? 0) / totalEntries : 0,
    })).sort((a, b) => b.count - a.count)
  }, [teams, teamPickCounts, totalEntries])

  return (
    <>
      {/* Round filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {ROUND_FILTERS.map((f, i) => (
          <button
            key={i}
            onClick={() => setFilterIdx(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              i === filterIdx
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Seed Distribution */}
      <ExportCard title={`Picks by Seed — ${filter.label}`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={seedData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="seed"
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#f9fafb' }}
              labelFormatter={(seed) => `Seed ${seed}`}
              formatter={(value: number) => [value, 'Picks']}
              cursor={{ fill: '#374151', opacity: 0.3 }}
            />
            <Bar dataKey="picks" radius={[4, 4, 0, 0]}>
              {seedData.map((d) => (
                <Cell key={d.seed} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ExportCard>

      {/* Team Frequency */}
      <ExportCard title={`Team Pick Frequency — ${filter.label}`}>
        <div className="space-y-1.5">
          {sortedTeams.filter(t => t.count > 0).slice(0, 30).map(({ team, count, rate }) => (
            <div key={team.id} className="flex items-center gap-2">
              <span className={cn('w-5 h-5 rounded text-center text-xs leading-5 font-bold shrink-0', team.seedBgClass)}>
                {team.seed}
              </span>
              <span className="text-sm text-gray-300 w-36 truncate">{team.name}</span>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(rate * 100).toFixed(1)}%`,
                    backgroundColor: team.seedColor,
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-16 text-right">
                {count} ({(rate * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
          {sortedTeams.every(t => t.count === 0) && (
            <p className="text-gray-500">No picks for this round yet.</p>
          )}
        </div>
      </ExportCard>
    </>
  )
}
