import { pgTable, serial, text, integer, real } from 'drizzle-orm/pg-core'
import { InferSelectModel } from 'drizzle-orm'

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  team: text('team'),
  position: text('position'),
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
