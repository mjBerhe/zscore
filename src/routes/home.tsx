import { createFileRoute } from '@tanstack/react-router'
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { useServerFn } from '@tanstack/react-start'
import {
  getFantraxLeagueInfo,
  getFantraxRosters,
} from '@/server/getFantraxRosters'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/home')({
  component: Home,
})

function Home() {
  const { user } = useUser()

  const getLeagueRosters = useServerFn(getFantraxRosters)
  const getLeagueInfo = useServerFn(getFantraxLeagueInfo)

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['league_rosters'],
  //   queryFn: () => getLeagueRosters({ data: { leagueId: '0o5m6y2smg7382ww' } }),
  // })

  const { data, isLoading, error } = useQuery({
    queryKey: ['league_info'],
    queryFn: () => getLeagueInfo({ data: { leagueId: '0o5m6y2smg7382ww' } }),
  })

  if (data) {
    console.log(data.teamsInfo)
  }

  return (
    <div>
      <SignedOut>
        <p>Please sign in to continue:</p>
        <SignInButton>Sign In</SignInButton>
      </SignedOut>

      <SignedIn>
        <p>Welcome, {user?.firstName || 'User'}!</p>
        <p>Your Clerk ID: {user?.id}</p>
      </SignedIn>
    </div>
  )
}
