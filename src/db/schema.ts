import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
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

export type ProjectionPlayer = InferSelectModel<typeof projections> & {
  fgi?: number
  fti?: number
  zfgp?: number
  zftp?: number
}

export type Player = InferSelectModel<typeof players>
