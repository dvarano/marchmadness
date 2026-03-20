import type { DaySummary } from '@/types'

interface Props {
  summary: DaySummary
  label: string
}

export function DaySummaryCard({ summary, label }: Props) {
  const priorSurvivors = summary.startCount - summary.buybacks

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-bold text-orange-400">
        {summary.eliminated > 0 || summary.complete ? summary.survivors : '–'}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {summary.complete ? 'survivors through day' : summary.eliminated > 0 ? 'survivors (in progress)' : 'survivors through day'}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-gray-300">
        <div>
          <div className="text-gray-200 font-semibold">{priorSurvivors}</div>
          <div className="text-gray-500">prior survivors</div>
        </div>
        <div>
          <div className="text-yellow-400 font-semibold">{summary.buybacks}</div>
          <div className="text-gray-500">buybacks</div>
        </div>
        <div>
          <div className="text-white font-semibold">{summary.startCount}</div>
          <div className="text-gray-500">entrants</div>
        </div>
        <div>
          <div className="text-red-400 font-semibold">{summary.eliminated > 0 || summary.complete ? summary.eliminated : '–'}</div>
          <div className="text-gray-500">eliminated</div>
        </div>
      </div>
    </div>
  )
}
