import { ASSIGNEES } from '../../data/assignees'
import type { PresenceUser } from '../../hooks/useMockPresence'
import type { Task, TaskPriority } from '../../types/task'
import {
  clampToMonth,
  createTimelineScale,
  dayIndexInMonth,
} from '../../utils/timelineScale'

type TimelineViewProps = {
  tasks: Task[]
  presenceByTask: Map<string, PresenceUser[]>
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  critical: 'bg-rose-500',
  high: 'bg-amber-500',
  medium: 'bg-sky-500',
  low: 'bg-emerald-500',
}
function firstChar(name: string): string {
  const c = name.trim()[0]
  return c ? c.toUpperCase() : '?'
}

function PresenceStack({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) {
    return null
  }

  const visible = users.slice(0, 2)
  const overflow = users.length - visible.length
  return (
    <div className="ml-2 flex items-center">
      {visible.map((user, _i) => (
        <span
        key={user.id}
        className={`-ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white text-[10px] font-semibold text-white ... ${user.colorClass} ...`}
        title={user.name}
      >
        {firstChar(user.name)}
      </span>
      ))}
      {overflow > 0 ? (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-200 px-1 text-[10px] font-semibold text-neutral-700">
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

export function TimelineView({ tasks, presenceByTask }: TimelineViewProps) {
  const scale = createTimelineScale(32)
  const rowHeight = 56

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <div className="min-w-[980px]" style={{ width: `${scale.totalWidth + 320}px` }}>
        <div className="sticky top-0 z-10 flex border-b border-neutral-200 bg-neutral-50">
          <div className="w-80 border-r border-neutral-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Task
          </div>
          <div className="relative flex-1">
            <div
              className="grid text-[11px] text-neutral-500"
              style={{
                gridTemplateColumns: `repeat(${scale.daysInMonth}, minmax(0, 1fr))`,
              }}
            >
              {scale.dayLabels.map((day) => (
                <div
                  key={day}
                  className="border-l border-neutral-200 px-1 py-2 text-center"
                >
                  {day}
                </div>
              ))}
            </div>
            {scale.todayIndex !== null ? (
              <div
                className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-rose-500/80"
                style={{
                  left: `${scale.todayIndex * scale.dayWidth + scale.dayWidth / 2}px`,
                }}
              />
            ) : null}
          </div>
        </div>

        {tasks.map((task) => {
          const assignee =
            ASSIGNEES.find((a) => a.id === task.assigneeId)?.displayName ??
            task.assigneeId
          const dueIdx = clampToMonth(
            dayIndexInMonth(task.dueDate, scale.monthStart),
            scale.daysInMonth,
          )
          const startIdx = task.startDate
            ? clampToMonth(
                dayIndexInMonth(task.startDate, scale.monthStart),
                scale.daysInMonth,
              )
            : dueIdx
          const left = Math.min(startIdx, dueIdx) * scale.dayWidth
          const width = Math.max(1, Math.abs(dueIdx - startIdx) + 1) * scale.dayWidth
          const presence = presenceByTask.get(task.id) ?? []

          return (
            <div
              key={task.id}
              className="flex border-b border-neutral-100"
              style={{ height: `${rowHeight}px` }}
            >
              <div className="flex w-80 items-center gap-2 border-r border-neutral-100 px-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {task.title}
                  </p>
                  <p className="text-xs text-neutral-500">{assignee}</p>
                </div>
                <PresenceStack users={presence} />
              </div>
              <div className="relative flex-1">
                <div
                  className={`absolute top-1/2 h-6 -translate-y-1/2 rounded-md ${PRIORITY_COLOR[task.priority]} ${
                    task.startDate ? 'opacity-90' : 'w-2 rounded-full'
                  }`}
                  style={{
                    left: `${left}px`,
                    width: task.startDate ? `${width - 4}px` : '8px',
                  }}
                  title={`${task.startDate ?? task.dueDate} → ${task.dueDate}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
