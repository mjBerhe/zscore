import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAllTeams } from '@/server/getPlayers'

export const Route = createFileRoute('/players')({
  component: Players,
})

function Players() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['getAllTeams'],
    queryFn: () => getAllTeams(),
  })

  console.log(data)

  if (isLoading) return <div>Loading players…</div>
  if (error) return <div>Error loading players.</div>

  return (
    <div>
      {/* {data?.slice(0, 10).map((p: any) => (
        <div key={p.id}>{p.full_name}</div>
      ))} */}
    </div>
  )
}
