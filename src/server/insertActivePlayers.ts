import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { players } from '@/db/schema'
import playersData from '@/server/data/all_nba_players.json'

export const insertPlayersFromJSON = createServerFn({ method: 'POST' }).handler(
  async () => {
    const data = playersData
    const formatted = data
      .filter((r) => r.ROSTER_STATUS === 1)
      .map((p) => ({
        id: Number(p.PERSON_ID),
        firstName: p.PLAYER_FIRST_NAME,
        lastName: p.PLAYER_LAST_NAME,
        slug: p.PLAYER_SLUG,
        teamId: Number(p.TEAM_ID) || null,
        teamSlug: p.TEAM_SLUG,
        teamCity: p.TEAM_CITY,
        teamName: p.TEAM_NAME,
        teamAbbreviation: p.TEAM_ABBREVIATION,
        jersey: String(p.JERSEY_NUMBER) || null,
        position: p.POSITION,
        height: p.HEIGHT,
        weight: p.WEIGHT ? Number(p.WEIGHT) : null,
        college: p.COLLEGE || null,
        country: p.COUNTRY,
        draftYear: Number(p.DRAFT_YEAR) || null,
        draftRound: Number(p.DRAFT_ROUND) || null,
        draftNumber: Number(p.DRAFT_NUMBER) || null,
        isActive: p.ROSTER_STATUS === 1,
      }))
    await db.insert(players).values(formatted).onConflictDoNothing()
    return { inserted: formatted.length }
  },
)
