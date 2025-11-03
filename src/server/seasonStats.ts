import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { seasonStats, players } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  calcAllCountingZScores,
  calcPlayersPercentageZScores,
  calcTotalZScore,
} from './utils/projections'

// finding all unique sets of season stats (ie: 2024-2025, 2025-2026, etc)
export const getSeasonStatsSets = createServerFn({ method: 'GET' }).handler(
  async () => {
    const all = await db
      .select({ seasonId: seasonStats.seasonId })
      .from(seasonStats)
    const unique = [...new Set(all.map((r) => r.seasonId))]
    return unique.map((seasonId) => ({ seasonId }))
  },
)

export const getSeasonStatsById = createServerFn({ method: 'GET' })
  .inputValidator((data: { seasonId: string }) => data)
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(seasonStats)
      .where(eq(seasonStats.seasonId, data.seasonId))
    return rows
  })

export const getSeasonStatsByIdWithZScores = createServerFn({
  method: 'GET',
})
  .inputValidator(
    (data: { seasonId: string; topPlayerAmount?: number; punted?: string[] }) =>
      data,
  )
  .handler(async ({ data }) => {
    const playerStats = await db
      .select()
      .from(seasonStats)
      .innerJoin(players, eq(players.id, seasonStats.playerId))
      .where(eq(seasonStats.seasonId, data.seasonId))

    const formatted = playerStats.map((x) => ({
      ...x.season_stats,
      playerName: `${x.players.firstName} ${x.players.lastName}`,
      season: parseInt(x.season_stats.seasonId),
      source: '',
    }))

    let playersWithCountingZScores = calcAllCountingZScores(formatted)
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
      totalZ: calcTotalZScore(p, data.punted),
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
        totalZ: calcTotalZScore(p, data.punted),
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
