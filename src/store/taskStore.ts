import { create } from 'zustand'
import { generateTasks } from '../data/generateTasks'
import {
  createDefaultTaskFilters,
  type Task,
  type TaskFilters,
  type TaskStatus,
} from '../types/task'

export type TaskPatch = Partial<Omit<Task, 'id'>>

type TaskState = {
  tasks: Task[]
  filters: TaskFilters
  updateTask: (id: string, patch: TaskPatch) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  setFilters: (patch: Partial<TaskFilters>) => void
  setFiltersFromQuery: (filters: TaskFilters) => void
  clearFilters: () => void
}

export function getFilteredTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
      return false
    }
    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(task.priority)
    ) {
      return false
    }
    if (
      filters.assigneeIds.length > 0 &&
      !filters.assigneeIds.includes(task.assigneeId)
    ) {
      return false
    }
    if (filters.dueFrom && task.dueDate < filters.dueFrom) {
      return false
    }
    if (filters.dueTo && task.dueDate > filters.dueTo) {
      return false
    }
    return true
  })
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: generateTasks(),
  filters: createDefaultTaskFilters(),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  setTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  setFilters: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    })),
  setFiltersFromQuery: (filters) => set(() => ({ filters })),
  clearFilters: () => set(() => ({ filters: createDefaultTaskFilters() })),
}))
