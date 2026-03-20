import type { PoolData, GameResult, Entry } from '@/types'
// requiredWins is stored on each pick — no need to recompute from schedule

/**
 * Process a game result and update entry statuses.
 * Returns the updated PoolData.
 */
export function applyResult(data: PoolData, result: GameResult): PoolData {
  const { day, winnerId, loserId } = result

  // Add result if not already recorded
  const alreadyRecorded = data.results.some(
    r => r.day === day && r.winnerId === winnerId && r.loserId === loserId
  )
  const results = alreadyRecorded ? data.results : [...data.results, result]

  // Determine all winners on this day so far
  const dayWinners = new Set(
    results.filter(r => r.day === day).map(r => r.winnerId)
  )
  const dayLosers = new Set(
    results.filter(r => r.day === day).map(r => r.loserId)
  )

  // Update pick statuses and entry alive status
  const picks = data.picks.map(pick => {
    if (pick.day !== day || pick.status !== 'pending') return pick

    const entry = data.entries.find(e => e.id === pick.entryId)
    if (!entry || !entry.isAlive) return pick

    const required = pick.requiredWins
    const wins = pick.teamIds.filter(id => dayWinners.has(id)).length
    const remaining = pick.teamIds.filter(id => !dayWinners.has(id) && !dayLosers.has(id)).length

    // Check if it's impossible to get required wins
    const maxPossibleWins = wins + remaining
    if (maxPossibleWins < required) {
      return { ...pick, status: 'eliminated' as const }
    }

    // Check if they already have required wins
    if (wins >= required) {
      return { ...pick, status: 'correct' as const }
    }

    return pick
  })

  // Update entry alive status based on picks
  const entries: Entry[] = data.entries.map(entry => {
    if (!entry.isAlive) return entry

    const dayPick = picks.find(p => p.entryId === entry.id && p.day === day)
    if (!dayPick) return entry // no pick for this day, survival unclear

    if (dayPick.status === 'eliminated') {
      return { ...entry, isAlive: false, eliminatedOnDay: day }
    }

    return entry
  })

  return { entries, picks, results, matchups: data.matchups }
}

/**
 * Recompute all elimination statuses from scratch based on all results.
 */
export function recomputeAllStatuses(data: PoolData): PoolData {
  // Reset all entries to alive, reset pick statuses to pending
  let current: PoolData = {
    ...data,
    entries: data.entries.map(e => ({
      ...e,
      isAlive: true,
      eliminatedOnDay: undefined,
    })),
    picks: data.picks.map(p => ({ ...p, status: 'pending' as const })),
    results: [],
    matchups: data.matchups,
  }

  // Sort results by day and apply in order
  const sortedResults = [...data.results].sort((a, b) => a.day - b.day)
  for (const result of sortedResults) {
    current = applyResult(current, result)
  }

  return current
}
