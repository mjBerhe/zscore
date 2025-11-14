import { useState, useMemo } from 'react'
import { FantasyProfile } from '@/db/schema'

import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getFantraxRosters } from '@/server/fantrax'
import { getSeasonStatsByIdWithZScores } from '@/server/seasonStats'

import {
  TOP_N_OPTIONS,
  PUNTABLE_STATS,
  ZSCORE_STATS,
  REGULAR_STATS,
} from '@/constants/table'
import clsx from 'clsx'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Switch,
} from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { Toggle } from '@/components/Toggle'
import { getZScoreColor } from '@/routes/projections'

export const Profiles: React.FC<{ profiles: FantasyProfile[] }> = ({
  profiles,
}) => {
  // TODO: use when swapping between different profiles
  const [selectedProfile, setSelectedProfile] = useState<FantasyProfile>(
    profiles[0],
  )

  const [zScoresToggle, setZScoresToggle] = useState<boolean>(true)

  const [selectedTopN, setSelectedTopN] = useState(TOP_N_OPTIONS[1]) // default: 135

  const [punted, setPunted] = useState<string[]>([])

  const getLeagueRosters = useServerFn(getFantraxRosters)

  const { data, isLoading, error } = useQuery({
    queryKey: ['league_rosters', selectedProfile.leagueId],
    queryFn: () =>
      getLeagueRosters({ data: { leagueId: selectedProfile.leagueId } }),
  })

  const { data: zScores, isLoading: isZScoresLoading } = useQuery({
    queryKey: ['season_stats', selectedProfile.leagueId, selectedTopN, punted],
    queryFn: () =>
      getSeasonStatsByIdWithZScores({
        data: {
          seasonId: '2025-26',
          topPlayerAmount: selectedTopN.value,
          punted,
        },
      }),
  })

  const myTeamPlayers = data && data[selectedProfile.teamName ?? '']

  // Normalize names before comparing
  const normalizedTeam = myTeamPlayers?.map(normalizeFantraxName)

  const myTeamStats = zScores?.filter((p) =>
    normalizedTeam?.includes(normalizeZScoreName(p.playerName)),
  )

  const zAverages = useMemo(() => {
    if (!myTeamStats || myTeamStats.length === 0) return {}

    const count = myTeamStats.length
    const avgs: Record<string, number> = {}

    ZSCORE_STATS.forEach((cat) => {
      if (punted.includes(cat)) return

      let sum = 0
      for (const p of myTeamStats) {
        const z = Number(p[cat as keyof typeof p] ?? 0)
        sum += isNaN(z) ? 0 : z
      }

      avgs[cat] = sum / count
    })

    return avgs
  }, [myTeamStats, punted])

  if (isLoading) return <div>Loading roster...</div>
  if (error) return <div>Error loading roster</div>
  if (!data) return <div>No roster data</div>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto mt-4 p-2 flex flex-col gap-y-4">
        <div className="flex items-center gap-x-6">
          <div className="flex flex-col gap-y-2 h-18">
            <p className="text-gray-300 text-sm font-bold">Show zScores</p>
            <Toggle
              enabled={zScoresToggle}
              onChange={() => setZScoresToggle((prev) => !prev)}
            />
          </div>

          <div className="flex flex-col gap-y-2 h-18 w-[150px]">
            <p className="text-gray-300 text-sm font-bold">
              Show Top N Players
            </p>
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

          <div className="flex flex-col gap-y-2 h-18">
            <p className="text-gray-300 text-sm font-bold">Punt Categories</p>
            <div className="flex gap-x-4">
              {PUNTABLE_STATS.map((stat) => (
                <div key={stat.key}>
                  <p className="text-xs font-medium text-gray-400">
                    {stat.label}
                  </p>
                  <Switch
                    checked={punted.includes(stat.key)}
                    onChange={(checked) =>
                      setPunted((prev) =>
                        checked
                          ? [...prev, stat.key]
                          : prev.filter((p) => p !== stat.key),
                      )
                    }
                    className={`${
                      punted.includes(stat.key) ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-5 w-9 items-center rounded-full transition`}
                  >
                    <span
                      className={`${
                        punted.includes(stat.key)
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1 mt-0">
          {isZScoresLoading ? (
            <p className="p-4 text-gray-400">Loading projections...</p>
          ) : (
            myTeamStats &&
            myTeamStats.length > 0 && (
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
                        Games
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
                    {myTeamStats.map((row, i) => (
                      <tr key={i} className="even:bg-zinc-800 odd:bg-zinc-900">
                        <td className="border border-gray-700 px-2 py-1 text-sm">
                          {row.playerName}
                        </td>
                        <td className="border border-gray-700 px-2 py-1 text-sm">
                          {row.rank}
                        </td>
                        <td className="border border-gray-700 px-2 py-1 text-sm">
                          {row.gp}
                        </td>
                        <td className="border border-gray-700 px-2 py-1 text-sm">
                          {row.totalZ.toFixed(2)}
                        </td>
                        <td className="border border-gray-700 px-2 py-1 text-sm">
                          {row.price.toFixed(2)}
                        </td>
                        {(zScoresToggle ? ZSCORE_STATS : REGULAR_STATS).map(
                          (stat) => {
                            const isPunted = punted.includes(
                              stat.replace(/^z/, ''),
                            )
                            return (
                              <td
                                key={stat}
                                className={clsx(
                                  'border border-gray-700 px-2 py-1 text-sm',
                                  isPunted &&
                                    'opacity-60 text-gray-400 saturate-0',
                                )}
                                style={{
                                  backgroundColor: zScoresToggle
                                    ? getZScoreColor(
                                        Number(row[stat as keyof typeof row]) ??
                                          0,
                                        isPunted,
                                      )
                                    : '',
                                }}
                              >
                                {Number(row[stat as keyof typeof row]).toFixed(
                                  2,
                                )}
                              </td>
                            )
                          },
                        )}
                      </tr>
                    ))}

                    <tr>
                      <td className="border border-gray-700 px-2 py-1 text-sm">
                        Avg Z-Scores
                      </td>
                      <td className="border border-gray-700 px-2 py-1" />
                      <td className="border border-gray-700 px-2 py-1" />
                      <td className="border border-gray-700 px-2 py-1" />
                      <td className="border border-gray-700 px-2 py-1" />
                      {ZSCORE_STATS.map((stat) =>
                        punted.includes(stat) ? (
                          <td
                            key={stat}
                            className="border border-gray-700 px-2 py-1 text-gray-400 opacity-60"
                          >
                            —
                          </td>
                        ) : (
                          <td
                            key={stat}
                            className="border border-gray-700 px-2 py-1 text-sm"
                            style={{
                              backgroundColor: getZScoreColor(
                                zAverages[stat],
                                false,
                              ),
                            }}
                          >
                            {zAverages[stat].toFixed(2)}
                          </td>
                        ),
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

const normalizeFantraxName = (name: string) => {
  const [last, first] = name.split(',').map((n) => n.trim())
  return `${first} ${last}`.toLowerCase()
}

const normalizeZScoreName = (name: string) => name.toLowerCase().trim()
