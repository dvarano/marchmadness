import { readPool } from '@/lib/data/store'
import { computeSweatMeter } from '@/lib/engine/sweatMeter'
import { SweatMatchupCard } from '@/components/today/SweatMatchupCard'
import { ExportCard } from '@/components/ExportCard'
import { pct } from '@/lib/utils'

export default function TodayPage() {
  const data = readPool()
  const maxDay = data.picks.length > 0 ? Math.max(...data.picks.map(p => p.day)) : 0
  const sweat = computeSweatMeter(data, maxDay)

  const resolvedCount = sweat.matchups.filter(m => m.resolved).length
  const pendingCount = sweat.matchups.filter(m => !m.resolved).length
  const eliminatedToday = data.entries.filter(e => e.eliminatedOnDay === maxDay).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Today&apos;s Games</h1>
        <p className="text-gray-400 mt-1">
          {sweat.dayLabel} &middot; {sweat.totalAlive} entries at start of day
          {eliminatedToday > 0 && (
            <> &middot; <span className="text-red-400">{eliminatedToday} eliminated today</span></>
          )}
          {sweat.matchups.length > 0 && (
            <> &middot; {resolvedCount} games resolved, {pendingCount} pending</>
          )}
        </p>
      </div>

      {maxDay === 0 && (
        <div className="text-gray-500 text-center py-12">No picks imported yet.</div>
      )}

      {sweat.matchups.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Games</div>
              <div className="text-3xl font-bold text-white mt-1">{sweat.matchups.length}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Picks at Stake</div>
              <div className="text-3xl font-bold text-orange-400 mt-1">
                {sweat.matchups.reduce((sum, m) => sum + m.totalAtStake, 0)}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Max Sweat Game</div>
              <div className="text-3xl font-bold text-red-400 mt-1">
                {sweat.matchups.length > 0
                  ? pct(Math.max(...sweat.matchups.map(m => m.sweatScore)))
                  : '—'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400">Resolved</div>
              <div className="text-3xl font-bold text-green-400 mt-1">
                {resolvedCount}/{sweat.matchups.length}
              </div>
            </div>
          </div>

          {/* Pending games first */}
          {pendingCount > 0 && (
            <ExportCard title="Pending Games">
              <div className="grid gap-4 md:grid-cols-2">
                {sweat.matchups
                  .filter(m => !m.resolved)
                  .map(matchup => (
                    <SweatMatchupCard key={matchup.id} matchup={matchup} totalAlive={sweat.totalAlive} />
                  ))}
              </div>
            </ExportCard>
          )}

          {/* Resolved games */}
          {resolvedCount > 0 && (
            <ExportCard title="Resolved Games">
              <div className="grid gap-4 md:grid-cols-2">
                {sweat.matchups
                  .filter(m => m.resolved)
                  .map(matchup => (
                    <SweatMatchupCard key={matchup.id} matchup={matchup} totalAlive={sweat.totalAlive} />
                  ))}
              </div>
            </ExportCard>
          )}
        </>
      )}
    </div>
  )
}
