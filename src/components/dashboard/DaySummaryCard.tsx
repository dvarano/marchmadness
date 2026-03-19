import { pct } from '@/lib/utils'
import type { DaySummary } from '@/types'

interface Props {
  summary: DaySummary
  label: string
}

export function DaySummaryCard({ summary, label }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-bold text-orange-400">{summary.survivors}</div>
      <div className="text-xs text-gray-400 mt-1">survivors</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-300">
        <div>
          <div className="text-red-400 font-semibold">{summary.eliminated}</div>
          <div className="text-gray-500">eliminated</div>
        </div>
        <div>
          <div className="text-yellow-400 font-semibold">{summary.buybacks}</div>
          <div className="text-gray-500">buybacks</div>
        </div>
        <div>
          <div className="text-green-400 font-semibold">{pct(summary.survivalRate)}</div>
          <div className="text-gray-500">survival</div>
        </div>
      </div>
    </div>
  )
}
