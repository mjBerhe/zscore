export type Team = {
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

export type LeagueInfo = {
  draftType: string
  scoringType: string
  matchups: MatchupPeriod[]
  teamsInfo: Team[]
}

export type FantraxRosters = Record<string, string[]>
