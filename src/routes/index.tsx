import { createFileRoute } from '@tanstack/react-router'
import { db } from '..'
import { players } from '@/db/schema'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div>hello this is our first deployment</div>
    </div>
  )
}
