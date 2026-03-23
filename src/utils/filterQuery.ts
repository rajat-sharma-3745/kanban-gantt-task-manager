import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  createDefaultTaskFilters,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
} from '../types/task'

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value)
}

function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
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

export function buildSearchFromFilters(filters: TaskFilters): string {
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

  const query = params.toString()
  return query ? `?${query}` : ''
}
