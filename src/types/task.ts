export const TASK_STATUSES = [
  'todo',
  'in_progress',
  'in_review',
  'done',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = [
  'critical',
  'high',
  'medium',
  'low',
] as const

export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/** Lower number = higher priority for sorting (Critical first). */
export const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string
  startDate?: string
}

export type Assignee = {
  id: string
  displayName: string
}

export type TaskFilters = {
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  assigneeIds: string[]
  dueFrom?: string
  dueTo?: string
}

export const LIST_SORT_KEYS = ['title', 'priority', 'dueDate'] as const
export type ListSortKey = (typeof LIST_SORT_KEYS)[number]

export const SORT_DIRECTIONS = ['asc', 'desc'] as const
export type SortDirection = (typeof SORT_DIRECTIONS)[number]

export type TaskListSort = {
  sortBy: ListSortKey
  sortDir: SortDirection
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueFrom: undefined,
  dueTo: undefined,
}

export function createDefaultTaskFilters(): TaskFilters {
  return {
    statuses: [],
    priorities: [],
    assigneeIds: [],
    dueFrom: undefined,
    dueTo: undefined,
  }
}

export const DEFAULT_TASK_LIST_SORT: TaskListSort = {
  sortBy: 'dueDate',
  sortDir: 'asc',
}

export function createDefaultTaskListSort(): TaskListSort {
  return {
    sortBy: 'dueDate',
    sortDir: 'asc',
  }
}

export function isAnyFilterActive(filters: TaskFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    Boolean(filters.dueFrom) ||
    Boolean(filters.dueTo)
  )
}
