import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'

import { useServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'

import {
  fantasyProfilesQuery,
  getFantraxLeagueInfo,
  saveFantraxProfile,
} from '@/server/fantrax'
import { useQuery } from '@tanstack/react-query'
import { Team } from '@/global'
import { Profiles } from '@/components/Profiles'

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated, userId } = await auth()

  // if (!isAuthenticated) {
  //   // This will error because you're redirecting to a path that doesn't exist yet
  //   // You can create a sign-in route to handle this
  //   // See https://clerk.com/docs/tanstack-react-start/guides/development/custom-sign-in-or-up-page
  //   throw redirect({
  //     to: '/sign-in',
  //   })
  // }

  return { userId }
})

export const Route = createFileRoute('/home')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    const { userId } = context

    if (!userId)
      return {
        profiles: [],
      }

    const data = await context.queryClient.ensureQueryData(
      fantasyProfilesQuery(userId),
    )

    return { profiles: data }
  },
})

function Home() {
  const { user } = useUser()
  const { profiles } = Route.useLoaderData()

  const [input, setInput] = useState<string>('')
  const [leagueId, setLeagueId] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const getLeagueInfo = useServerFn(getFantraxLeagueInfo)
  const saveProfile = useServerFn(saveFantraxProfile)

  // 0o5m6y2smg7382ww

  const { data, isLoading, error } = useQuery({
    queryKey: ['league_info'],
    queryFn: () => getLeagueInfo({ data: { leagueId: leagueId } }),
    enabled: !!leagueId,
  })

  const handleSetLeagueId = () => {
    if (input) {
      setLeagueId(input)
    }
  }

  const handleSelectTeam = async (team: Team) => {
    if (!user) return
    setSelectedTeam(team)

    const res = await saveProfile({
      data: {
        userId: user.id,
        platform: 'fantrax',
        leagueId,
        teamId: team.id,
        teamName: team.name,
        ownerName: user.firstName ?? team.name,
      },
    })
    console.log(res)
    setIsSaved(true)
  }

  if (profiles.length > 0) {
    return <Profiles profiles={profiles} />
  }

  return (
    <div>
      <SignedOut>
        <p>Please sign in to continue:</p>
        <SignInButton>Sign In</SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-7xl mx-auto mt-4 px-8 flex flex-col gap-y-4">
            <p>Welcome, {user?.firstName || 'User'}!</p>

            <div>
              {!data && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Enter your Fantrax League ID
                  </label>
                  <input
                    className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                    placeholder="e.g. 0o5m6y2smg7382ww"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />

                  <button onClick={handleSetLeagueId}>Submit</button>
                </div>
              )}

              {/* Step 2: show league teams */}
              {isLoading && <p>Fetching league info...</p>}
              {error && <p className="text-red-400">{String(error)}</p>}

              {data && !isSaved && (
                <div className="mt-6">
                  <p className="font-semibold mb-2">
                    Select your team from this league:
                  </p>
                  <ul className="space-y-2">
                    {data.teamsInfo.map((team) => (
                      <li key={team.id}>
                        <button
                          onClick={() => handleSelectTeam(team)}
                          className="w-full text-left px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
                        >
                          {team.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isSaved && selectedTeam && (
                <div className="mt-6 p-4 rounded bg-green-900/30 border border-green-700">
                  <p>✅ Linked your Fantrax team:</p>
                  <p className="font-semibold mt-1">{selectedTeam.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
