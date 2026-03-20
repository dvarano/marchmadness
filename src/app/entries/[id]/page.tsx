import { readPool } from '@/lib/data/store'
import { getTeamById, TEAMS } from '@/lib/data/teams'
import { getTournamentAliveTeams } from '@/lib/engine/runway'
import { SCHEDULE } from '@/lib/data/schedule'
import { cn, seedBgClass } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export function generateStaticParams() {
  const data = readPool()
  return data.entries.map(e => ({ id: e.id }))
}

export default function EntryDetailPage({ params }: { params: { id: string } }) {
  const data = readPool()
  const entry = data.entries.find(e => e.id === params.id)
  if (!entry) notFound()

  const picks = data.picks.filter(p => p.entryId === entry.id).sort((a, b) => a.day - b.day)
  const teamsUsed = new Set(picks.flatMap(p => p.teamIds))
  const tourneyAlive = getTournamentAliveTeams(data)
  const availableTeams = TEAMS.filter(t => !teamsUsed.has(t.id)).sort((a, b) => a.seed - b.seed)
  const viableTeams = availableTeams.filter(t => tourneyAlive.has(t.id))
  const deadTeams = availableTeams.filter(t => !tourneyAlive.has(t.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/entries" className="text-gray-400 hover:text-white text-sm">← Entries</Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white">{entry.name}</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className={cn('font-semibold', entry.isAlive ? 'text-green-400' : 'text-red-400')}>
            {entry.isAlive ? 'Alive' : `Eliminated Day ${entry.eliminatedOnDay}`}
          </span>
          {entry.buybacks > 0 && (
            <span className="text-yellow-400 text-sm">{entry.buybacks}x Buyback</span>
          )}
        </div>
      </div>

      {/* Pick history */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Pick History</h2>
        {picks.length === 0 && <p className="text-gray-500">No picks recorded.</p>}
        {picks.map(pick => {
          const schedDay = SCHEDULE.find(s => s.day === pick.day)
          return (
            <div
              key={pick.day}
              className={cn(
                'bg-gray-900 border rounded-xl p-4',
                pick.status === 'correct' && 'border-green-800',
                pick.status === 'eliminated' && 'border-red-800',
                pick.status === 'pending' && 'border-gray-800',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{schedDay?.label ?? `Day ${pick.day}`}</div>
                  <div className="text-xs text-gray-400">{schedDay?.round} · Need {pick.requiredWins} wins</div>
                </div>
                <span className={cn(
                  'text-xs font-bold px-2 py-1 rounded-full',
                  pick.status === 'correct' && 'bg-green-900 text-green-300',
                  pick.status === 'eliminated' && 'bg-red-900 text-red-300',
                  pick.status === 'pending' && 'bg-gray-800 text-gray-400',
                )}>
                  {pick.status.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {pick.teamIds.map(tid => {
                  const team = getTeamById(tid)
                  if (!team) return <span key={tid} className="text-red-400 text-xs">{tid}</span>
                  return (
                    <div key={tid} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-5 h-5 rounded-full text-center text-xs leading-5 font-bold', seedBgClass(team.seed))}>
                          {team.seed}
                        </span>
                        <span className="font-medium text-white">{team.name}</span>
                        <span className="text-xs text-gray-400">{team.region}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Teams used */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Teams Used ({teamsUsed.size})</h2>
        <div className="flex flex-wrap gap-2">
          {[...teamsUsed].map(tid => {
            const team = getTeamById(tid)
            if (!team) return null
            return (
              <span key={tid} className={cn('px-2 py-1 rounded text-xs font-medium', seedBgClass(team.seed))}>
                {team.seed} {team.name}
              </span>
            )
          })}
        </div>
      </div>

      {/* Teams available — viable vs eliminated from tourney */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">
          Teams Available ({availableTeams.length})
          {viableTeams.length <= 5 && (
            <span className="text-red-400 text-sm font-normal ml-2">Low viable picks — elimination risk!</span>
          )}
        </h2>
        {deadTeams.length > 0 && (
          <p className="text-sm text-gray-400 mb-3">
            <span className="text-green-400 font-medium">{viableTeams.length} viable</span>
            {' · '}
            <span className="text-gray-500">{deadTeams.length} eliminated from tourney</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {viableTeams.map(team => (
            <span key={team.id} className={cn('px-2 py-1 rounded text-xs font-medium', seedBgClass(team.seed))}>
              {team.seed} {team.name}
            </span>
          ))}
          {deadTeams.map(team => (
            <span key={team.id} className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-500 line-through">
              {team.seed} {team.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
