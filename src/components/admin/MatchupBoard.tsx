'use client'

import { useState } from 'react'
import type { Matchup, GameResult } from '@/types'

interface TeamInfo {
  id: string
  name: string
  seed: number
  region: string
}

interface Props {
  matchups: Matchup[]
  results: GameResult[]
  teams: TeamInfo[]
}

export function MatchupBoard({ matchups, results: initialResults, teams }: Props) {
  const [results, setResults] = useState<GameResult[]>(initialResults)
  const [pending, setPending] = useState<string | null>(null) // matchup id being submitted
  const [error, setError] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const teamMap = new Map(teams.map(t => [t.id, t]))

  // Group matchups by day
  const days = [...new Set(matchups.map(m => m.day))].sort((a, b) => a - b)

  function getResult(matchup: Matchup): GameResult | undefined {
    return results.find(r =>
      r.day === matchup.day &&
      ((r.winnerId === matchup.teamAId && r.loserId === matchup.teamBId) ||
       (r.winnerId === matchup.teamBId && r.loserId === matchup.teamAId))
    )
  }

  function matchupKey(m: Matchup) {
    return `${m.day}-${m.teamAId}-${m.teamBId}`
  }

  async function recordWinner(matchup: Matchup, winnerId: string) {
    const loserId = winnerId === matchup.teamAId ? matchup.teamBId : matchup.teamAId
    const key = matchupKey(matchup)

    // If already recorded with the same winner, do nothing
    const existing = getResult(matchup)
    if (existing && existing.winnerId === winnerId) return

    setPending(key)
    setError(null)

    try {
      // If there's an existing result with a different winner, delete it first
      if (existing) {
        const params = new URLSearchParams({
          day: String(existing.day),
          winnerId: existing.winnerId,
          loserId: existing.loserId,
        })
        await fetch(`/api/results?${params}`, { method: 'DELETE' })
      }

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: matchup.day, winnerId, loserId }),
      })

      if (!res.ok) throw new Error('Failed to record result')

      const data = await res.json()
      const winnerTeam = teamMap.get(winnerId)

      // Update local results state
      setResults(prev => {
        const filtered = prev.filter(r => !(
          r.day === matchup.day &&
          ((r.winnerId === matchup.teamAId && r.loserId === matchup.teamBId) ||
           (r.winnerId === matchup.teamBId && r.loserId === matchup.teamAId))
        ))
        return [...filtered, { day: matchup.day, winnerId, loserId }]
      })

      setLastAction(`${winnerTeam?.name ?? winnerId} wins — ${data.aliveCount} alive, ${data.eliminatedCount} out`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setPending(null)
    }
  }

  if (matchups.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">
        No matchups loaded yet. Paste matchups in chat to populate this board.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {lastAction && (
        <div className="text-sm text-green-400 bg-green-900/20 border border-green-900 rounded-lg px-3 py-2">
          {lastAction}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {days.map(day => {
        const dayMatchups = matchups.filter(m => m.day === day)
        const resolved = dayMatchups.filter(m => getResult(m)).length
        return (
          <div key={day}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Day {day}</h3>
              <span className="text-xs text-gray-500">
                {resolved}/{dayMatchups.length} resolved
              </span>
            </div>
            <div className="grid gap-2">
              {dayMatchups.map(matchup => {
                const result = getResult(matchup)
                const key = matchupKey(matchup)
                const isLoading = pending === key
                const teamA = teamMap.get(matchup.teamAId)
                const teamB = teamMap.get(matchup.teamBId)

                return (
                  <div
                    key={key}
                    className={`flex items-stretch rounded-lg overflow-hidden border ${
                      result ? 'border-gray-700' : 'border-gray-800'
                    } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <TeamButton
                      team={teamA}
                      teamId={matchup.teamAId}
                      status={
                        result
                          ? result.winnerId === matchup.teamAId ? 'won' : 'lost'
                          : 'pending'
                      }
                      onClick={() => recordWinner(matchup, matchup.teamAId)}
                    />
                    <div className="flex items-center px-2 bg-gray-900 text-gray-600 text-xs font-medium">
                      vs
                    </div>
                    <TeamButton
                      team={teamB}
                      teamId={matchup.teamBId}
                      side="right"
                      status={
                        result
                          ? result.winnerId === matchup.teamBId ? 'won' : 'lost'
                          : 'pending'
                      }
                      onClick={() => recordWinner(matchup, matchup.teamBId)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TeamButton({
  team,
  teamId,
  side = 'left',
  status,
  onClick,
}: {
  team?: TeamInfo
  teamId: string
  side?: 'left' | 'right'
  status: 'pending' | 'won' | 'lost'
  onClick: () => void
}) {
  const name = team?.name ?? teamId
  const seed = team?.seed

  const bgClass =
    status === 'won'
      ? 'bg-green-900/40 hover:bg-green-900/60'
      : status === 'lost'
        ? 'bg-red-900/30 hover:bg-red-900/40'
        : 'bg-gray-800 hover:bg-gray-700'

  const textClass =
    status === 'won'
      ? 'text-green-300 font-semibold'
      : status === 'lost'
        ? 'text-red-400/60 line-through'
        : 'text-gray-200'

  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 ${bgClass} transition-colors cursor-pointer ${
        side === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <span className={textClass}>
        {seed && (
          <span className="text-xs text-gray-500 mr-1.5">[{seed}]</span>
        )}
        {name}
      </span>
      {status === 'won' && (
        <span className="ml-1.5 text-green-500 text-xs">W</span>
      )}
    </button>
  )
}
