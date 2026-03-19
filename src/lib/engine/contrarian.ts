import type { PoolData } from '@/types'

export interface ContrarianRow {
  entryId: string
  entryName: string
  score: number
  pickDetails: Array<{
    day: number
    teamId: string
    fieldRate: number
    contrarianScore: number
  }>
}

/**
 * Contrarian score = average of (1 - fieldPickRate) for each pick,
 * weighted toward later days (day weight = day number).
 */
export function computeContrarianScores(data: PoolData): ContrarianRow[] {
  const aliveEntries = data.entries.filter(e => e.isAlive)

  // Build field pick rates per (day, teamId) across all alive entries
  const fieldRates = new Map<string, number>() // "day:teamId" -> rate
  const maxDay = Math.max(...data.picks.map(p => p.day), 0)

  for (let d = 1; d <= maxDay; d++) {
    const dayAliveIds = new Set(
      data.entries
        .filter(e => e.isAlive || (e.eliminatedOnDay !== undefined && e.eliminatedOnDay > d))
        .map(e => e.id)
    )
    const dayPicksAlive = data.picks.filter(p => p.day === d && dayAliveIds.has(p.entryId))
    const totalOnDay = dayPicksAlive.length

    if (totalOnDay === 0) continue

    const teamCounts = new Map<string, number>()
    for (const pick of dayPicksAlive) {
      for (const teamId of pick.teamIds) {
        teamCounts.set(teamId, (teamCounts.get(teamId) ?? 0) + 1)
      }
    }

    for (const [teamId, count] of teamCounts) {
      fieldRates.set(`${d}:${teamId}`, count / totalOnDay)
    }
  }

  const rows: ContrarianRow[] = []

  for (const entry of aliveEntries) {
    const entryPicks = data.picks.filter(p => p.entryId === entry.id)
    let weightedSum = 0
    let totalWeight = 0
    const pickDetails: ContrarianRow['pickDetails'] = []

    for (const pick of entryPicks) {
      const dayWeight = pick.day
      for (const teamId of pick.teamIds) {
        const fieldRate = fieldRates.get(`${pick.day}:${teamId}`) ?? 0
        const score = 1 - fieldRate
        weightedSum += score * dayWeight
        totalWeight += dayWeight
        pickDetails.push({ day: pick.day, teamId, fieldRate, contrarianScore: score })
      }
    }

    rows.push({
      entryId: entry.id,
      entryName: entry.name,
      score: totalWeight > 0 ? weightedSum / totalWeight : 0,
      pickDetails,
    })
  }

  return rows.sort((a, b) => b.score - a.score)
}
