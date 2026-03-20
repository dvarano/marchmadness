import type { PoolData, RunwayRow } from '@/types'
import { TEAMS } from '@/lib/data/teams'

/**
 * Returns the set of team IDs still alive in the tournament
 * (i.e., have NOT appeared as a loser in any game result).
 */
export function getTournamentAliveTeams(data: PoolData): Set<string> {
  const eliminated = new Set(data.results.map(r => r.loserId))
  return new Set(TEAMS.filter(t => !eliminated.has(t.id)).map(t => t.id))
}

/**
 * Compute effective runway for each alive entry.
 * "Available" teams = never used by this entry.
 * "Viable" teams = available AND still alive in the tournament.
 */
export function computeRunway(data: PoolData): RunwayRow[] {
  const tourneyAlive = getTournamentAliveTeams(data)
  const allTeamIds = new Set(TEAMS.map(t => t.id))

  return data.entries
    .filter(e => e.isAlive)
    .map(entry => {
      const teamsUsed = new Set(
        data.picks.filter(p => p.entryId === entry.id).flatMap(p => p.teamIds)
      )
      const available = new Set(
        [...allTeamIds].filter(id => !teamsUsed.has(id))
      )
      const viable = [...available].filter(id => tourneyAlive.has(id))
      const eliminatedFromTourney = available.size - viable.length

      return {
        entryId: entry.id,
        entryName: entry.name,
        isAlive: entry.isAlive,
        teamsUsed: teamsUsed.size,
        teamsAvailableRaw: available.size,
        teamsStillInTourney: tourneyAlive.size,
        viableTeams: viable.length,
        eliminatedFromTourney,
      }
    })
    .sort((a, b) => a.viableTeams - b.viableTeams)
}
