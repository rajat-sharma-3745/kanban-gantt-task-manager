import type { ReactNode } from 'react'
import type { TaskStatus } from '../../types/task'

type KanbanColumnProps = {
  status: TaskStatus
  title: string
  count: number
  isDropTarget: boolean
  children: ReactNode
}

export function KanbanColumn({
  status,
  title,
  count,
  isDropTarget,
  children,
}: KanbanColumnProps) {
  return (
    <section className="flex min-h-112 flex-col rounded-xl border border-neutral-200 bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600">
          {count}
        </span>
      </header>

      <div
        data-drop-status={status}
        className={`flex-1 space-y-2 overflow-y-auto p-3 transition-colors ${
          isDropTarget ? 'bg-emerald-200' : ''
        }`}
        style={{ maxHeight: '34rem' }}
      >
        {children}
      </div>
    </section>
  )
}
