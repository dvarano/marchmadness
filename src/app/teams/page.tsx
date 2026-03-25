import { readPool } from '@/lib/data/store'
import { TEAMS } from '@/lib/data/teams'
import { cn, seedBgClass, seedColor } from '@/lib/utils'
import { ExportCard } from '@/components/ExportCard'
import { FilteredPickCharts } from '@/components/teams/FilteredPickCharts'

export default function TeamsPage() {
  const data = readPool()
  const aliveEntries = new Set(data.entries.filter(e => e.isAlive).map(e => e.id))
  const totalAlive = aliveEntries.size
  const totalEntries = data.entries.length

  // Serialize data for client component
  const teamInfos = TEAMS.map(t => ({
    id: t.id,
    name: t.name,
    seed: t.seed,
    seedBgClass: seedBgClass(t.seed),
    seedColor: seedColor(t.seed),
  }))
  const pickRows = data.picks.map(p => ({ day: p.day, teamIds: p.teamIds }))

  // Teams eliminated from the tournament (lost a game)
  const eliminatedTeams = new Set(data.results.map(r => r.loserId))

  // Team availability heatmap: only teams still in the tourney
  const teamAvailability = TEAMS.filter(t => !eliminatedTeams.has(t.id)).map(team => {
    let canPick = 0
    for (const entry of data.entries.filter(e => e.isAlive)) {
      const usedByEntry = new Set(
        data.picks.filter(p => p.entryId === entry.id).flatMap(p => p.teamIds)
      )
      if (!usedByEntry.has(team.id)) canPick++
    }
    return { team, canPick, rate: totalAlive > 0 ? canPick / totalAlive : 0 }
  }).sort((a, b) => a.canPick - b.canPick)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Teams</h1>
        <p className="text-gray-400 mt-1">Team usage across {totalEntries} entries ({totalAlive} alive)</p>
      </div>

      {/* Filtered charts: Seed Histogram + Team Frequency */}
      <FilteredPickCharts teams={teamInfos} picks={pickRows} totalEntries={totalEntries} />

      {/* Team Availability Heatmap */}
      <ExportCard title={`Team Availability (${TEAMS.length - eliminatedTeams.size} teams remaining)`}>
        <p className="text-sm text-gray-400 mb-3">
          Only teams still in the tourney. Sorted by scarcity — teams fewer entries can pick appear first.
        </p>
        <div className="space-y-1.5">
          {teamAvailability.length === 0 && totalAlive > 0 ? (
            <p className="text-gray-500">No teams remaining in the tourney.</p>
          ) : teamAvailability.map(({ team, canPick, rate }) => (
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
    </div>
  )
}
