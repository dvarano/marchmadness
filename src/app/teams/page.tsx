import { readPool } from '@/lib/data/store'
import { TEAMS } from '@/lib/data/teams'
import { cn, seedBgClass, seedColor } from '@/lib/utils'
import { ExportCard } from '@/components/ExportCard'

export default function TeamsPage() {
  const data = readPool()
  const aliveEntries = new Set(data.entries.filter(e => e.isAlive).map(e => e.id))
  const totalAlive = aliveEntries.size

  // Count picks per team across all days (alive entries only)
  const teamPickCounts = new Map<string, number>()
  for (const pick of data.picks) {
    if (!aliveEntries.has(pick.entryId)) continue
    for (const tid of pick.teamIds) {
      teamPickCounts.set(tid, (teamPickCounts.get(tid) ?? 0) + 1)
    }
  }

  // Team availability heatmap: for each team, how many alive entries can still pick it
  const teamAvailability = TEAMS.map(team => {
    let canPick = 0
    for (const entry of data.entries.filter(e => e.isAlive)) {
      const usedByEntry = new Set(
        data.picks.filter(p => p.entryId === entry.id).flatMap(p => p.teamIds)
      )
      if (!usedByEntry.has(team.id)) canPick++
    }
    return { team, canPick, rate: totalAlive > 0 ? canPick / totalAlive : 0 }
  }).sort((a, b) => a.canPick - b.canPick)

  // Sort teams by pick count
  const sortedTeams = TEAMS.map(team => ({
    team,
    count: teamPickCounts.get(team.id) ?? 0,
    rate: totalAlive > 0 ? (teamPickCounts.get(team.id) ?? 0) / totalAlive : 0,
  })).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Teams</h1>
        <p className="text-gray-400 mt-1">Team usage across {totalAlive} alive entries</p>
      </div>

      {/* Team Frequency */}
      <ExportCard title="Team Pick Frequency (All Days)">
        <div className="space-y-1.5">
          {sortedTeams.filter(t => t.count > 0).slice(0, 30).map(({ team, count, rate }) => (
            <div key={team.id} className="flex items-center gap-2">
              <span className={cn('w-5 h-5 rounded text-center text-xs leading-5 font-bold shrink-0', seedBgClass(team.seed))}>
                {team.seed}
              </span>
              <span className="text-sm text-gray-300 w-36 truncate">{team.name}</span>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(rate * 100).toFixed(1)}%`,
                    backgroundColor: seedColor(team.seed),
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-16 text-right">
                {count} ({(rate * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
          {sortedTeams.every(t => t.count === 0) && (
            <p className="text-gray-500">No picks imported yet.</p>
          )}
        </div>
      </ExportCard>

      {/* Team Availability Heatmap */}
      <ExportCard title="Team Availability (entries that can still pick each team)">
        <p className="text-sm text-gray-400 mb-3">
          Sorted by scarcity — teams fewer entries can pick appear first. Likely popular picks have high availability.
        </p>
        <div className="space-y-1.5">
          {teamAvailability.filter(t => t.canPick < totalAlive).length === 0 && totalAlive > 0 ? (
            <p className="text-gray-500">All teams are available to all entries.</p>
          ) : teamAvailability.filter(t => t.canPick < totalAlive || totalAlive === 0).slice(0, 30).map(({ team, canPick, rate }) => (
            <div key={team.id} className="flex items-center gap-2">
              <span className={cn('w-5 h-5 rounded text-center text-xs leading-5 font-bold shrink-0', seedBgClass(team.seed))}>
                {team.seed}
              </span>
              <span className="text-sm text-gray-300 w-36 truncate">{team.name}</span>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(rate * 100).toFixed(1)}%`,
                    backgroundColor: rate > 0.8 ? '#22c55e' : rate > 0.5 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-20 text-right">
                {canPick}/{totalAlive} ({(rate * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
          {totalAlive === 0 && (
            <p className="text-gray-500">No alive entries.</p>
          )}
        </div>
      </ExportCard>

      {/* Seed Distribution */}
      <ExportCard title="Picks by Seed">
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 16 }, (_, i) => i + 1).map(seed => {
            const seedTeams = TEAMS.filter(t => t.seed === seed)
            const seedPicks = seedTeams.reduce((acc, t) => acc + (teamPickCounts.get(t.id) ?? 0), 0)
            const seedRate = totalAlive > 0 ? seedPicks / totalAlive : 0
            return (
              <div key={seed} className="text-center">
                <div
                  className="rounded-lg p-2 mb-1"
                  style={{
                    backgroundColor: `${seedColor(seed)}${Math.round(Math.min(seedRate * 4, 1) * 255).toString(16).padStart(2, '0')}`,
                    border: `1px solid ${seedColor(seed)}40`,
                  }}
                >
                  <div className="text-sm font-bold" style={{ color: seedColor(seed) }}>{seed}</div>
                  <div className="text-xs text-gray-300">{seedPicks}</div>
                </div>
              </div>
            )
          })}
        </div>
      </ExportCard>
    </div>
  )
}
