export type Seed = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
export type Region = 'East' | 'West' | 'South' | 'Midwest'

export interface Team {
  id: string
  name: string
  seed: Seed
  region: Region
  aliases: string[]
}

export interface Entry {
  id: string
  name: string
  buybacks: number
  isAlive: boolean
  eliminatedOnDay?: number
}

export interface DayPick {
  entryId: string
  day: number
  teamIds: string[]
  requiredWins: number
  status: 'pending' | 'correct' | 'eliminated'
}

export interface GameResult {
  day: number
  winnerId: string
  loserId: string
}

export interface PoolData {
  entries: Entry[]
  picks: DayPick[]
  results: GameResult[]
}

export interface DaySummary {
  day: number
  startCount: number
  survivors: number
  eliminated: number
  buybacks: number
  survivalRate: number
}

export interface ScheduleDay {
  day: number
  label: string
  round: string
  date: string
  basePicks: number
}
