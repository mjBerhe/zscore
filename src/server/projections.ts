import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { projections } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  calcAllCountingZScores,
  calcPlayersPercentageZScores,
  calcTotalZScore,
} from './utils/projections'

export const uploadProjections = createServerFn({ method: 'POST' })
  .inputValidator((data: { csv: string }) => data)
  .handler(async ({ data }) => {
    // WARNING: only if I want to delete all projection set before uploading new set
    // await db
    //   .delete(projections)
    //   .where(eq(projections.source, "Matt's 2025-2026 Projections"))

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
    const all = await db
      .select({ source: projections.source })
      .from(projections)
    const unique = [...new Set(all.map((r) => r.source))]
    return unique.map((source) => ({ source }))
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

export const getProjectionsBySourceWithZScores = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { source: string; topPlayerAmount?: number }) => data)
  .handler(async ({ data }) => {
    const players = await db
      .select()
      .from(projections)
      .where(eq(projections.source, data.source))

    // lets have some consts
    // FIRST lets use all 480 players

    let playersWithCountingZScores = calcAllCountingZScores(players)
    playersWithCountingZScores = calcPlayersPercentageZScores(
      playersWithCountingZScores,
      'fgp',
    )
    playersWithCountingZScores = calcPlayersPercentageZScores(
      playersWithCountingZScores,
      'ftp',
    )

    const withTotalZScores = playersWithCountingZScores.map((p) => ({
      ...p,
      totalZ: calcTotalZScore(p),
    }))

    const rankedPlayers = withTotalZScores
      .sort((a, b) => (b.totalZ ?? 0) - (a.totalZ ?? 0))
      .map((p, i) => ({
        ...p,
        rank: i + 1, // add rank based on sorted order
      }))

    // now that we have our list, we can look for top N players
    const PLAYER_AMOUNT = data?.topPlayerAmount ?? 150

    const topPlayers = rankedPlayers.slice(0, PLAYER_AMOUNT)

    let recalculatedPlayersWithZScores = calcAllCountingZScores(topPlayers)
    recalculatedPlayersWithZScores = calcPlayersPercentageZScores(
      recalculatedPlayersWithZScores,
      'fgp',
    )
    recalculatedPlayersWithZScores = calcPlayersPercentageZScores(
      recalculatedPlayersWithZScores,
      'ftp',
    )

    const recalculatedFinalZScores = recalculatedPlayersWithZScores.map(
      (p) => ({
        ...p,
        totalZ: calcTotalZScore(p),
      }),
    )
    const recalculatedRankedPlayers = recalculatedFinalZScores
      .sort((a, b) => (b.totalZ ?? 0) - (a.totalZ ?? 0))
      .map((p, i) => ({ ...p, rank: i + 1 }))

    // if we have 150 players, find out how much we need to increase their totalZ to get to 0
    const baselineZ =
      recalculatedRankedPlayers[recalculatedRankedPlayers.length - 1]?.totalZ ||
      0

    const standardizedPlayers = recalculatedRankedPlayers.map((p) => ({
      ...p,
      totalZ: p.totalZ - baselineZ,
    }))

    const TOTAL_BUDGET = (PLAYER_AMOUNT / 15) * 200
    const totalAdjustedZ = standardizedPlayers.reduce(
      (sum, p) => sum + p.totalZ,
      0,
    )

    const playersWithPrice = standardizedPlayers.map((p) => ({
      ...p,
      price: p.totalZ > 0 ? (p.totalZ / totalAdjustedZ) * TOTAL_BUDGET : 0,
    }))

    return playersWithPrice
  })

export const getAllProjections = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db.select().from(projections)
    return rows
  },
)
