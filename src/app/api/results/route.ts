import { NextRequest, NextResponse } from 'next/server'
import { readPool, writePool } from '@/lib/data/store'
import { applyResult, applyRule8, recomputeAllStatuses } from '@/lib/engine/elimination'
import type { GameResult } from '@/types'

export async function GET() {
  const data = readPool()
  return NextResponse.json(data.results)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { day, winnerId, loserId } = body as GameResult

  if (!day || !winnerId || !loserId) {
    return NextResponse.json(
      { error: 'day, winnerId, loserId required' },
      { status: 400 }
    )
  }

  const current = readPool()
  const afterResult = applyResult(current, { day, winnerId, loserId })
  const updated = applyRule8(afterResult)
  writePool(updated)

  const aliveCount = updated.entries.filter(e => e.isAlive).length
  const eliminatedCount = updated.entries.filter(e => !e.isAlive).length

  return NextResponse.json({
    success: true,
    aliveCount,
    eliminatedCount,
  })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const day = Number(searchParams.get('day'))
  const winnerId = searchParams.get('winnerId') ?? ''
  const loserId = searchParams.get('loserId') ?? ''

  const current = readPool()
  const filteredResults = current.results.filter(
    r => !(r.day === day && r.winnerId === winnerId && r.loserId === loserId)
  )
  const recomputed = recomputeAllStatuses({ ...current, results: filteredResults })
  writePool(recomputed)

  return NextResponse.json({ success: true })
}
