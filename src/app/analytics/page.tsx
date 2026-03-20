import { readPool } from '@/lib/data/store'
import { TEAMS } from '@/lib/data/teams'
import { computeUpsetImpact } from '@/lib/engine/upsetImpact'
import { computeContrarianScores } from '@/lib/engine/contrarian'
import { computeRunway } from '@/lib/engine/runway'
import { ExportCard } from '@/components/ExportCard'
import { cn, pct, seedBgClass } from '@/lib/utils'

export default function AnalyticsPage() {
  const data = readPool()
  const maxDay = data.picks.length > 0 ? Math.max(...data.picks.map(p => p.day)) : 0

  const upsetImpact = computeUpsetImpact(data, maxDay)
  const contrarian = computeContrarianScores(data)
  const aliveEntries = data.entries.filter(e => e.isAlive)
  const aliveCount = aliveEntries.length

  // Effective runway: viable teams per alive entry
  const runway = computeRunway(data)
  const tourneyEliminated = TEAMS.length - (runway[0]?.teamsStillInTourney ?? TEAMS.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Day {maxDay} analysis · {aliveCount} entries alive</p>
      </div>

      {maxDay === 0 && (
        <div className="text-gray-500 text-center py-12">No data yet. Import picks from Admin.</div>
      )}

      {/* Upset Impact */}
      {upsetImpact.length > 0 && (
        <ExportCard title={`Upset Impact — Day ${maxDay}`}>
          <p className="text-sm text-gray-400 mb-4">
            % of alive entries eliminated if this team loses today
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Team</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Seed</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Picks</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Field %</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Elim if Lose</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">At Risk</th>
                </tr>
              </thead>
              <tbody>
                {upsetImpact.map(row => {
                  const danger = row.eliminatedIfLoseRate
                  return (
                    <tr
                      key={row.teamId}
                      className="border-b border-gray-800/50"
                      style={{
                        backgroundColor: `rgba(239,68,68,${danger * 0.25})`,
                      }}
                    >
                      <td className="py-2 px-3 font-medium text-white">{row.teamName}</td>
                      <td className="py-2 px-3">
                        <span className={cn('px-1.5 py-0.5 rounded text-xs font-bold', seedBgClass(row.seed))}>
                          {row.seed}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-300">{row.pickCount}</td>
                      <td className="py-2 px-3 text-gray-300">{pct(row.fieldPickRate)}</td>
                      <td className={cn('py-2 px-3 font-bold', danger > 0.3 ? 'text-red-400' : danger > 0.1 ? 'text-yellow-400' : 'text-gray-300')}>
                        {row.eliminatedIfLose} ({pct(row.eliminatedIfLoseRate)})
                      </td>
                      <td className="py-2 px-3 text-yellow-300">{row.atRiskIfLose}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ExportCard>
      )}

      {/* Contrarian Leaderboard */}
      {contrarian.length > 0 && (
        <ExportCard title="Contrarian Leaderboard">
          <p className="text-sm text-gray-400 mb-4">
            Who has picked the most differentiated teams (higher = more unique)
          </p>
          <div className="space-y-2">
            {contrarian.slice(0, 15).map((row, i) => (
              <div key={row.entryId} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                <span className="text-white font-medium w-40 truncate">{row.entryName}</span>
                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${(row.score * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="text-xs text-teal-400 w-12 text-right">
                  {(row.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </ExportCard>
      )}

      {/* Effective Runway — Rule 8 */}
      {runway.length > 0 && (
        <ExportCard title="Effective Runway (Rule 8 — Viable Teams Remaining)">
          <p className="text-sm text-gray-400 mb-4">
            Viable picks = unused teams still alive in the tournament.
            {tourneyEliminated > 0 && (
              <> {tourneyEliminated} teams have been knocked out of the tourney.</>
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Entry</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Used</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Available</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Viable</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Runway</th>
                </tr>
              </thead>
              <tbody>
                {runway.slice(0, 25).map(row => {
                  const riskLevel = row.viableTeams <= 5 ? 'critical' : row.viableTeams <= 15 ? 'warning' : 'safe'
                  return (
                    <tr key={row.entryId} className="border-b border-gray-800/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            riskLevel === 'critical' && 'bg-red-500',
                            riskLevel === 'warning' && 'bg-yellow-500',
                            riskLevel === 'safe' && 'bg-green-500',
                          )} />
                          <span className="text-white font-medium truncate">{row.entryName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-400">{row.teamsUsed}</td>
                      <td className="py-2 px-3 text-gray-400">
                        {row.teamsAvailableRaw}
                        {row.eliminatedFromTourney > 0 && (
                          <span className="text-red-400 text-xs ml-1">
                            ({row.eliminatedFromTourney} dead)
                          </span>
                        )}
                      </td>
                      <td className={cn(
                        'py-2 px-3 font-bold',
                        riskLevel === 'critical' && 'text-red-400',
                        riskLevel === 'warning' && 'text-yellow-400',
                        riskLevel === 'safe' && 'text-green-400',
                      )}>
                        {row.viableTeams}
                      </td>
                      <td className="py-2 px-3 w-32">
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              riskLevel === 'critical' && 'bg-red-500',
                              riskLevel === 'warning' && 'bg-yellow-500',
                              riskLevel === 'safe' && 'bg-green-500',
                            )}
                            style={{ width: `${(row.viableTeams / TEAMS.length * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ExportCard>
      )}

    </div>
  )
}
