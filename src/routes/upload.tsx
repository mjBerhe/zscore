import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { uploadProjections } from '@/server/projections'
import { insertPlayersFromCSV } from '@/server/players'

export const Route = createFileRoute('/upload')({
  component: Upload,
})

function Upload() {
  const [input, setInput] = useState<string>('')

  const upload = useServerFn(uploadProjections)
  const insertPlayers = useServerFn(insertPlayersFromCSV)

  const handleInsertPlayers = async () => {
    try {
      console.log('inserting players...')
      const res = await insertPlayers()
      console.log(res)
    } catch (err) {
      console.error('Insert failed:', err)
    }
  }

  const handleUpload = async () => {
    try {
      console.log('uploading...')
      const result = await upload({ data: { csv: input } })
      console.log('Upload result:', result)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  return (
    <div className="flex gap-4">
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

      <div>
        <button onClick={() => handleInsertPlayers()} className="border">
          Insert Players
        </button>
      </div>
    </div>
  )
}
