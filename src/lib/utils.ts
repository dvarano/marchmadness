import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nanoid(length = 8): string {
  return Math.random().toString(36).slice(2, 2 + length)
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export function seedColor(seed: number): string {
  if (seed === 1) return '#FFD700'
  if (seed <= 3) return '#22c55e'
  if (seed <= 6) return '#14b8a6'
  if (seed <= 10) return '#3b82f6'
  return '#f97316'
}

export function seedBgClass(seed: number): string {
  if (seed === 1) return 'bg-yellow-400 text-black'
  if (seed <= 3) return 'bg-green-500 text-white'
  if (seed <= 6) return 'bg-teal-500 text-white'
  if (seed <= 10) return 'bg-blue-500 text-white'
  return 'bg-orange-500 text-white'
}
