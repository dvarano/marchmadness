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
 * Rule 8: Eliminate alive entries that ran out of valid picks.
 *
 * An entry is Rule 8 eliminated on the earliest started day D where:
 *   - day D has at least one game result (day has been played),
 *   - the entry has no pick recorded on day D, AND
 *   - every team that played on day D had already been used by that entry
 *     (no viable pick was available to them).
 *
 * The set of teams playing on day D is derived from `matchups`, so this
 * correctly handles the case where an entry can't even field a valid pick
 * at the start of the day.
 */
export function applyRule8(data: PoolData): PoolData {
  // day -> set of team IDs playing that day (from matchups)
  const dayTeams = new Map<number, Set<string>>()
  for (const m of data.matchups) {
    if (!dayTeams.has(m.day)) dayTeams.set(m.day, new Set())
    const set = dayTeams.get(m.day)!
    set.add(m.teamAId)
    set.add(m.teamBId)
  }

  // Only consider days that have actually started (at least one result)
  const startedDays = new Set(data.results.map(r => r.day))
  const playedDays = [...dayTeams.keys()]
    .filter(d => startedDays.has(d))
    .sort((a, b) => a - b)

  const entries = data.entries.map(entry => {
    if (!entry.isAlive) return entry

    const teamsUsed = new Set(
      data.picks.filter(p => p.entryId === entry.id).flatMap(p => p.teamIds)
    )

    for (const day of playedDays) {
      const hasPick = data.picks.some(p => p.entryId === entry.id && p.day === day)
      if (hasPick) continue
      const teamsThisDay = dayTeams.get(day)!
      const hasViable = [...teamsThisDay].some(tid => !teamsUsed.has(tid))
      if (!hasViable) {
        return { ...entry, isAlive: false, eliminatedOnDay: day }
      }
    }
    return entry
  })

  return { ...data, entries }
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

  // Finally, eliminate any alive entry that couldn't field a valid pick
  // on a played day (Rule 8).
  current = applyRule8(current)

  return current
}
