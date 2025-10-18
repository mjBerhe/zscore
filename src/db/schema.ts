import { pgTable, serial, text, integer, real } from 'drizzle-orm/pg-core'

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  team: text('team'),
  position: text('position'),
})

export const projections = pgTable('projections', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id),
  source: text('source').notNull(),
  season: integer('season').notNull(),

  gp: real('gp'),
  fgPct: real('fg_pct'),
  ftPct: real('ft_pct'),
  threepm: real('threepm'),
  reb: real('reb'),
  ast: real('ast'),
  stl: real('stl'),
  blk: real('blk'),
  to: real('to'),
  pts: real('pts'),
})
