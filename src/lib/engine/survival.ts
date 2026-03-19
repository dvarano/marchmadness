import type { PoolData, DaySummary } from '@/types'
import { SCHEDULE } from '@/lib/data/schedule'

export function computeSurvivalFunnel(data: PoolData): DaySummary[] {
  const funnel: DaySummary[] = []

  for (const schedDay of SCHEDULE) {
    const { day } = schedDay

    // Only include days that have at least some picks recorded
    const dayPicks = data.picks.filter(p => p.day === day)
    if (dayPicks.length === 0) continue

    const eliminated = data.entries.filter(
      e => e.eliminatedOnDay === day
    ).length

    // Buybacks on this day: entries whose pick count exceeds basePicks for the day
    const buybacksOnDay = dayPicks.filter(p => {
      const basePicks = schedDay.basePicks
      return p.teamIds.length > basePicks
    }).length

    // Alive at start of day = those who haven't been eliminated before this day
    const aliveAtStart = data.entries.filter(
      e => e.isAlive || (e.eliminatedOnDay !== undefined && e.eliminatedOnDay >= day)
    ).length

    const survivors = aliveAtStart - eliminated

    funnel.push({
      day,
      startCount: aliveAtStart,
      survivors,
      eliminated,
      buybacks: buybacksOnDay,
      survivalRate: aliveAtStart > 0 ? survivors / aliveAtStart : 0,
    })
  }

  return funnel
}

export function getAliveCount(data: PoolData): number {
  return data.entries.filter(e => e.isAlive).length
}
