import { createServerFn } from '@tanstack/react-start'

type Team = {
  name: string
  id: string
  shorthand?: string
}

type Matchup = {
  away: Team
  home: Team
}

type MatchupPeriod = {
  period: number
  matchupList: Matchup[]
}

type LeagueInfo = {
  draftType: string
  scoringType: string
  matchups: MatchupPeriod[]
  teamsInfo: Team[]
}

export const getFantraxRosters = createServerFn({ method: 'GET' })
  .inputValidator((data: { leagueId: string }) => data)
  .handler(async ({ data }) => {
    const { leagueId } = data
    const res = await fetch(
      `http://localhost:8080/rosters?leagueId=${leagueId}`,
    )
    if (!res.ok) throw new Error('Failed to fetch rosters')
    return res.json() // rosters array
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
