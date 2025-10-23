import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getProjectionsBySource,
  getProjectionsBySourceWithZScores,
  getProjectionSets,
} from '@/server/projections'
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
import { Toggle } from '@/components/Switch'

const REGULAR_STATS = [
  'pts',
  'tpm',
  'reb',
  'ast',
  'stl',
  'blk',
  'tov',
  'fgp',
  'ftp',
]

const ZSCORE_STATS = [
  'zpts',
  'ztpm',
  'zreb',
  'zast',
  'zstl',
  'zblk',
  'ztov',
  'zfgp',
  'zftp',
]

export const Route = createFileRoute('/')({
  component: App,
})

const TOP_N_OPTIONS = [
  { label: 'Top 100', value: 100 },
  { label: 'Top 135', value: 135 },
  { label: 'Top 150', value: 150 },
  { label: 'Top 175', value: 175 },
  { label: 'Top 200', value: 200 },
  { label: 'All Players', value: 999 },
]

function App() {
  const getAllProjectionSets = useServerFn(getProjectionSets)
  const getProjectionSource = useServerFn(getProjectionsBySourceWithZScores)

  const [selectedProjectionSet, setSelectedProjectionSet] = useState<
    string | null
  >(null)

  const [zScoresToggle, setZScoresToggle] = useState<boolean>(false)

  const [selectedTopN, setSelectedTopN] = useState(TOP_N_OPTIONS[1]) // Default: 150

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
    queryKey: ['projections', selectedProjectionSet, selectedTopN],
    queryFn: () =>
      selectedProjectionSet
        ? getProjectionSource({
            data: {
              source: selectedProjectionSet,
              topPlayerAmount: selectedTopN.value,
            },
          })
        : [],
    enabled: !!selectedProjectionSet, // only run when a source is selected
  })

  if (isLoading) return <p className="p-4 text-gray-400">Loading sets...</p>
  if (error) return <p className="p-4 text-red-400">Error loading sets.</p>

  if (projectionsError)
    return <p className="p-4 text-red-400">Error loading selected set.</p>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto mt-4 p-2 flex flex-col gap-y-4">
        <Listbox
          value={selectedProjectionSet}
          onChange={(val) => setSelectedProjectionSet(val)}
        >
          <ListboxButton
            className={clsx(
              'relative block w-full rounded-lg bg-zinc-800 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white hover:bg-zinc-700',
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
              'w-(--button-width) rounded-xl border border-zinc-600 bg-zinc-800 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
              'transition duration-100 ease-in data-leave:data-closed:opacity-0',
            )}
          >
            {projectionSets?.map((set) => (
              <ListboxOption
                key={set.source}
                value={set.source}
                className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-zinc-700"
              >
                <div className="text-sm text-white">{set.source}</div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>

        <div className="flex gap-x-4">
          <Toggle
            enabled={zScoresToggle}
            onChange={() => setZScoresToggle((prev) => !prev)}
          />

          <div className="w-40">
            <Listbox
              value={selectedTopN}
              onChange={(val) => setSelectedTopN(val)}
            >
              <ListboxButton
                className={clsx(
                  'relative block w-full rounded-lg bg-zinc-800 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white hover:bg-zinc-700',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25',
                )}
              >
                {selectedTopN.label}
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={clsx(
                  'w-(--button-width) rounded-xl border border-zinc-600 bg-zinc-800 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                  'transition duration-100 ease-in data-leave:data-closed:opacity-0',
                )}
              >
                {TOP_N_OPTIONS?.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-zinc-700"
                  >
                    <div className="text-sm text-white">{option.label}</div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        </div>

        <div className="space-y-1 mt-0">
          {selectedProjections && selectedProjections.length > 0 && (
            <div className="mt-0 overflow-x-auto">
              <table className="table-fixed min-w-full border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-zinc-900">
                    <th className="border border-gray-700 py-1 text-left px-2 text-sm w-40">
                      Player
                    </th>
                    <th className="border border-gray-700 py-1 text-sm w-16">
                      Rank
                    </th>
                    <th className="border border-gray-700 py-1 text-sm w-16">
                      Score
                    </th>
                    <th className="border border-gray-700 py-1 text-sm w-16">
                      Price
                    </th>
                    {(zScoresToggle ? ZSCORE_STATS : REGULAR_STATS).map(
                      (stat) => (
                        <th
                          key={stat}
                          className="border border-gray-700 py-1 text-sm w-16"
                        >
                          {stat}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedProjections.map((row, i) => (
                    <tr key={i} className="even:bg-zinc-800 odd:bg-zinc-900">
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.playerName}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.rank}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.totalZ.toFixed(2)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        {row.price.toFixed(2)}
                      </td>
                      {(zScoresToggle ? ZSCORE_STATS : REGULAR_STATS).map(
                        (stat) => (
                          <td
                            key={stat}
                            className="border border-gray-700 px-2 py-1 text-sm"
                          >
                            {Number(row[stat as keyof typeof row]).toFixed(2)}
                          </td>
                        ),
                      )}
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
