import { distance } from 'fastest-levenshtein'
import { TEAMS } from '@/lib/data/teams'
import type { Team } from '@/types'

const THRESHOLD = 3

export function normalizeTeamName(input: string): Team | null {
  const query = input.trim().toLowerCase()
  if (!query) return null

  let best: Team | null = null
  let bestDist = Infinity

  for (const team of TEAMS) {
    const candidates = [
      team.name,
      ...team.aliases,
      team.name.replace(/\./g, ''),
      team.name.replace(/st\./gi, 'state'),
    ]

    for (const candidate of candidates) {
      const d = distance(query, candidate.toLowerCase())
      if (d < bestDist) {
        bestDist = d
        best = team
      }
    }
  }

  if (bestDist <= THRESHOLD) return best
  return null
}

export function fuzzyMatchTeams(names: string[]): Array<{ input: string; team: Team | null }> {
  return names.map(input => ({ input, team: normalizeTeamName(input) }))
}
