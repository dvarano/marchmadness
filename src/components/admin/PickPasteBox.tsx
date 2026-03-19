'use client'

import { useState } from 'react'
import { SCHEDULE } from '@/lib/data/schedule'

interface ImportResult {
  success: boolean
  entriesProcessed: number
  unmatched: string[]
  errors: string[]
}

export function PickPasteBox() {
  const [raw, setRaw] = useState('')
  const [day, setDay] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleImport() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw, day }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, entriesProcessed: 0, unmatched: [], errors: ['Network error'] })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400">Day:</label>
        <select
          value={day}
          onChange={e => setDay(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
        >
          {SCHEDULE.map(s => (
            <option key={s.day} value={s.day}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        placeholder={`Paste picks here, one per line:\nAlice- Duke, Kentucky\nBob- Kansas, Gonzaga\nCharlie- Houston, Arizona, Tennessee`}
        rows={12}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-y"
      />

      <div className="flex gap-3">
        <button
          onClick={handleImport}
          disabled={loading || !raw.trim()}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {loading ? 'Importing...' : 'Import Picks'}
        </button>
        <button
          onClick={() => { setRaw(''); setResult(null) }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Clear
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-4 ${result.success ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
          {result.success ? (
            <div className="text-green-300">
              <div className="font-semibold">Import successful!</div>
              <div className="text-sm mt-1">{result.entriesProcessed} entries processed</div>
              {result.unmatched.length > 0 && (
                <div className="mt-2 text-yellow-400 text-sm">
                  <div className="font-semibold">Unmatched teams:</div>
                  <ul className="list-disc list-inside mt-1">
                    {result.unmatched.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-300">
              <div className="font-semibold">Import failed</div>
              {result.errors.map((e, i) => <div key={i} className="text-sm mt-1">{e}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
