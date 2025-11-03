import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
// import { uploadProjections } from '@/server/projections'
import { insertPlayersFromJSON } from '@/server/insertActivePlayers'
import { insertGameLogsfromJSON } from '@/server/insertGamelogs'
import { aggregateSeasonStats } from '@/server/aggregateSeasonStats'

export const Route = createFileRoute('/upload')({
  component: Upload,
})

function Upload() {
  const [input, setInput] = useState<string>('')

  // const upload = useServerFn(uploadProjections)
  const insertPlayers = useServerFn(insertPlayersFromJSON)
  const insertAllGameLogs = useServerFn(insertGameLogsfromJSON)

  const aggregateGames = useServerFn(aggregateSeasonStats)

  // const handleUpload = async () => {
  //   try {
  //     console.log('uploading...')
  //     const result = await upload({ data: { csv: input } })
  //     console.log('Upload result:', result)
  //   } catch (err) {
  //     console.error('Upload failed:', err)
  //   }
  // }

  const handleInsertPlayers = async () => {
    try {
      console.log('inserting players...')
      const res = await insertPlayers()
      console.log(res)
    } catch (err) {
      console.error('Insert failed:', err)
    }
  }

  const handleUploadAllGameLogs = async () => {
    try {
      console.log('uploading game logs...')
      const result = await insertAllGameLogs()
      console.log('Upload result:', result)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleAggregateGames = async () => {
    try {
      console.log('uploading game logs...')
      const result = await aggregateGames()
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

      {/* <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        ></textarea>

        <button onClick={() => handleUpload()}>Submit</button>
      </div> */}

      <div>
        <button onClick={() => handleInsertPlayers()} className="border">
          Insert Players
        </button>

        <button onClick={() => handleUploadAllGameLogs()} className="border">
          Insert Game Logs
        </button>

        <button onClick={() => handleAggregateGames()} className="border">
          Aggregate Games
        </button>
      </div>
    </div>
  )
}
