import type { PoolData, SweatMatchup, SweatMeterResult, SweatTeam } from '@/types'
import { getTeamById, TEAMS } from '@/lib/data/teams'
import { getScheduleDay } from '@/lib/data/schedule'
import type { Seed } from '@/types'

/**
 * Fallback for Round 1: seed X plays seed (17 - X) in the same region.
 */
function getRound1Opponent(teamId: string): string | undefined {
  const team = getTeamById(teamId)
  if (!team) return undefined
  const oppSeed = (17 - team.seed) as Seed
  const opp = TEAMS.find(t => t.region === team.region && t.seed === oppSeed)
  return opp?.id
}

/**
 * Build the sweat meter: game-by-game view of today's action.
 *
 * Uses explicit matchups from pool.json when available.
 * Falls back to Round 1 bracket math if no matchups are stored.
 */
export function computeSweatMeter(data: PoolData, day: number): SweatMeterResult {
  const schedDay = getScheduleDay(day)
  const dayLabel = schedDay?.label ?? `Day ${day}`
  // Use entries alive at START of day (includes entries eliminated today)
  const aliveAtDayStart = data.entries.filter(
    e => e.isAlive || (e.eliminatedOnDay !== undefined && e.eliminatedOnDay >= day)
  )
  const totalAlive = aliveAtDayStart.length
  const aliveIds = new Set(aliveAtDayStart.map(e => e.id))
  const dayPicks = data.picks.filter(p => p.day === day && aliveIds.has(p.entryId))
  const dayResults = data.results.filter(r => r.day === day)
  const dayMatchups = data.matchups.filter(m => m.day === day)

  if (totalAlive === 0 || dayPicks.length === 0) {
    return { day, dayLabel, totalAlive, matchups: [] }
  }

  // Track which teams were picked and by whom
  const teamEntries = new Map<string, { id: string; name: string }[]>()
  for (const pick of dayPicks) {
    for (const teamId of pick.teamIds) {
      if (!teamEntries.has(teamId)) teamEntries.set(teamId, [])
      const entry = aliveAtDayStart.find(e => e.id === pick.entryId)
      if (entry) teamEntries.get(teamId)!.push({ id: entry.id, name: entry.name })
    }
  }

  // Determine win/loss status for each team on this day
  const winners = new Set(dayResults.map(r => r.winnerId))
  const losers = new Set(dayResults.map(r => r.loserId))

  function buildSweatTeam(teamId: string): SweatTeam | null {
    const team = getTeamById(teamId)
    if (!team) return null
    const entries = teamEntries.get(teamId) ?? []
    return {
      teamId,
      teamName: team.name,
      seed: team.seed,
      region: team.region,
      status: winners.has(teamId) ? 'won' : losers.has(teamId) ? 'lost' : 'pending',
      pickCount: entries.length,
      entries,
      fieldRate: totalAlive > 0 ? entries.length / totalAlive : 0,
    }
  }

  const matchups: SweatMatchup[] = []
  const matchedTeams = new Set<string>()

  // Determine game pairings: prefer explicit matchups, fall back to bracket math
  const hasExplicitMatchups = dayMatchups.length > 0
  const gamePairings: Array<{ teamAId: string; teamBId: string }> = hasExplicitMatchups
    ? dayMatchups.map(m => ({ teamAId: m.teamAId, teamBId: m.teamBId }))
    : []

  // If no explicit matchups, build pairings from results + bracket math
  if (!hasExplicitMatchups) {
    // Add resolved games from results
    for (const result of dayResults) {
      if (!gamePairings.some(p =>
        (p.teamAId === result.winnerId && p.teamBId === result.loserId) ||
        (p.teamAId === result.loserId && p.teamBId === result.winnerId)
      )) {
        gamePairings.push({ teamAId: result.winnerId, teamBId: result.loserId })
      }
    }
    // Add bracket-math pairings for remaining picked teams
    const resultTeams = new Set(gamePairings.flatMap(p => [p.teamAId, p.teamBId]))
    const pickedTeamIds = [...teamEntries.keys()].filter(id => !resultTeams.has(id))
    const paired = new Set<string>()
    for (const teamId of pickedTeamIds) {
      if (paired.has(teamId)) continue
      const oppId = getRound1Opponent(teamId)
      if (oppId && !resultTeams.has(oppId) && !paired.has(oppId)) {
        gamePairings.push({ teamAId: teamId, teamBId: oppId })
        paired.add(teamId)
        paired.add(oppId)
      } else {
        // Solo — no known opponent
        gamePairings.push({ teamAId: teamId, teamBId: '' })
        paired.add(teamId)
      }
    }
  }

  // Build SweatMatchup for each pairing
  for (const pairing of gamePairings) {
    const teamA = buildSweatTeam(pairing.teamAId)
    if (!teamA) continue
    matchedTeams.add(pairing.teamAId)

    let teamB: SweatTeam | null = null
    if (pairing.teamBId) {
      teamB = buildSweatTeam(pairing.teamBId)
      matchedTeams.add(pairing.teamBId)
    }

    // Check if this game is resolved via results
    const result = dayResults.find(r =>
      (r.winnerId === pairing.teamAId && r.loserId === pairing.teamBId) ||
      (r.winnerId === pairing.teamBId && r.loserId === pairing.teamAId)
    )

    const totalAtStake = teamA.pickCount + (teamB?.pickCount ?? 0)
    matchups.push({
      id: `${pairing.teamAId}-${pairing.teamBId || 'tbd'}`,
      teamA,
      teamB,
      resolved: !!result,
      winnerId: result?.winnerId,
      sweatScore: totalAlive > 0 ? totalAtStake / totalAlive : 0,
      totalAtStake,
    })
  }

  // Sort: unresolved first (most at stake), then resolved
  matchups.sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
    return b.totalAtStake - a.totalAtStake
  })

  return { day, dayLabel, totalAlive, matchups }
}
