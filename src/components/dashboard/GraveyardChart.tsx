'use client'

import { useState } from 'react'
import type { GraveyardDay } from '@/types'
import { ExportCard } from '@/components/ExportCard'

interface Props {
  data: GraveyardDay[]
}

// Distinct colors that are easy to tell apart on a dark background
const SEGMENT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#a855f7', // purple
  '#84cc16', // lime
]

export function GraveyardChart({ data }: Props) {
  const [hovered, setHovered] = useState<{ day: number; segIdx: number } | null>(null)
  if (data.length === 0) return null

  const maxEliminated = Math.max(...data.map(d => d.totalEliminated))

  return (
    <ExportCard title="Elimination Timeline">
      <p className="text-sm text-gray-400 mb-4">
        Entries eliminated per day, colored by which team loss caused them.
      </p>

      <div className="space-y-3">
        {data.map(day => {
          const label = day.label.replace(/Day \d+ – /, '')
          return (
            <div key={day.day} className="flex items-center gap-3">
              {/* Day label */}
              <div className="w-16 text-xs text-gray-400 text-right shrink-0">{label}</div>

              {/* Stacked bar */}
              <div className="flex-1 flex items-center gap-px" style={{ height: 28 }}>
                {day.segments.map((seg, i) => {
                  const widthPct = (seg.count / maxEliminated) * 100
                  const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
                  const isHovered = hovered?.day === day.day && hovered?.segIdx === i
                  return (
                    <div
                      key={seg.teamId}
                      className="h-full relative cursor-default transition-opacity"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: color,
                        opacity: hovered && !isHovered ? 0.4 : 1,
                        borderRadius: i === 0 ? '4px 0 0 4px' : i === day.segments.length - 1 ? '0 4px 4px 0' : 0,
                      }}
                      onMouseEnter={() => setHovered({ day: day.day, segIdx: i })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Inline label for large segments */}
                      {widthPct > 12 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/90 truncate px-1">
                          {seg.count}
                        </span>
                      )}
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap
                                        bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none">
                          <span className="text-white font-medium">({seg.seed}) {seg.teamName}</span>
                          <span className="text-red-400 ml-2">{seg.count} eliminated</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="w-8 text-xs text-gray-400 text-right shrink-0">{day.totalEliminated}</div>
            </div>
          )
        })}
      </div>

      {/* Day narratives */}
      <div className="mt-4 space-y-1">
        {data.map(day => {
          if (day.totalEliminated === 0) return null
          const topCause = day.segments[0]
          if (!topCause) return null
          return (
            <div key={day.day} className="text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{day.label}:</span>{' '}
              {day.totalEliminated} eliminated
              {topCause.count > 1 && (
                <> — {topCause.teamName}&apos;s loss took out {topCause.count}</>
              )}
            </div>
          )
        })}
      </div>
    </ExportCard>
  )
}
