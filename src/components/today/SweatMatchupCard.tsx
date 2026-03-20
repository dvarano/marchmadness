'use client'

import { useState } from 'react'
import type { SweatMatchup, SweatTeam } from '@/types'
import { cn, pct, seedBgClass } from '@/lib/utils'

interface Props {
  matchup: SweatMatchup
  totalAlive: number
}

function TeamSide({ team, isWinner, isLoser }: { team: SweatTeam; isWinner: boolean; isLoser: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn(
      'flex-1 rounded-lg p-3 border',
      isWinner && 'border-green-700 bg-green-950/30',
      isLoser && 'border-red-700 bg-red-950/30',
      !isWinner && !isLoser && 'border-gray-700 bg-gray-800/50',
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className={cn('w-5 h-5 rounded text-center text-xs leading-5 font-bold shrink-0', seedBgClass(team.seed))}>
          {team.seed}
        </span>
        <span className="font-semibold text-white text-sm truncate">{team.teamName}</span>
        {isWinner && <span className="text-green-400 text-xs font-bold">W</span>}
        {isLoser && <span className="text-red-400 text-xs font-bold">L</span>}
      </div>
      <div className="text-xs text-gray-400">{team.region}</div>
      <div className="mt-2">
        <span className={cn(
          'text-lg font-bold',
          team.pickCount > 0 ? 'text-orange-400' : 'text-gray-600',
        )}>
          {team.pickCount}
        </span>
        <span className="text-xs text-gray-400 ml-1">
          {team.pickCount === 1 ? 'entry' : 'entries'} ({pct(team.fieldRate)})
        </span>
      </div>
      {team.entries.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? '▾ Hide names' : '▸ Show names'}
          </button>
          {expanded && (
            <div className="mt-1 flex flex-wrap gap-1">
              {team.entries.map(e => (
                <span
                  key={e.id}
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    isLoser ? 'bg-red-900/50 text-red-300' : 'bg-gray-700 text-gray-300',
                  )}
                >
                  {e.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SweatMatchupCard({ matchup }: Props) {
  const { teamA, teamB, resolved, winnerId, sweatScore, totalAtStake } = matchup

  return (
    <div className={cn(
      'bg-gray-900 border rounded-xl p-4',
      resolved ? 'border-gray-700' : 'border-orange-800/50',
    )}>
      {/* Sweat bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {!resolved && (
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          )}
          <span className="text-xs text-gray-400">
            {totalAtStake} {totalAtStake === 1 ? 'entry' : 'entries'} at stake
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sweat</span>
          <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                sweatScore > 0.3 ? 'bg-red-500' : sweatScore > 0.15 ? 'bg-orange-500' : 'bg-yellow-500',
              )}
              style={{ width: `${Math.min(sweatScore * 100, 100)}%` }}
            />
          </div>
          <span className={cn(
            'text-xs font-bold',
            sweatScore > 0.3 ? 'text-red-400' : sweatScore > 0.15 ? 'text-orange-400' : 'text-yellow-400',
          )}>
            {pct(sweatScore)}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex gap-3">
        <TeamSide
          team={teamA}
          isWinner={resolved && winnerId === teamA.teamId}
          isLoser={resolved && winnerId !== teamA.teamId}
        />
        <div className="flex items-center">
          <span className="text-gray-600 text-xs font-bold">VS</span>
        </div>
        {teamB ? (
          <TeamSide
            team={teamB}
            isWinner={resolved && winnerId === teamB.teamId}
            isLoser={resolved && winnerId !== teamB.teamId}
          />
        ) : (
          <div className="flex-1 rounded-lg p-3 border border-gray-800 bg-gray-800/30 flex items-center justify-center">
            <span className="text-gray-600 text-xs">Opponent TBD</span>
          </div>
        )}
      </div>
    </div>
  )
}
