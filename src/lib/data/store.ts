import fs from 'fs'
import path from 'path'
import type { PoolData } from '@/types'

const DATA_PATH = path.join(process.cwd(), 'data', 'pool.json')

const EMPTY: PoolData = {
  entries: [],
  picks: [],
  results: [],
}

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(EMPTY, null, 2))
  }
}

export function readPool(): PoolData {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as PoolData
}

export function writePool(data: PoolData): void {
  ensureDataFile()
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

export function updatePool(updater: (data: PoolData) => PoolData): PoolData {
  const current = readPool()
  const updated = updater(current)
  writePool(updated)
  return updated
}
