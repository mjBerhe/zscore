import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { InferSelectModel } from 'drizzle-orm'

export const players = pgTable('players', {
  id: integer('id').primaryKey(), // PERSON_ID
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  slug: text('slug'), // PLAYER_SLUG
  teamId: integer('team_id'),
  teamSlug: text('team_slug'),
  teamCity: text('team_city'),
  teamName: text('team_name'),
  teamAbbreviation: text('team_abbreviation'),
  jersey: text('jersey'),
  position: text('position'),
  height: text('height'),
  weight: integer('weight'),
  college: text('college'),
  country: text('country'),
  draftYear: integer('draft_year'),
  draftRound: integer('draft_round'),
  draftNumber: integer('draft_number'),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at'),
})

// finish adjusting this schema to the actual stats

export const gamelogs = pgTable(
  'game_logs',
  {
    id: serial('id').primaryKey(),
    playerId: integer('player_id').notNull(), // links to players.id
    gameId: text('game_id').notNull(), // unique NBA game ID
    seasonId: text('season_id').notNull(),
    gameDate: timestamp('game_date').notNull(),
    matchup: text('matchup').notNull(),
    winloss: text('win_loss').notNull(),
    minutes: integer('minutes'),
    fgm: integer('fgm'),
    fga: integer('fga'),
    fg3m: integer('fg3m'),
    fg3a: integer('fg3a'),
    ftm: integer('ftm'),
    fta: integer('fta'),
    oreb: integer('oreb'),
    dreb: integer('dreb'),
    treb: integer('treb'),
    ast: integer('ast'),
    stl: integer('stl'),
    blk: integer('blk'),
    tov: integer('tov'),
    pf: integer('pf'),
    pts: integer('pts'),
    plusMinus: integer('plus_minus'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniquePlayerGame: uniqueIndex('player_game_unique').on(
      table.playerId,
      table.gameId,
    ),
  }),
)

export const projections = pgTable('projections', {
  id: serial('id').primaryKey(),
  playerName: text('player_name').notNull(),
  season: integer('season').notNull(),
  source: text('source').notNull(),

  gp: real('gp'),
  pts: real('pts'),
  tpm: real('threepm'),
  reb: real('reb'),
  ast: real('ast'),
  stl: real('stl'),
  blk: real('blk'),
  tov: real('tov'),
  fgp: real('fgp'),
  fga: real('fga'),
  ftp: real('ftp'),
  fta: real('fta'),
})

export const seasonStats = pgTable(
  'season_stats',
  {
    id: serial('id').primaryKey(),
    // playerName: text('player_name').notNull(),
    playerId: integer('player_id').notNull(),
    team: text('team'),
    seasonId: text('season_id').notNull(),

    gp: real('gp'),
    pts: real('pts'),
    tpm: real('tpm'),
    reb: real('reb'),
    ast: real('ast'),
    stl: real('stl'),
    blk: real('blk'),
    tov: real('tov'),
    fgp: real('fgp'),
    fga: real('fga'),
    ftp: real('ftp'),
    fta: real('fta'),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    playerSeasonUnique: uniqueIndex('player_season_unique').on(
      table.playerId,
      table.seasonId,
    ),
  }),
)

export type ProjectionPlayer = InferSelectModel<typeof projections> & {
  fgi?: number
  fti?: number
  zfgp?: number
  zftp?: number
}

export type Player = InferSelectModel<typeof players>
