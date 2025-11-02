import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { players, type Player } from '@/db/schema'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

export const insertPlayersFromCSV = createServerFn({ method: 'POST' }).handler(
  async () => {
    const filePath = path.join(process.cwd(), 'data', 'all_nba_players.csv')
    const rows: any[] = []

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => resolve())
        .on('error', reject)
    })

    const formatted = rows
      .filter((r) => r.ROSTER_STATUS === 'Active')
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
        jersey: p.JERSEY_NUMBER || null,
        position: p.POSITION,
        height: p.HEIGHT,
        weight: p.WEIGHT || null,
        college: p.COLLEGE || null,
        country: p.COUNTRY,
        draftYear: Number(p.DRAFT_YEAR) || null,
        draftRound: Number(p.DRAFT_ROUND) || null,
        draftNumber: Number(p.DRAFT_NUMBER) || null,
        isActive: p.ROSTER_STATUS === 'Active',
      }))

    await db.insert(players).values(formatted).onConflictDoNothing()

    return { inserted: formatted.length }
  },
)
