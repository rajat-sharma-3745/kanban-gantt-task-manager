import { create } from 'zustand'
import { generateTasks } from '../data/generateTasks'
import {
  PRIORITY_RANK,
  createDefaultTaskFilters,
  createDefaultTaskListSort,
  type ListSortKey,
  type SortDirection,
  type Task,
  type TaskFilters,
  type TaskListSort,
  type TaskStatus,
} from '../types/task'

export type TaskPatch = Partial<Omit<Task, 'id'>>

type TaskState = {
  tasks: Task[]
  filters: TaskFilters
  listSort: TaskListSort
  updateTask: (id: string, patch: TaskPatch) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  setFilters: (patch: Partial<TaskFilters>) => void
  setFiltersFromQuery: (filters: TaskFilters) => void
  setListSort: (sort: TaskListSort) => void
  setSortBy: (sortBy: ListSortKey) => void
  setSortDir: (sortDir: SortDirection) => void
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

export function getSortedTasks(tasks: Task[], sort: TaskListSort): Task[] {
  const direction = sort.sortDir === 'asc' ? 1 : -1
  const copy = [...tasks]

  copy.sort((a, b) => {
    let diff = 0

    if (sort.sortBy === 'title') {
      diff = a.title.localeCompare(b.title)
    } else if (sort.sortBy === 'priority') {
      diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    } else {
      diff = a.dueDate.localeCompare(b.dueDate)
    }

    if (diff === 0) {
      diff = a.id.localeCompare(b.id)
    }

    return diff * direction
  })

  return copy
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: generateTasks(),
  filters: createDefaultTaskFilters(),
  listSort: createDefaultTaskListSort(),
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
  setListSort: (sort) => set(() => ({ listSort: sort })),
  setSortBy: (sortBy) =>
    set((state) => ({
      listSort: {
        sortBy,
        sortDir:
          state.listSort.sortBy === sortBy && state.listSort.sortDir === 'asc'
            ? 'desc'
            : 'asc',
      },
    })),
  setSortDir: (sortDir) =>
    set((state) => ({
      listSort: {
        ...state.listSort,
        sortDir,
      },
    })),
  clearFilters: () => set(() => ({ filters: createDefaultTaskFilters() })),
}))
