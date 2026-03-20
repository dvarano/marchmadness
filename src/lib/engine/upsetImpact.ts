import type { PoolData } from '@/types'
import { getTeamById } from '@/lib/data/teams'

export interface UpsetImpactRow {
  teamId: string
  teamName: string
  seed: number
  region: string
  pickCount: number
  fieldPickRate: number
  eliminatedIfLose: number
  eliminatedIfLoseRate: number
  atRiskIfLose: number
}

/**
 * For each team picked today by alive entries, compute:
 * - How many entries get eliminated immediately if this team loses
 * - How many are "at risk" (need other picks to survive)
 */
export function computeUpsetImpact(data: PoolData, day: number): UpsetImpactRow[] {
  // Use entries alive at START of day (includes entries eliminated today)
  const aliveAtDayStart = new Set(
    data.entries
      .filter(e => e.isAlive || (e.eliminatedOnDay !== undefined && e.eliminatedOnDay >= day))
      .map(e => e.id)
  )
  const dayPicks = data.picks.filter(p => p.day === day && aliveAtDayStart.has(p.entryId))
  const totalAlive = aliveAtDayStart.size

  if (totalAlive === 0 || dayPicks.length === 0) return []

  // Collect all teams picked today by alive entries
  const teamPickCounts = new Map<string, string[]>() // teamId -> entryIds
  for (const pick of dayPicks) {
    for (const teamId of pick.teamIds) {
      if (!teamPickCounts.has(teamId)) teamPickCounts.set(teamId, [])
      teamPickCounts.get(teamId)!.push(pick.entryId)
    }
  }

  const rows: UpsetImpactRow[] = []

  for (const [teamId, entryIds] of teamPickCounts) {
    const team = getTeamById(teamId)
    if (!team) continue

    let eliminatedIfLose = 0
    let atRiskIfLose = 0

    for (const entryId of entryIds) {
      const entry = data.entries.find(e => e.id === entryId)
      if (!entry) continue

      const pick = dayPicks.find(p => p.entryId === entryId)
      if (!pick) continue

      const otherTeams = pick.teamIds.filter(id => id !== teamId)
      const required = pick.requiredWins

      // If losing this team means they can't get required wins
      const maxWinsWithoutThisTeam = otherTeams.length
      if (maxWinsWithoutThisTeam < required) {
        eliminatedIfLose++
      } else if (maxWinsWithoutThisTeam === required) {
        atRiskIfLose++ // need all other picks to win
      }
    }

    rows.push({
      teamId,
      teamName: team.name,
      seed: team.seed,
      region: team.region,
      pickCount: entryIds.length,
      fieldPickRate: entryIds.length / totalAlive,
      eliminatedIfLose,
      eliminatedIfLoseRate: eliminatedIfLose / totalAlive,
      atRiskIfLose,
    })
  }

  return rows.sort((a, b) => b.eliminatedIfLoseRate - a.eliminatedIfLoseRate)
}
