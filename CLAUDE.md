# March Madness Knockout Pool Dashboard

## Daily Workflow

The user provides picks, matchups, and results directly in chat (not via the Admin UI).

### Step 1 — Picks + Matchups (morning / before games)

User pastes both in one message:
```
Day 1 picks:
Allie O.- Duke, Florida
Bobby C.- Arizona, Houston
...

Today's games:
Duke vs Siena
UConn vs Furman
Florida vs Prairie View
...
```

Processing picks:
1. Read the current `data/pool.json`
2. Match player names to existing entries (or create new ones)
3. Match team names to teams in `src/lib/data/teams.ts` (use aliases for fuzzy matching)
4. Detect buybacks: if pick count > basePicks for the day (Day 1-2: 2, Day 3+: 1)
5. Set `requiredWins = teamIds.length` (all picks must win)
6. Write updated data back to `data/pool.json`

Processing matchups:
1. Match team names to teams in `src/lib/data/teams.ts` (use aliases for fuzzy matching)
2. Add each game as `{ day, teamAId, teamBId }` to the `matchups` array in `data/pool.json`
3. This powers the `/today` Sweat Meter page — without matchups, it falls back to Round 1 bracket math
4. **Round 1 (Days 1-2):** Matchups are optional — bracket math (1v16, 2v15, etc.) handles it
5. **Round 2+ (Day 3 onward):** Matchups are required since they depend on who advanced

### Step 2 — Results (as games finish or end of day)

User tells you who won/lost in any format:
```
Duke won, Siena lost
Florida beat Prairie View
UConn lost to Furman (upset!)
```

1. Read the current `data/pool.json`
2. Apply results via the elimination engine (`src/lib/engine/elimination.ts`)
3. Update entry statuses (alive/eliminated)
4. Write updated data back to `data/pool.json`

### Step 3 — Deploy

User says "deploy" and you:
1. Stop the dev server if running (`Ctrl+C` or kill node)
2. Run `pnpm run deploy` (not `pnpm deploy` — that's a workspace command)
3. Site is live at https://dvarano.github.io/marchmadness/

Can deploy after Step 1 (sweat meter before games), after Step 2 (results), or anytime.

## Build Notes

- **MUST run `pnpm install` from the correct-case path** (`C:\Code\marchmadness`, capital C) or React module duplication breaks `next build` on Windows
- The deploy script (`scripts/deploy.sh`) handles this with `cd /C/Code/marchmadness`
- `pnpm dev` works from any case path — only `next build` is affected
- `data/pool.json` is git-ignored — data lives locally only, baked into static HTML at deploy time

## Pool Rules Reference

- 100 entries, knockout format
- Days 1-2 (Round 1): 2 picks required
- Days 3-10 (Round 2+): 1 pick required
- Buybacks allowed through Day 4 only. Buyback raises pick count for THAT DAY ONLY (Day 2: 4, Day 3: 5, Day 4: 6)
- All picks must win to survive
- Cannot reuse a team you've already picked
- Running out of available teams = automatic elimination (Rule 8)

## Picks & Buyback Data Model

- Buyback entries: `eliminatedOnDay` is deleted and `isAlive` set to true, but their original day's pick `status` remains `'eliminated'`
- The survival funnel counts eliminations from **pick status**, not `eliminatedOnDay`, so buyback entries are still counted as eliminated on their original day
- `DaySummary.complete` is true when all picks for that day have resolved (no `'pending'` status)
- `DaySummary.startCount` = prior day survivors + buybacks for this day

## Deploy Script

- `scripts/deploy.sh` gracefully handles missing `src/app/api` directory (may not exist if no API routes)
- Always kill the dev server before deploying (`taskkill //F //IM node.exe` on Windows)
