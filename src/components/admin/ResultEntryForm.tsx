'use client'

import { useState } from 'react'
import { TEAMS } from '@/lib/data/teams'
import { SCHEDULE } from '@/lib/data/schedule'

interface ResultLog {
  day: number
  winnerId: string
  loserId: string
  timestamp: string
}

export function ResultEntryForm() {
  const [day, setDay] = useState(1)
  const [winnerId, setWinnerId] = useState('')
  const [loserId, setLoserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [log, setLog] = useState<ResultLog[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!winnerId || !loserId) return
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, winnerId, loserId }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`Result saved. ${data.aliveCount} alive, ${data.eliminatedCount} eliminated.`)
        setLog(prev => [
          { day, winnerId, loserId, timestamp: new Date().toLocaleTimeString() },
          ...prev,
        ])
        setWinnerId('')
        setLoserId('')
      } else {
        setError(data.error ?? 'Unknown error')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  const winnerTeam = TEAMS.find(t => t.id === winnerId)
  const loserTeam = TEAMS.find(t => t.id === loserId)

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">Day:</label>
          <select
            value={day}
            onChange={e => setDay(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          >
            {SCHEDULE.map(s => (
              <option key={s.day} value={s.day}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Winner</label>
            <select
              value={winnerId}
              onChange={e => setWinnerId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">Select winner...</option>
              {TEAMS.sort((a, b) => a.name.localeCompare(b.name)).map(t => (
                <option key={t.id} value={t.id}>
                  [{t.seed}] {t.name} ({t.region})
                </option>
              ))}
            </select>
            {winnerTeam && (
              <div className="mt-1 text-xs text-green-400">
                ✓ {winnerTeam.name} (#{winnerTeam.seed} {winnerTeam.region})
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Loser</label>
            <select
              value={loserId}
              onChange={e => setLoserId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">Select loser...</option>
              {TEAMS.sort((a, b) => a.name.localeCompare(b.name)).map(t => (
                <option key={t.id} value={t.id}>
                  [{t.seed}] {t.name} ({t.region})
                </option>
              ))}
            </select>
            {loserTeam && (
              <div className="mt-1 text-xs text-red-400">
                ✗ {loserTeam.name} (#{loserTeam.seed} {loserTeam.region})
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !winnerId || !loserId || winnerId === loserId}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {loading ? 'Saving...' : 'Record Result'}
        </button>

        {message && <div className="text-green-400 text-sm">{message}</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </form>

      {log.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-2">Results entered this session:</div>
          <div className="space-y-1">
            {log.map((entry, i) => {
              const w = TEAMS.find(t => t.id === entry.winnerId)
              const l = TEAMS.find(t => t.id === entry.loserId)
              return (
                <div key={i} className="text-xs text-gray-300 bg-gray-800 rounded px-3 py-1.5 flex items-center gap-2">
                  <span className="text-gray-500">Day {entry.day}</span>
                  <span className="text-green-400">{w?.name ?? entry.winnerId}</span>
                  <span className="text-gray-500">def.</span>
                  <span className="text-red-400">{l?.name ?? entry.loserId}</span>
                  <span className="text-gray-600 ml-auto">{entry.timestamp}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
