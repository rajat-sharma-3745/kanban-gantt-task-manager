import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Task, TaskPriority } from '../../types/task'
import { getDueDateLabel } from '../../utils/dateLabels'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-sky-100 text-sky-700',
  low: 'bg-emerald-100 text-emerald-700',
}

type KanbanCardProps = {
  task: Task
  assigneeName: string
  isDragging?: boolean
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void
}

function toInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export function KanbanCard({
  task,
  assigneeName,
  isDragging = false,
  onPointerDown,
}: KanbanCardProps) {
  const due = getDueDateLabel(task.dueDate)

  return (
    <div
      onPointerDown={onPointerDown}
      className={`rounded-xl border border-neutral-200 bg-white p-3 ${
        isDragging ? 'opacity-70 shadow-xl' : 'shadow-sm'
      }`}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <p className="text-sm font-medium text-neutral-800">{task.title}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
          {toInitials(assigneeName)}
        </span>

        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <p
        className={`mt-2 text-xs font-medium ${
          due.isOverdue ? 'text-rose-600' : 'text-neutral-500'
        }`}
      >
        {due.label}
      </p>
    </div>
  )
}
