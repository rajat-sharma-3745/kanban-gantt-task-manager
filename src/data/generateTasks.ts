import { ASSIGNEE_IDS } from './assignees'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../types/task'

function createSeededRandom(seed: number) {
  let value = seed

  return function () {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function formatDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]!
}

const VERBS = [
  'Fix',
  'Ship',
  'Audit',
  'Draft',
  'Review',
  'Refactor',
  'Design',
  'Migrate',
  'Document',
  'Automate',
  'Test',
  'Scope',
  'Prioritize',
  'Schedule',
  'Deploy',
] as const

const ADJECTIVES = [
  'urgent',
  'legacy',
  'blocking',
  'recurring',
  'cross-team',
  'customer-facing',
  'internal',
  'beta',
  'critical-path',
  'incremental',
] as const

const NOUNS = [
  'onboarding flow',
  'billing pipeline',
  'API contract',
  'dashboard widgets',
  'search index',
  'auth hardening',
  'metrics pipeline',
  'release checklist',
  'error budget',
  'data migration',
  'cache layer',
  'notification rules',
  'access policy',
  'performance budget',
  'QA sign-off',
] as const

function buildTitle(rand: () => number, index: number): string {
  const v = pick(VERBS, rand)
  const a = pick(ADJECTIVES, rand)
  const n = pick(NOUNS, rand)
  return `${v} ${a} ${n} (#${index + 1})`
}

function dueDateForIndex(
  i: number,
  today: Date,
  rand: () => number,
): string {
  const bucket = i % 120

  if (bucket < 10) {
    return formatDateOnly(today)
  }
  if (bucket < 28) {
    const daysAgo = 1 + Math.floor(rand() * 7)
    return formatDateOnly(addDays(today, -daysAgo))
  }
  if (bucket < 48) {
    const daysAgo = 8 + Math.floor(rand() * 23)
    return formatDateOnly(addDays(today, -daysAgo))
  }
  if (bucket < 85) {
    const daysAhead = Math.floor(rand() * 45)
    return formatDateOnly(addDays(today, daysAhead))
  }
  const daysAgo = 1 + Math.floor(rand() * 60)
  return formatDateOnly(addDays(today, -daysAgo))
}

function optionalStartDate(
  due: string,
  rand: () => number,
  forceOmit: boolean,
): string | undefined {
  if (forceOmit || rand() < 0.22) {
    return undefined
  }
  const dueDate = new Date(due + 'T12:00:00')
  const span = 1 + Math.floor(rand() * 14)
  const start = addDays(dueDate, -span)
  const startStr = formatDateOnly(start)
  if (startStr > due) {
    return due
  }
  return startStr
}

export function generateTasks(count = 520, seed = 42): Task[] {
  if (count < 1) {
    return []
  }

  const rand = createSeededRandom(seed)
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const tasks: Task[] = []

  for (let i = 0; i < count; i++) {
    const dueDate = dueDateForIndex(i, today, rand)
    const forceNoStart = i % 17 === 0 || i % 23 === 0
    const startDate = optionalStartDate(dueDate, rand, forceNoStart)

    const status = pick(TASK_STATUSES, rand) as TaskStatus
    const priority = pick(TASK_PRIORITIES, rand) as TaskPriority
    const assigneeId = pick(ASSIGNEE_IDS, rand)

    tasks.push({
      id: `task-${i + 1}`,
      title: buildTitle(rand, i),
      status,
      priority,
      assigneeId,
      dueDate,
      ...(startDate !== undefined ? { startDate } : {}),
    })
  }

  return tasks
}
