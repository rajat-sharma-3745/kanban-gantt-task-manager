import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ASSIGNEES } from '../data/assignees'
import { getFilteredTasks, useTaskStore } from '../store/taskStore'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  isAnyFilterActive,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
} from '../types/task'
import { buildSearchFromFilters, parseFiltersFromSearch } from '../utils/filterQuery'

function toggleInArray<T extends string>(arr: T[], value: T): T[] {
  if (arr.includes(value)) {
    return arr.filter((item) => item !== value)
  }
  return [...arr, value]
}

function MultiSelectChips<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: readonly T[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function IndexPage() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const tasks = useTaskStore((s) => s.tasks)
  const filters = useTaskStore((s) => s.filters)
  const setFilters = useTaskStore((s) => s.setFilters)
  const setFiltersFromQuery = useTaskStore((s) => s.setFiltersFromQuery)
  const clearFilters = useTaskStore((s) => s.clearFilters)

  useEffect(() => {
    const parsed = parseFiltersFromSearch(search)
    setFiltersFromQuery(parsed)
  }, [search, setFiltersFromQuery])

  useEffect(() => {
    const nextSearch = buildSearchFromFilters(filters)
    if (nextSearch !== search) {
      navigate({ search: nextSearch }, { replace: true })
    }
  }, [filters, navigate, search])

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters],
  )

  const hasActiveFilters = isAnyFilterActive(filters)

  const handleStatusToggle = (status: TaskStatus) =>
    setFilters({ statuses: toggleInArray(filters.statuses, status) })

  const handlePriorityToggle = (priority: TaskPriority) =>
    setFilters({ priorities: toggleInArray(filters.priorities, priority) })

  const handleAssigneeToggle = (assigneeId: string) =>
    setFilters({ assigneeIds: toggleInArray(filters.assigneeIds, assigneeId) })

  const updateDateFilter = (
    key: keyof Pick<TaskFilters, 'dueFrom' | 'dueTo'>,
    value: string,
  ) => {
    setFilters({ [key]: value || undefined })
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MultiSelectChips
            title="Status"
            options={TASK_STATUSES}
            selected={filters.statuses}
            onToggle={handleStatusToggle}
          />
          <MultiSelectChips
            title="Priority"
            options={TASK_PRIORITIES}
            selected={filters.priorities}
            onToggle={handlePriorityToggle}
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Assignee
            </span>
            <div className="flex flex-wrap gap-2">
              {ASSIGNEES.map((assignee) => {
                const active = filters.assigneeIds.includes(assignee.id)
                return (
                  <button
                    key={assignee.id}
                    type="button"
                    onClick={() => handleAssigneeToggle(assignee.id)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {assignee.displayName}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Due Date
            </span>
            <div className="flex gap-3">
              <label className="flex flex-col gap-1 text-sm text-neutral-700">
                From
                <input
                  type="date"
                  value={filters.dueFrom ?? ''}
                  onChange={(e) => updateDateFilter('dueFrom', e.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-700">
                To
                <input
                  type="date"
                  value={filters.dueTo ?? ''}
                  onChange={(e) => updateDateFilter('dueTo', e.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-2 py-1"
                />
              </label>
            </div>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-neutral-800 px-3 py-1 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <p className="text-sm text-neutral-600">
          Filtered tasks: {filteredTasks.length} / {tasks.length}
        </p>

        {filteredTasks.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-neutral-800">
              No tasks match these filters
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Try broadening your filters or clear them to view all tasks.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filteredTasks.slice(0, 12).map((task) => (
              <li
                key={task.id}
                className="rounded-lg border border-neutral-200 bg-white p-3"
              >
                <p className="font-medium text-neutral-800">{task.title}</p>
                <p className="mt-1 text-xs text-neutral-600">
                  {task.status} • {task.priority} • due {task.dueDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
