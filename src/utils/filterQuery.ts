import {
  LIST_SORT_KEYS,
  SORT_DIRECTIONS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  createDefaultTaskFilters,
  createDefaultTaskListSort,
  type ListSortKey,
  type SortDirection,
  type TaskFilters,
  type TaskListSort,
  type TaskPriority,
  type TaskStatus,
} from '../types/task'

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value)
}

function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
}

function isListSortKey(value: string): value is ListSortKey {
  return (LIST_SORT_KEYS as readonly string[]).includes(value)
}

function isSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value)
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

export function parseFiltersFromSearch(search: string): TaskFilters {
  const params = new URLSearchParams(search)
  const defaults = createDefaultTaskFilters()

  const statuses = unique(params.getAll('status').filter(isTaskStatus))
  const priorities = unique(params.getAll('priority').filter(isTaskPriority))
  const assigneeIds = unique(params.getAll('assignee').filter(Boolean))

  const dueFromRaw = params.get('dueFrom')
  const dueToRaw = params.get('dueTo')

  return {
    ...defaults,
    statuses,
    priorities,
    assigneeIds,
    dueFrom: dueFromRaw && isIsoDate(dueFromRaw) ? dueFromRaw : undefined,
    dueTo: dueToRaw && isIsoDate(dueToRaw) ? dueToRaw : undefined,
  }
}

export function parseSortFromSearch(search: string): TaskListSort {
  const params = new URLSearchParams(search)
  const defaults = createDefaultTaskListSort()
  const sortByRaw = params.get('sortBy')
  const sortDirRaw = params.get('sortDir')

  return {
    sortBy: sortByRaw && isListSortKey(sortByRaw) ? sortByRaw : defaults.sortBy,
    sortDir:
      sortDirRaw && isSortDirection(sortDirRaw) ? sortDirRaw : defaults.sortDir,
  }
}

export function buildSearchFromState(
  filters: TaskFilters,
  sort: TaskListSort,
): string {
  const params = new URLSearchParams()

  filters.statuses.forEach((status) => params.append('status', status))
  filters.priorities.forEach((priority) => params.append('priority', priority))
  filters.assigneeIds.forEach((assigneeId) =>
    params.append('assignee', assigneeId),
  )

  if (filters.dueFrom) {
    params.set('dueFrom', filters.dueFrom)
  }

  if (filters.dueTo) {
    params.set('dueTo', filters.dueTo)
  }

  params.set('sortBy', sort.sortBy)
  params.set('sortDir', sort.sortDir)

  const query = params.toString()
  return query ? `?${query}` : ''
}
