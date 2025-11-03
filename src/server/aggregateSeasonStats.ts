import { db } from '..'
import { gamelogs, seasonStats } from '@/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'

export const aggregateSeasonStats = createServerFn({ method: 'POST' }).handler(
  async () => {
    // 1️⃣ Aggregate per player per season
    const aggregated = await db
      .select({
        playerId: gamelogs.playerId,
        seasonId: gamelogs.seasonId,
        gp: sql<number>`COUNT(*)`,
        pts: sql<number>`AVG(${gamelogs.pts})`,
        tpm: sql<number>`AVG(${gamelogs.fg3m})`,
        reb: sql<number>`AVG(${gamelogs.treb})`,
        ast: sql<number>`AVG(${gamelogs.ast})`,
        stl: sql<number>`AVG(${gamelogs.stl})`,
        blk: sql<number>`AVG(${gamelogs.blk})`,
        tov: sql<number>`AVG(${gamelogs.tov})`,
        fgp: sql<number>`AVG(${gamelogs.fgm}) / NULLIF(AVG(${gamelogs.fga}), 0)`,
        fga: sql<number>`AVG(${gamelogs.fga})`,
        ftp: sql<number>`AVG(${gamelogs.ftm}) / NULLIF(AVG(${gamelogs.fta}), 0)`,
        fta: sql<number>`AVG(${gamelogs.fta})`,
      })
      .from(gamelogs)
      .groupBy(gamelogs.playerId, gamelogs.seasonId)

    // 2️⃣ Insert into seasonStats
    await db
      .insert(seasonStats)
      .values(aggregated)
      .onConflictDoUpdate({
        target: [seasonStats.playerId, seasonStats.seasonId],
        set: {
          gp: sql`EXCLUDED.gp`,
          pts: sql`EXCLUDED.pts`,
          tpm: sql`EXCLUDED.threepm`,
          reb: sql`EXCLUDED.reb`,
          ast: sql`EXCLUDED.ast`,
          stl: sql`EXCLUDED.stl`,
          blk: sql`EXCLUDED.blk`,
          tov: sql`EXCLUDED.tov`,
          fgp: sql`EXCLUDED.fgp`,
          fga: sql`EXCLUDED.fga`,
          ftp: sql`EXCLUDED.ftp`,
          fta: sql`EXCLUDED.fta`,
          updatedAt: sql`NOW()`,
        },
      })

    return { count: aggregated.length }
  },
)
