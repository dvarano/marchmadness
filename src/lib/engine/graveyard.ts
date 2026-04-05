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
/** Synthetic team ID for Rule 8 eliminations (entries with no valid pick). */
export const RULE8_SEGMENT_ID = '__rule8__'

export function computeGraveyard(data: PoolData): GraveyardDay[] {
  const days: GraveyardDay[] = []

  // Use pick status to find eliminations (survives buyback clearing eliminatedOnDay)
  const eliminatedPicks = data.picks.filter(p => p.status === 'eliminated')

  // Rule 8 eliminations: entries marked eliminated on a day with no pick.
  // Count per day so they can be shown as their own segment.
  const rule8ByDay = new Map<number, number>()
  for (const entry of data.entries) {
    if (entry.eliminatedOnDay === undefined) continue
    const day = entry.eliminatedOnDay
    const hasPick = data.picks.some(p => p.entryId === entry.id && p.day === day)
    if (hasPick) continue
    rule8ByDay.set(day, (rule8ByDay.get(day) ?? 0) + 1)
  }

  if (eliminatedPicks.length === 0 && rule8ByDay.size === 0) return []

  const dayLosers = new Map<number, Set<string>>()
  for (const result of data.results) {
    if (!dayLosers.has(result.day)) dayLosers.set(result.day, new Set())
    dayLosers.get(result.day)!.add(result.loserId)
  }

  const maxDay = Math.max(
    ...eliminatedPicks.map(p => p.day),
    ...[...rule8ByDay.keys()],
  )

  for (let d = 1; d <= maxDay; d++) {
    const dayElimPicks = eliminatedPicks.filter(p => p.day === d)
    const rule8Count = rule8ByDay.get(d) ?? 0
    if (dayElimPicks.length === 0 && rule8Count === 0) continue

    const losersOnDay = dayLosers.get(d) ?? new Set<string>()
    const segmentCounts = new Map<string, number>()

    for (const pick of dayElimPicks) {
      // Find the first picked team that lost on this day
      const causeTeamId = pick.teamIds.find(tid => losersOnDay.has(tid))
      if (causeTeamId) {
        segmentCounts.set(causeTeamId, (segmentCounts.get(causeTeamId) ?? 0) + 1)
      }
    }

    if (rule8Count > 0) {
      segmentCounts.set(RULE8_SEGMENT_ID, rule8Count)
    }

    const segments: GraveyardSegment[] = [...segmentCounts.entries()]
      .map(([teamId, count]) => {
        if (teamId === RULE8_SEGMENT_ID) {
          return { teamId, teamName: 'No valid pick', seed: 0, count }
        }
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
      totalEliminated: dayElimPicks.length + rule8Count,
      segments,
    })
  }

  return days
}
