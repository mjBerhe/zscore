import { createServerFn } from '@tanstack/react-start'
import { db } from '..'
import { players } from '@/db/schema'

export const getAllPlayers = createServerFn({ method: 'GET' }).handler(
  async () => {
    const result = await db.select().from(players)
    return result
  },
)
