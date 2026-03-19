import type { ScheduleDay } from '@/types'

export const SCHEDULE: ScheduleDay[] = [
  { day: 1, label: 'Day 1 – R1 Thu', round: 'Round 1', date: '2026-03-19', basePicks: 2 },
  { day: 2, label: 'Day 2 – R1 Fri', round: 'Round 1', date: '2026-03-20', basePicks: 2 },
  { day: 3, label: 'Day 3 – R2 Sat', round: 'Round 2', date: '2026-03-21', basePicks: 1 },
  { day: 4, label: 'Day 4 – R2 Sun', round: 'Round 2', date: '2026-03-22', basePicks: 1 },
  { day: 5, label: 'Day 5 – S16 Thu', round: 'Sweet 16', date: '2026-03-26', basePicks: 1 },
  { day: 6, label: 'Day 6 – S16 Fri', round: 'Sweet 16', date: '2026-03-27', basePicks: 1 },
  { day: 7, label: 'Day 7 – E8 Sat', round: 'Elite 8', date: '2026-03-28', basePicks: 1 },
  { day: 8, label: 'Day 8 – E8 Sun', round: 'Elite 8', date: '2026-03-29', basePicks: 1 },
  { day: 9, label: 'Day 9 – FF Sat', round: 'Final Four', date: '2026-04-04', basePicks: 1 },
  { day: 10, label: 'Day 10 – Champ', round: 'Championship', date: '2026-04-06', basePicks: 1 },
]

export function getScheduleDay(day: number): ScheduleDay | undefined {
  return SCHEDULE.find(d => d.day === day)
}

/**
 * @deprecated Incorrect — carried buyback penalty to all future days.
 * Use `teamIds.length` as requiredWins instead (all submitted picks must win).
 */
export function requiredPicksForEntry(day: number, buybacks: number): number {
  const schedDay = getScheduleDay(day)
  if (!schedDay) return 0
  return schedDay.basePicks + buybacks
}

export const MAX_BUYBACK_DAY = 4
