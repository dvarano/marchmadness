import type { PoolData, DaySummary } from '@/types'
import { SCHEDULE } from '@/lib/data/schedule'

export function computeSurvivalFunnel(data: PoolData): DaySummary[] {
  const funnel: DaySummary[] = []
  let prevSurvivors = data.entries.length

  for (const schedDay of SCHEDULE) {
    const { day } = schedDay

    const dayPicks = data.picks.filter(p => p.day === day)

    // Rule 8 eliminations: entries marked eliminated on this day with no pick
    // (they ran out of viable teams and never submitted a pick).
    const rule8Eliminated = data.entries.filter(
      e => e.eliminatedOnDay === day && !dayPicks.some(p => p.entryId === e.id)
    ).length

    // Only include days that have picks or Rule 8 eliminations
    if (dayPicks.length === 0 && rule8Eliminated === 0) continue

    // Count eliminations from pick status (survives buyback clearing
    // eliminatedOnDay) plus Rule 8 entries with no pick on this day.
    const eliminated =
      dayPicks.filter(p => p.status === 'eliminated').length + rule8Eliminated

    // Buybacks on this day: entries whose pick count exceeds basePicks for the day
    const buybacksOnDay = dayPicks.filter(p => {
      return p.teamIds.length > schedDay.basePicks
    }).length

    // Start of day = previous survivors + buybacks joining this day
    const aliveAtStart = prevSurvivors + buybacksOnDay
    const survivors = aliveAtStart - eliminated

    // Day is complete when no picks are still pending
    const complete = dayPicks.every(p => p.status !== 'pending')

    funnel.push({
      day,
      startCount: aliveAtStart,
      survivors,
      eliminated,
      buybacks: buybacksOnDay,
      survivalRate: aliveAtStart > 0 ? survivors / aliveAtStart : 0,
      complete,
    })

    prevSurvivors = survivors
  }

  return funnel
}

export function getAliveCount(data: PoolData): number {
  return data.entries.filter(e => e.isAlive).length
}
