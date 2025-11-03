import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { gamelogs } from '@/db/schema'
import allGameLogs from '@/server/data/all_players_2025_26_game_logs.json'

const BATCH_SIZE = 200 // or even 100 if needed

export const insertGameLogsfromJSON = createServerFn({
  method: 'POST',
}).handler(async () => {
  const data = allGameLogs

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const formatted = batch.map((r) => ({
      playerId: r.Player_ID,
      gameId: r.Game_ID,
      seasonId: r.SEASON_ID,
      gameDate: new Date(r.GAME_DATE),
      matchup: r.MATCHUP,
      winloss: r.WL,
      minutes: r.MIN,
      fgm: r.FGM,
      fga: r.FGA,
      fg3m: r.FG3M,
      fg3a: r.FG3A,
      ftm: r.FTM,
      fta: r.FTA,
      oreb: r.OREB,
      dreb: r.DREB,
      treb: r.REB,
      ast: r.AST,
      stl: r.STL,
      blk: r.BLK,
      tov: r.TOV,
      pf: r.TOV,
      pts: r.PTS,
      plusMinus: r.PLUS_MINUS,
    }))
    await db.insert(gamelogs).values(formatted).onConflictDoNothing()
  }

  return { inserted: data.length }

  // await db.insert(gamelogs).values(formatted).onConflictDoNothing()
})
