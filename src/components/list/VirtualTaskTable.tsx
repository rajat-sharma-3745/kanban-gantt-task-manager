import { useMemo, useState } from 'react'
import { ASSIGNEES } from '../../data/assignees'
import { TASK_STATUSES, type ListSortKey, type Task, type TaskListSort, type TaskStatus } from '../../types/task'

const ROW_HEIGHT = 64
const BUFFER_ROWS = 5
const VIEWPORT_HEIGHT = 460

type VirtualTaskTableProps = {
  tasks: Task[]
  sort: TaskListSort
  onSortBy: (sortBy: ListSortKey) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

function SortHeader({
  label,
  sortKey,
  activeSort,
  onClick,
}: {
  label: string
  sortKey: ListSortKey
  activeSort: TaskListSort
  onClick: (key: ListSortKey) => void
}) {
  const isActive = activeSort.sortBy === sortKey
  const indicator = isActive ? (activeSort.sortDir === 'asc' ? '▲' : '▼') : '↕'

  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className={`inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide ${
        isActive ? 'text-neutral-900' : 'text-neutral-500'
      }`}
    >
      <span>{label}</span>
      <span aria-hidden>{indicator}</span>
    </button>
  )
}

export function VirtualTaskTable({
  tasks,
  sort,
  onSortBy,
  onStatusChange,
}: VirtualTaskTableProps) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = tasks.length * ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS)
  const endIndex = Math.min(
    tasks.length - 1,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + BUFFER_ROWS,
  )

  const visibleRows = useMemo(() => {
    if (tasks.length === 0) {
      return []
    }
    return tasks.slice(startIndex, endIndex + 1).map((task, idx) => ({
      task,
      absoluteIndex: startIndex + idx,
    }))
  }, [endIndex, startIndex, tasks])

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="grid grid-cols-[2.3fr_1fr_1fr_1fr_1fr] border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <SortHeader label="Title" sortKey="title" activeSort={sort} onClick={onSortBy} />
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Assignee
        </span>
        <SortHeader
          label="Priority"
          sortKey="priority"
          activeSort={sort}
          onClick={onSortBy}
        />
        <SortHeader
          label="Due Date"
          sortKey="dueDate"
          activeSort={sort}
          onClick={onSortBy}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
        </span>
      </div>

      <div
        className="relative overflow-y-auto"
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: `${totalHeight}px` }} className="relative">
          {visibleRows.map(({ task, absoluteIndex }) => {
            const assignee = ASSIGNEES.find((a) => a.id === task.assigneeId)
            return (
              <div
                key={task.id}
                className="absolute left-0 grid w-full grid-cols-[2.3fr_1fr_1fr_1fr_1fr] items-center border-b border-neutral-100 px-4"
                style={{
                  top: `${absoluteIndex * ROW_HEIGHT}px`,
                  height: `${ROW_HEIGHT}px`,
                }}
              >
                <p className="truncate pr-2 text-sm font-medium text-neutral-800">{task.title}</p>
                <p className="text-sm text-neutral-600">{assignee?.displayName ?? task.assigneeId}</p>
                <p className="text-sm capitalize text-neutral-700">{task.priority}</p>
                <p className="text-sm text-neutral-700">{task.dueDate}</p>
                <label className="sr-only" htmlFor={`status-${task.id}`}>
                  Status
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                  className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-700"
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
