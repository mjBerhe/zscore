import { Switch } from '@headlessui/react'

export const Toggle: React.FC<{ enabled: boolean; onChange: () => void }> = ({
  enabled,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 items-center rounded-full transition`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
      {/* <span className="text-sm text-gray-300">Show zScores</span> */}
    </div>
  )
}
