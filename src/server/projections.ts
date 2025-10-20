import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { projections, players } from '@/db/schema'

export const uploadProjections = createServerFn({ method: 'POST' })
  .inputValidator((data: { csv: string }) => data)
  .handler(async ({ data }) => {
    const allRows = data.csv.trim().split('\n')

    const headers = allRows[0].split(',').map((h) => h.trim())
    const rows = allRows.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim())
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })

    if (!rows.length) throw new Error('No rows parsed from CSV')

    const formatted = rows.map((r: any) => ({
      playerName: r['Player Name'],
      season: 2025,
      source: 'MyProjections',
      gp: Number(r['GP'] ?? 0),
      fgPct: Number(r['FG%'] ?? 0),
      ftPct: Number(r['FT%'] ?? 0),
      threepm: Number(r['TPM'] ?? 0),
      reb: Number(r['REB'] ?? 0),
      ast: Number(r['AST'] ?? 0),
      stl: Number(r['STL'] ?? 0),
      blk: Number(r['BLK'] ?? 0),
      to: Number(r['TOV'] ?? 0),
      pts: Number(r['PTS'] ?? 0),
    }))

    // --- Insert or upsert ---
    for (const row of formatted) {
      await db.insert(projections).values(row)
      // .onConflictDoUpdate({
      //   target: [projections.playerName, projections.season],
      //   set: {
      //     source: row.source,
      //     gp: row.gp,
      //     fgPct: row.fgPct,
      //     ftPct: row.ftPct,
      //     threepm: row.threepm,
      //     reb: row.reb,
      //     ast: row.ast,
      //     stl: row.stl,
      //     blk: row.blk,
      //     to: row.to,
      //     pts: row.pts,
      //   },
      // })
    }

    return { success: true, count: formatted.length }
  })
