import { useEffect, useMemo, useState } from 'react'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { useLocation, useNavigate } from 'react-router-dom'
import { VirtualTaskTable } from '../components/list/VirtualTaskTable'
import { ASSIGNEES } from '../data/assignees'
import { getFilteredTasks, getSortedTasks, useTaskStore } from '../store/taskStore'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  isAnyFilterActive,
  type ListSortKey,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
} from '../types/task'
import {
  buildSearchFromState,
  parseFiltersFromSearch,
  parseSortFromSearch,
} from '../utils/filterQuery'

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
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const navigate = useNavigate()
  const { search } = useLocation()

  const tasks = useTaskStore((s) => s.tasks)
  const filters = useTaskStore((s) => s.filters)
  const setFilters = useTaskStore((s) => s.setFilters)
  const setFiltersFromQuery = useTaskStore((s) => s.setFiltersFromQuery)
  const clearFilters = useTaskStore((s) => s.clearFilters)
  const listSort = useTaskStore((s) => s.listSort)
  const setListSort = useTaskStore((s) => s.setListSort)
  const setSortBy = useTaskStore((s) => s.setSortBy)
  const setTaskStatus = useTaskStore((s) => s.setTaskStatus)

  useEffect(() => {
    const parsed = parseFiltersFromSearch(search)
    const parsedSort = parseSortFromSearch(search)
    setFiltersFromQuery(parsed)
    setListSort(parsedSort)
  }, [search, setFiltersFromQuery, setListSort])

  useEffect(() => {
    const nextSearch = buildSearchFromState(filters, listSort)
    if (nextSearch !== search) {
      navigate({ search: nextSearch }, { replace: true })
    }
  }, [filters, listSort, navigate, search])

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters],
  )
  const sortedTasks = useMemo(
    () => getSortedTasks(filteredTasks, listSort),
    [filteredTasks, listSort],
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

  const handleSortBy = (sortBy: ListSortKey) => {
    setSortBy(sortBy)
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            viewMode === 'list'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-300 bg-white text-neutral-700'
          }`}
        >
          List View
        </button>
        <button
          type="button"
          onClick={() => setViewMode('kanban')}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            viewMode === 'kanban'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-300 bg-white text-neutral-700'
          }`}
        >
          Kanban View
        </button>
      </section>

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
        ) : viewMode === 'kanban' ? (
          <div className="mt-4">
            <KanbanBoard tasks={filteredTasks} onStatusChange={setTaskStatus} />
          </div>
        ) : (
          <div className="mt-4">
            <VirtualTaskTable
              tasks={sortedTasks}
              sort={listSort}
              onSortBy={handleSortBy}
              onStatusChange={setTaskStatus}
            />
          </div>
        )}
      </section>
    </main>
  )
}
