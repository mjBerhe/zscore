import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProjectionsBySource, getProjectionSets } from '@/server/projections'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const getAllProjectionSets = useServerFn(getProjectionSets)
  const getProjectionSource = useServerFn(getProjectionsBySource)

  const [selectedProjectionSet, setSelectedProjectionSet] = useState<
    string | null
  >(null)

  const {
    data: projectionSets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projectionSets'],
    queryFn: () => getAllProjectionSets(),
  })

  const {
    data: selectedProjections,
    isLoading: projectionsLoading,
    error: projectionsError,
  } = useQuery({
    queryKey: ['projections', selectedProjectionSet],
    queryFn: () =>
      selectedProjectionSet
        ? getProjectionSource({ data: { source: selectedProjectionSet } })
        : [],
    enabled: !!selectedProjectionSet, // only run when a source is selected
  })

  if (isLoading) return <p className="p-4 text-gray-400">Loading sets...</p>
  if (error) return <p className="p-4 text-red-400">Error loading sets.</p>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto mt-4 p-2">
        <Listbox
          value={selectedProjectionSet}
          onChange={(val) => setSelectedProjectionSet(val)}
        >
          <ListboxButton
            className={clsx(
              'relative block w-full rounded-lg bg-zinc-800 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white',
              'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25',
            )}
          >
            {selectedProjectionSet ?? 'Select a Projection Set'}
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </ListboxButton>
          <ListboxOptions
            anchor="bottom"
            transition
            className={clsx(
              'w-(--button-width) rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
              'transition duration-100 ease-in data-leave:data-closed:opacity-0',
            )}
          >
            {projectionSets?.map((set) => (
              <ListboxOption
                key={set}
                value={set}
                className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
              >
                <div className="text-sm text-white">{set}</div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>

        <div className="space-y-1 mt-2">
          {selectedProjections && selectedProjections.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-zinc-900">
                    <th className="border border-gray-700 px-2 py-1 text-left text-sm">
                      Player
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      PTS
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      TPM
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      REB
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      AST
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      STL
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      BLK
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      TOV
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      FG%
                    </th>
                    <th className="border border-gray-700 px-2 py-1 text-sm">
                      FT%
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProjections.map((row, i) => (
                    <tr key={i} className="even:bg-zinc-800 odd:bg-zinc-900">
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.playerName}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.pts}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.tpm}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.reb}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.ast}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.stl}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.blk}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.to}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.fgp}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.ftp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
