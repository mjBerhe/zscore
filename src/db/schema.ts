import { pgTable, serial, text, integer, real } from 'drizzle-orm/pg-core'

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
  to: real('to'),
  fgp: real('fgp'),
  fga: real('fga'),
  ftp: real('ftp'),
  fta: real('fta'),
})
