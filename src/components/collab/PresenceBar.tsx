import type { PresenceUser } from '../../hooks/useMockPresence'

type PresenceBarProps = {
  users: PresenceUser[]
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export function PresenceBar({ users }: PresenceBarProps) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-sm text-neutral-700">
        {users.length} people are viewing this board
      </p>

      <div className="flex items-center">
        {users.map((user, i) => (
          <div
            key={user.id}
            className={`-ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white transition-all ${user.colorClass} ${
              i === 0 ? 'ml-0' : ''
            }`}
            title={user.name}
          >
            {initials(user.name)}
          </div>
        ))}
      </div>
    </div>
  )
}
