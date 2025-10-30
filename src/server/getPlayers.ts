import { createServerFn } from '@tanstack/react-start'

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

    // const url = `https://api.sportradar.us/nba/trial/v8/en/league/players.json?api_key=${apiKey}`

    const url = `https://api.sportradar.com/nba/trial/v8/en/league/teams.json?api_key=${apiKey}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`)

    const data = await res.json()
    console.log(data)
    return data
  },
)
