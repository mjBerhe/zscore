import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { projections } from '@/db/schema'
import { eq } from 'drizzle-orm'

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
      source: "Matt's 2025-2026 Projections",

      gp: Number(r['GP'] ?? 0),
      pts: Number(r['PTS'] ?? 0),
      tpm: Number(r['TPM'] ?? 0),
      reb: Number(r['REB'] ?? 0),
      ast: Number(r['AST'] ?? 0),
      stl: Number(r['STL'] ?? 0),
      blk: Number(r['BLK'] ?? 0),
      to: Number(r['TOV'] ?? 0),
      fgp: Number(r['FG%'] ?? 0),
      fga: Number(r['FGA'] ?? 0),
      ftp: Number(r['FT%'] ?? 0),
      fta: Number(r['FTA'] ?? 0),
    }))

    for (const row of formatted) {
      await db.insert(projections).values(row)
    }

    return { success: true, count: formatted.length }
  })

export const getProjectionSets = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db
      .selectDistinctOn([projections.source])
      .from(projections)

    return rows.map((r) => r.source)
  },
)

export const getProjectionsBySource = createServerFn({ method: 'GET' })
  .inputValidator((data: { source: string }) => data)
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(projections)
      .where(eq(projections.source, data.source))
    return rows
  })

export const getAllProjections = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db.select().from(projections)
    return rows
  },
)

// export const getAllPlayers = createServerFn({ method: 'GET' }).handler(
//   async () => {
//     const result = await db.select().from(players)
//     return result
//   },
// )
