import type { ProjectionPlayer } from '@/db/schema'

type CountingStat = 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'tpm' | 'tov'
type PercentageStat = 'fgp' | 'ftp'

type AllZStats = CountingStat | PercentageStat
type ZStatFields = {
  [K in AllZStats as `z${K}`]?: number
}
type ProjectionPlayerWithZ = ProjectionPlayer & ZStatFields

// given a list of player objects, add in a specific percentage zstat (fgp or ftp)
export const calcPlayersPercentageZScores = (
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
export const calcPlayersCountingZScores = <K extends CountingStat>(
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
      [`z${countingStat}`]: zStat * (countingStat === 'tov' ? -1 : 1), // inverting turnovers
    }
  })

  return playersWithZScores
}

// update all counting zstats
export const calcAllCountingZScores = (
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

export const calcTotalZScore = (
  player: ProjectionPlayerWithZ,
  punted: string[] = [],
) => {
  const zKeys: (keyof ProjectionPlayerWithZ)[] = [
    'zpts',
    'zreb',
    'zast',
    'zstl',
    'zblk',
    'ztpm',
    'ztov',
    'zfgp',
    'zftp',
  ]

  return zKeys
    .filter((key) => !punted.includes(key.replace(/^z/, '')))
    .reduce((sum, key) => {
      const val = player[key as AllZStats] ?? 0
      // Reverse turnovers
      return sum + val
    }, 0)
}
