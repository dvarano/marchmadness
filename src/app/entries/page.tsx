import { readPool } from '@/lib/data/store'
import { getTeamById, TEAMS } from '@/lib/data/teams'
import Link from 'next/link'
import { cn, seedBgClass } from '@/lib/utils'

export default function EntriesPage() {
  const data = readPool()
  const days = [...new Set(data.picks.map(p => p.day))].sort((a, b) => a - b)

  const alive = data.entries.filter(e => e.isAlive).sort((a, b) => a.name.localeCompare(b.name))
  const eliminated = data.entries
    .filter(e => !e.isAlive)
    .sort((a, b) => (b.eliminatedOnDay ?? 0) - (a.eliminatedOnDay ?? 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Entries</h1>
        <p className="text-gray-400 mt-1">
          {alive.length} alive &middot; {eliminated.length} eliminated
        </p>
      </div>

      {data.entries.length === 0 && (
        <div className="text-gray-500 text-center py-12">No entries yet. Import picks from Admin.</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Entry</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Buybacks</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Remaining</th>
              {days.map(d => (
                <th key={d} className="text-left py-2 px-3 text-gray-400 font-medium whitespace-nowrap">
                  Day {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...alive, ...eliminated].map(entry => {
              const entryPicks = data.picks.filter(p => p.entryId === entry.id)
              return (
                <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="py-2 px-3">
                    <Link
                      href={`/entries/${entry.id}`}
                      className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                      {entry.name}
                    </Link>
                  </td>
                  <td className="py-2 px-3">
                    {entry.isAlive ? (
                      <span className="text-green-400 font-semibold">Alive</span>
                    ) : (
                      <span className="text-red-400 font-semibold">
                        Out Day {entry.eliminatedOnDay}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-300">{entry.buybacks}</td>
                  <td className="py-2 px-3">
                    {(() => {
                      const used = new Set(data.picks.filter(p => p.entryId === entry.id).flatMap(p => p.teamIds))
                      const remaining = TEAMS.length - used.size
                      return (
                        <span className={cn(
                          'font-medium',
                          remaining <= 5 ? 'text-red-400' : remaining <= 15 ? 'text-yellow-400' : 'text-gray-300'
                        )}>
                          {remaining}
                        </span>
                      )
                    })()}
                  </td>
                  {days.map(d => {
                    const pick = entryPicks.find(p => p.day === d)
                    return (
                      <td key={d} className="py-2 px-3">
                        {pick ? (
                          <div className={cn('inline-flex gap-1 flex-wrap', !entry.isAlive && entry.eliminatedOnDay === d && 'opacity-60')}>
                            {pick.teamIds.map(tid => {
                              const team = getTeamById(tid)
                              if (!team) return null
                              return (
                                <span
                                  key={tid}
                                  className={cn(
                                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium',
                                    pick.status === 'correct' ? 'bg-green-900/50 text-green-300 border border-green-800' :
                                    pick.status === 'eliminated' ? 'bg-red-900/50 text-red-300 border border-red-800' :
                                    'bg-gray-800 text-gray-300 border border-gray-700'
                                  )}
                                >
                                  <span className={cn('w-4 h-4 rounded-full text-center text-xs leading-4 font-bold', seedBgClass(team.seed))}>
                                    {team.seed}
                                  </span>
                                  {team.name}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
