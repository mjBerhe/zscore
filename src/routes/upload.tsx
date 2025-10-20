import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAllPlayers } from '@/server/players'
import { useServerFn } from '@tanstack/react-start'
import { uploadProjections } from '@/server/projections'

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

  const [input, setInput] = useState<string>('')

  const upload = useServerFn(uploadProjections)

  const handleUpload = async () => {
    try {
      const result = await upload({ data: { csv: input } })
      console.log('Upload result:', result)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  return (
    <div className="flex flex-col">
      {/* {data?.map((player, i) => (
        <p key={i}>{player.name}</p>
      ))} */}

      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        ></textarea>

        <button onClick={() => handleUpload()}>Submit</button>
      </div>
    </div>
  )
}
