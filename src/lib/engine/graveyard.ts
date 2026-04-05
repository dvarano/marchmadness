import type { PoolData, GraveyardDay, GraveyardSegment } from '@/types'
import { getTeamById } from '@/lib/data/teams'
import { SCHEDULE } from '@/lib/data/schedule'

/**
 * Build elimination timeline data for a stacked bar chart.
 * Each day shows how many entries were eliminated, broken down
 * by which losing team caused the elimination.
 *
 * Attribution rule: since requiredWins === teamIds.length (all must win),
 * any single loss eliminates an entry. We attribute to the first losing
 * team in the entry's pick list (deterministic ordering).
 */
export function computeGraveyard(data: PoolData): GraveyardDay[] {
  const days: GraveyardDay[] = []

  // Use pick status to find eliminations (survives buyback clearing eliminatedOnDay)
  const eliminatedPicks = data.picks.filter(p => p.status === 'eliminated')
  if (eliminatedPicks.length === 0) return []

  const dayLosers = new Map<number, Set<string>>()
  for (const result of data.results) {
    if (!dayLosers.has(result.day)) dayLosers.set(result.day, new Set())
    dayLosers.get(result.day)!.add(result.loserId)
  }

  const maxDay = Math.max(...eliminatedPicks.map(p => p.day))

  for (let d = 1; d <= maxDay; d++) {
    const dayElimPicks = eliminatedPicks.filter(p => p.day === d)
    if (dayElimPicks.length === 0) continue

    const losersOnDay = dayLosers.get(d) ?? new Set<string>()
    const segmentCounts = new Map<string, number>()

    for (const pick of dayElimPicks) {
      // Find the first picked team that lost on this day
      const causeTeamId = pick.teamIds.find(tid => losersOnDay.has(tid))
      if (causeTeamId) {
        segmentCounts.set(causeTeamId, (segmentCounts.get(causeTeamId) ?? 0) + 1)
      }
    }

    const segments: GraveyardSegment[] = [...segmentCounts.entries()]
      .map(([teamId, count]) => {
        const team = getTeamById(teamId)
        return {
          teamId,
          teamName: team?.name ?? teamId,
          seed: team?.seed ?? 0,
          count,
        }
      })
      .sort((a, b) => b.count - a.count)

    const schedDay = SCHEDULE.find(s => s.day === d)
    days.push({
      day: d,
      label: schedDay?.label ?? `Day ${d}`,
      totalEliminated: dayElimPicks.length,
      segments,
    })
  }

  return days
}
