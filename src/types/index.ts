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

export interface Matchup {
  day: number
  teamAId: string
  teamBId: string
}

export interface PoolData {
  entries: Entry[]
  picks: DayPick[]
  results: GameResult[]
  matchups: Matchup[]
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

// ── Effective Runway ────────────────────────────────────────────────────────

export interface RunwayRow {
  entryId: string
  entryName: string
  isAlive: boolean
  teamsUsed: number
  teamsAvailableRaw: number     // 64 - teamsUsed (old metric)
  teamsStillInTourney: number   // teams not yet eliminated from tournament
  viableTeams: number           // available AND still in tourney
  eliminatedFromTourney: number // available but knocked out of tourney
}

// ── Sweat Meter ─────────────────────────────────────────────────────────────

export interface SweatTeam {
  teamId: string
  teamName: string
  seed: number
  region: string
  status: 'pending' | 'won' | 'lost'
  pickCount: number
  entries: { id: string; name: string }[]
  fieldRate: number
}

export interface SweatMatchup {
  id: string
  teamA: SweatTeam
  teamB: SweatTeam | null
  resolved: boolean
  winnerId?: string
  sweatScore: number    // % of alive field at stake in this game
  totalAtStake: number  // total entries riding on either side
}

export interface SweatMeterResult {
  day: number
  dayLabel: string
  totalAlive: number
  matchups: SweatMatchup[]
}

// ── Graveyard / Elimination Timeline ────────────────────────────────────────

export interface GraveyardSegment {
  teamId: string
  teamName: string
  seed: number
  count: number
}

export interface GraveyardDay {
  day: number
  label: string
  totalEliminated: number
  segments: GraveyardSegment[]
}
