import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { FantasyProfile } from '@/db/schema'

import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getFantraxRosters } from '@/server/fantrax'

export const Profiles: React.FC<{ profiles: FantasyProfile[] }> = ({
  profiles,
}) => {
  // const { user } = useUser()
  const [selectedProfile, setSelectedProfile] = useState<FantasyProfile>(
    profiles[0],
  )

  const getLeagueRosters = useServerFn(getFantraxRosters)

  const { data, isLoading, error } = useQuery({
    queryKey: ['league_rosters'],
    queryFn: () =>
      getLeagueRosters({ data: { leagueId: selectedProfile.leagueId } }),
  })

  if (isLoading) return <div>Loading roster...</div>
  if (error) return <div>Error loading roster</div>
  if (!data) return <div>No roster data</div>

  const myTeam = data[selectedProfile.teamName ?? '']

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{selectedProfile.teamName}</h2>
      <ul className="space-y-1 list-disc ml-6">
        {myTeam.map((player) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
    </div>
  )
}
