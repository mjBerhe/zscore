import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { projections } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ProjectionPlayer } from '@/db/schema'

type CountingStat = 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'tpm' | 'tov'
type PercentageStat = 'fgp' | 'ftp'

type AllZStats = CountingStat | PercentageStat
type ZStatFields = {
  [K in AllZStats as `z${K}`]?: number
}
type ProjectionPlayerWithZ = ProjectionPlayer & ZStatFields

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

export const getProjectionsBySourceWithZScores = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { source: string }) => data)
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

    const rankedPlayers = playersWithCountingZScores
      .sort((a, b) => b?.zpts || 0 - (a?.zpts || 0))
      .map((p, i) => ({ ...p, rank: i + 1 }))

    return rankedPlayers
  })

// given a list of player objects, add in a specific percentage zstat (fgp or ftp)
const calcPlayersPercentageZScores = (
  players: ProjectionPlayer[],
  percentageStat: 'fgp' | 'ftp',
): ProjectionPlayerWithZ[] => {
  const statValues = players.map((player) => player[percentageStat] || 0)
  const avg =
    statValues.reduce((sum, curr) => sum + curr, 0) / statValues.length

  const playersWithImpactStat = players.map((player) => {
    const playerStatAttempts =
      percentageStat === 'fgp' ? player.fga || 0 : player.fta || 0
    const impactValue =
      ((player[percentageStat] || 0) - avg) * playerStatAttempts

    return {
      ...player,
      [percentageStat === 'fgp' ? 'fgi' : 'fti']: impactValue,
    }
  })

  // now calc the zscore for that new impact stat
  const impactKey = percentageStat === 'fgp' ? 'fgi' : 'fti'
  const impactValues = playersWithImpactStat.map((p) => p[impactKey] || 0)
  const impactAvg =
    impactValues.reduce((sum, curr) => sum + curr, 0) / impactValues.length

  const variance =
    impactValues.reduce((sum, v) => sum + (v - impactAvg) ** 2, 0) /
    impactValues.length
  const std = Math.sqrt(variance) || 1

  const playersWithZScores = playersWithImpactStat.map((player) => {
    const zStat = ((player[impactKey] || 0) - impactAvg) / std
    return {
      ...player,
      [percentageStat === 'fgp' ? 'zfgp' : 'zftp']: zStat,
    }
  })

  return playersWithZScores
}

// given a list of players objects with stats, add a specific zstat
const calcPlayersCountingZScores = <K extends CountingStat>(
  players: ProjectionPlayer[],
  countingStat: K,
) => {
  const statValues = players.map((player) => player[countingStat] || 0)
  const avg =
    statValues.reduce((sum, curr) => sum + curr, 0) / statValues.length
  const variance =
    statValues.reduce((sum, v) => sum + (v - avg) ** 2, 0) / statValues.length

  const std = Math.sqrt(variance) || 1 // prevent divide by zero

  const playersWithZScores = players.map((player) => {
    const zStat = ((Number(player[countingStat]) || 0) - avg) / std
    return {
      ...player,
      [`z${countingStat}`]: zStat,
    }
  })

  return playersWithZScores
}

// update all counting zstats
const calcAllCountingZScores = (
  players: ProjectionPlayer[],
): ProjectionPlayerWithZ[] => {
  const countingStats: CountingStat[] = [
    'pts',
    'reb',
    'ast',
    'stl',
    'blk',
    'tpm',
    'tov',
  ]

  // Start with the base players array
  let updatedPlayers = [...players]

  for (const stat of countingStats) {
    const withZ = calcPlayersCountingZScores(updatedPlayers, stat)
    // merge each computed z-score into player objects
    updatedPlayers = updatedPlayers.map((player, i) => ({
      ...player,
      ...withZ[i],
    }))
  }

  return updatedPlayers as ProjectionPlayerWithZ[]
}

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
