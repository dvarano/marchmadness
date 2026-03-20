import { readPool } from '@/lib/data/store'
import { computeSurvivalFunnel, getAliveCount } from '@/lib/engine/survival'
import { computeGraveyard } from '@/lib/engine/graveyard'
import { SurvivalFunnelChart } from '@/components/dashboard/SurvivalFunnelChart'
import { GraveyardChart } from '@/components/dashboard/GraveyardChart'
import { DaySummaryCard } from '@/components/dashboard/DaySummaryCard'
import { SCHEDULE } from '@/lib/data/schedule'

export default function DashboardPage() {
  const data = readPool()
  const funnel = computeSurvivalFunnel(data)
  const graveyard = computeGraveyard(data)
  const aliveCount = getAliveCount(data)
  const totalEntries = data.entries.length

  // Find latest day with picks
  const maxDay = data.picks.length > 0 ? Math.max(...data.picks.map(p => p.day)) : 0
  const latestScheduleDay = SCHEDULE.find(s => s.day === maxDay)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {totalEntries} entries &middot; {aliveCount} alive
          {maxDay > 0 && latestScheduleDay && ` · Currently on ${latestScheduleDay.label}`}
        </p>
      </div>

      {totalEntries === 0 && (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-8 text-center">
          <div className="text-gray-400 text-lg">No data yet</div>
          <div className="text-gray-500 text-sm mt-2">
            Go to{' '}
            <a href="/admin" className="text-orange-400 underline">
              Admin
            </a>{' '}
            to paste in Day 1 picks.
          </div>
        </div>
      )}

      {/* Stat cards */}
      {totalEntries > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400">Total Entries</div>
            <div className="text-3xl font-bold text-white mt-1">{totalEntries}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400">Still Alive</div>
            <div className="text-3xl font-bold text-green-400 mt-1">{aliveCount}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400">Eliminated</div>
            <div className="text-3xl font-bold text-red-400 mt-1">{totalEntries - aliveCount}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400">Survival Rate</div>
            <div className="text-3xl font-bold text-orange-400 mt-1">
              {totalEntries > 0 ? `${((aliveCount / totalEntries) * 100).toFixed(0)}%` : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Funnel chart */}
      {funnel.length > 0 && (
        <SurvivalFunnelChart data={funnel} total={totalEntries} />
      )}

      {/* Graveyard chart */}
      {graveyard.length > 0 && (
        <GraveyardChart data={graveyard} />
      )}

      {/* Day summaries */}
      {funnel.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Day-by-Day Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {funnel.map(summary => {
              const schedDay = SCHEDULE.find(s => s.day === summary.day)
              return (
                <DaySummaryCard
                  key={summary.day}
                  summary={summary}
                  label={schedDay?.label ?? `Day ${summary.day}`}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
