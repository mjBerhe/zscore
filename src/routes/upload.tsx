import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAllPlayers } from '@/server/players'
import { useServerFn } from '@tanstack/react-start'

export const Route = createFileRoute('/upload')({
  component: Upload,
  loader: () => getAllPlayers(),
})

function Upload() {
  const getPlayers = useServerFn(getAllPlayers)

  const { data } = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
  })

  return (
    <div className="flex flex-col">
      {data?.map((player, i) => (
        <p key={i}>{player.name}</p>
      ))}
    </div>
  )
}
