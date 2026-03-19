'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface ExportCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ExportCard({ title, children, className }: ExportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  async function handleExport() {
    if (!cardRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#030712',
      scale: 2,
    })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative bg-gray-900 border border-gray-800 rounded-xl p-5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button
          onClick={handleExport}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-colors"
        >
          Export PNG
        </button>
      </div>
      {children}
    </div>
  )
}
