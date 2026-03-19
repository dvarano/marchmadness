import { normalizeTeamName } from '@/lib/csv/normalizer'
import type { Team } from '@/types'

export interface ParsedPick {
  rawName: string
  teams: Array<{ input: string; team: Team | null }>
}

export interface ParseResult {
  picks: ParsedPick[]
  errors: string[]
}

/**
 * Parse pasted picks in the format:
 * Alice- Duke, Kentucky
 * Bob- Kansas, Gonzaga
 */
export function parsePastedPicks(raw: string): ParseResult {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const picks: ParsedPick[] = []
  const errors: string[] = []

  for (const line of lines) {
    // Support "username- team1, team2" or "username: team1, team2"
    const sepIdx = line.search(/[-:]/)
    if (sepIdx === -1) {
      errors.push(`Could not parse line: "${line}"`)
      continue
    }

    const rawName = line.slice(0, sepIdx).trim()
    const teamsRaw = line.slice(sepIdx + 1).trim()

    if (!rawName) {
      errors.push(`Empty name in line: "${line}"`)
      continue
    }

    const teamNames = teamsRaw.split(',').map(t => t.trim()).filter(Boolean)
    const teams = teamNames.map(input => ({
      input,
      team: normalizeTeamName(input),
    }))

    picks.push({ rawName, teams })
  }

  return { picks, errors }
}
