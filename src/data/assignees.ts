import type { Assignee } from '../types/task'

export const ASSIGNEES: readonly Assignee[] = [
  { id: 'u1', displayName: 'Ajay' },
  { id: 'u2', displayName: 'Shubham' },
  { id: 'u3', displayName: 'Ram' },
  { id: 'u4', displayName: 'Abhay' },
  { id: 'u5', displayName: 'Amit' },
  { id: 'u6', displayName: 'Akhil' },
] as const

export const ASSIGNEE_IDS = ASSIGNEES.map((a) => a.id)
