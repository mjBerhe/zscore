import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { db } from '..'
import { eq } from 'drizzle-orm'
import { fantasyProfiles } from '@/db/schema'
import { FantraxRosters, LeagueInfo } from '@/global'

export const getFantraxRosters = createServerFn({ method: 'GET' })
  .inputValidator((data: { leagueId: string }) => data)
  .handler(async ({ data }) => {
    const { leagueId } = data
    const res = await fetch(
      `http://localhost:8080/rosters?leagueId=${leagueId}`,
    )
    if (!res.ok) throw new Error('Failed to fetch rosters')

    const rostersData = (await res.json()) as FantraxRosters
    return rostersData // rosters array
  })

export const getFantraxLeagueInfo = createServerFn({ method: 'GET' })
  .inputValidator((data: { leagueId: string }) => data)
  .handler(async ({ data }) => {
    const { leagueId } = data
    const res = await fetch(`http://localhost:8080/league?leagueId=${leagueId}`)
    if (!res.ok) throw new Error('Failed to fetch league info')

    const leagueInfoData = (await res.json()) as LeagueInfo
    return leagueInfoData // rosters array
  })

export const saveFantraxProfile = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      userId: string
      platform: string
      leagueId: string
      teamId: string
      teamName: string
      ownerName: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const { userId, platform, leagueId, teamId, teamName, ownerName } = data

    await db.insert(fantasyProfiles).values({
      userId,
      platform,
      leagueId,
      teamId,
      teamName,
      ownerName,
    })

    return { success: true }
  })

export const getUserFantasyProfiles = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const profiles = await db
      .select()
      .from(fantasyProfiles)
      .where(eq(fantasyProfiles.userId, data.userId))

    return profiles
  })

export const fantasyProfilesQuery = (userId: string) =>
  queryOptions({
    queryKey: ['fantasy_profiles', userId],
    queryFn: () => getUserFantasyProfiles({ data: { userId } }),
  })
