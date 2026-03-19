import { NextRequest, NextResponse } from 'next/server'
import { readPool, updatePool } from '@/lib/data/store'
import { parsePastedPicks } from '@/lib/csv/parser'
import { getScheduleDay } from '@/lib/data/schedule'
import type { DayPick } from '@/types'
import { nanoid } from '@/lib/utils'

export async function GET() {
  const data = readPool()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { raw, day } = body as { raw: string; day: number }

  if (!raw || !day) {
    return NextResponse.json({ error: 'raw and day required' }, { status: 400 })
  }

  const { picks: parsed, errors } = parsePastedPicks(raw)

  if (parsed.length === 0) {
    return NextResponse.json({ error: 'No valid picks parsed', errors }, { status: 400 })
  }

  const unmatched: string[] = []
  const updated = updatePool(data => {
    let { entries, picks } = data

    for (const parsed_pick of parsed) {
      // Find or create entry
      let entry = entries.find(
        e => e.name.toLowerCase() === parsed_pick.rawName.toLowerCase()
      )

      if (!entry) {
        entry = {
          id: `entry-${nanoid()}`,
          name: parsed_pick.rawName,
          buybacks: 0,
          isAlive: true,
        }
        entries = [...entries, entry]
      }

      // Check team matches
      const teamIds: string[] = []
      for (const { input, team } of parsed_pick.teams) {
        if (!team) {
          unmatched.push(`"${input}" (${parsed_pick.rawName})`)
        } else {
          teamIds.push(team.id)
        }
      }

      // Detect buybacks: more picks than basePicks = bought back this day
      const schedDay = getScheduleDay(day)
      const basePicks = schedDay?.basePicks ?? 1

      if (teamIds.length > basePicks) {
        entry = { ...entry, buybacks: entry.buybacks + 1 }
        entries = entries.map(e => e.id === entry!.id ? entry! : e)
      }

      // All submitted picks must win (per rules)
      const requiredWins = teamIds.length

      // Remove existing picks for this entry+day
      picks = picks.filter(p => !(p.entryId === entry!.id && p.day === day))

      const dayPick: DayPick = {
        entryId: entry.id,
        day,
        teamIds,
        requiredWins,
        status: 'pending',
      }
      picks = [...picks, dayPick]
    }

    return { ...data, entries, picks }
  })

  return NextResponse.json({
    success: true,
    entriesProcessed: parsed.length,
    unmatched,
    errors,
    data: updated,
  })
}
