import { PickPasteBox } from '@/components/admin/PickPasteBox'
import { ResultEntryForm } from '@/components/admin/ResultEntryForm'
import { MatchupBoard } from '@/components/admin/MatchupBoard'
import { readPool } from '@/lib/data/store'
import { getTeamById, TEAMS } from '@/lib/data/teams'
import { cn } from '@/lib/utils'

export default function AdminPage() {
  const data = readPool()
  const totalEntries = data.entries.length
  const totalResults = data.results.length

  const teamInfos = TEAMS.map(t => ({
    id: t.id,
    name: t.name,
    seed: t.seed,
    region: t.region,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin</h1>
        <p className="text-gray-400 mt-1">
          {totalEntries} entries · {data.picks.length} pick records · {totalResults} results
        </p>
      </div>

      {/* Matchup Board — click to record winners */}
      {data.matchups.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-1">Game Results</h2>
          <p className="text-sm text-gray-400 mb-4">
            Click the winning team to record the result.
          </p>
          <MatchupBoard
            matchups={data.matchups}
            results={data.results}
            teams={teamInfos}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pick Import */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-1">Import Daily Picks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Paste picks in format: <code className="text-orange-400">Username- Team1, Team2</code>
          </p>
          <PickPasteBox />
        </div>

        {/* Manual Result Entry */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-1">Manual Result Entry</h2>
          <p className="text-sm text-gray-400 mb-4">
            Fallback: enter a result manually if no matchup is loaded.
          </p>
          <ResultEntryForm />
        </div>
      </div>

      {/* Existing results */}
      {data.results.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">Recorded Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400">Day</th>
                  <th className="text-left py-2 px-3 text-gray-400">Winner</th>
                  <th className="text-left py-2 px-3 text-gray-400">Loser</th>
                </tr>
              </thead>
              <tbody>
                {[...data.results].sort((a, b) => a.day - b.day).map((r, i) => {
                  const winner = getTeamById(r.winnerId)
                  const loser = getTeamById(r.loserId)
                  return (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400">Day {r.day}</td>
                      <td className="py-2 px-3 text-green-400 font-medium">
                        {winner ? `[${winner.seed}] ${winner.name}` : r.winnerId}
                      </td>
                      <td className="py-2 px-3 text-red-400">
                        {loser ? `[${loser.seed}] ${loser.name}` : r.loserId}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entry list */}
      {totalEntries > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">All Entries ({totalEntries})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {data.entries.sort((a, b) => a.name.localeCompare(b.name)).map(entry => (
              <div
                key={entry.id}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  entry.isAlive ? 'bg-green-900/20 border border-green-900 text-green-300' : 'bg-red-900/20 border border-red-900 text-red-400'
                )}
              >
                <div className="font-medium">{entry.name}</div>
                <div className="text-xs opacity-70">
                  {entry.isAlive ? 'Alive' : `Out D${entry.eliminatedOnDay}`}
                  {entry.buybacks > 0 && ` · ${entry.buybacks}BB`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
