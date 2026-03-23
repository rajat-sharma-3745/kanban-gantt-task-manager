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
