import { createServerFn } from '@tanstack/react-start'

const ACTIVE_NBA_ALIASES = [
  'ATL', // Atlanta Hawks
  'BOS', // Boston Celtics
  'BKN', // Brooklyn Nets
  'CHA', // Charlotte Hornets
  'CHI', // Chicago Bulls
  'CLE', // Cleveland Cavaliers
  'DAL', // Dallas Mavericks
  'DEN', // Denver Nuggets
  'DET', // Detroit Pistons
  'GSW', // Golden State Warriors
  'HOU', // Houston Rockets
  'IND', // Indiana Pacers
  'LAC', // Los Angeles Clippers
  'LAL', // Los Angeles Lakers
  'MEM', // Memphis Grizzlies
  'MIA', // Miami Heat
  'MIL', // Milwaukee Bucks
  'MIN', // Minnesota Timberwolves
  'NOP', // New Orleans Pelicans
  'NYK', // New York Knicks
  'OKC', // Oklahoma City Thunder
  'ORL', // Orlando Magic
  'PHI', // Philadelphia 76ers
  'PHX', // Phoenix Suns
  'POR', // Portland Trail Blazers
  'SAC', // Sacramento Kings
  'SAS', // San Antonio Spurs
  'TOR', // Toronto Raptors
  'UTA', // Utah Jazz
  'WAS', // Washington Wizards
]

type NBA_TEAM = {
  id: string
  alias: string
  name: string
  market: string
}

const apiKey = process.env.SPORTRADAR_API_KEY

export const getAllPlayers = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (!apiKey) throw new Error('Missing Sportradar API key')

    // const url = `https://api.sportradar.us/nba/trial/v8/en/league/players.json?api_key=${apiKey}`

    const url = `https://api.sportradar.com/nba/trial/v8/en/players/8ec91366-faea-4196-bbfd-b8fab7434795/profile.json?api_key=${apiKey}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`)

    const data = await res.json()
    console.log(data)
    return data
  },
)

export const getAllTeams = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (!apiKey) throw new Error('Missing Sportradar API key')

    const teamsURL = `https://api.sportradar.com/nba/trial/v8/en/league/teams.json?api_key=${apiKey}`

    const teamsRes = await fetch(teamsURL)
    if (!teamsRes.ok)
      throw new Error(`Failed to fetch players: ${teamsRes.status}`)

    const teamsData = await teamsRes.json()
    const teams: NBA_TEAM[] = teamsData.teams
    const activeTeamsIds = teams
      .filter((team) => ACTIVE_NBA_ALIASES.includes(team.alias))
      .map((team) => team.id)

    // const sunsID = '583ecfa8-fb46-11e1-82cb-f4ce4684ea4c'
    // const sunsURL = `https://api.sportradar.com/nba/trial/v8/en/teams/${sunsID}/profile.json?api_key=${apiKey}`
    // const res = await fetch(sunsURL)
    // const sunsData = await res.json()

    // console.log(sunsData)
    return teamsData
  },
)
