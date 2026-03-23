import { create } from 'zustand'
import { generateTasks } from '../data/generateTasks'
import type { Task, TaskStatus } from '../types/task'

export type TaskPatch = Partial<Omit<Task, 'id'>>

type TaskState = {
  tasks: Task[]
  updateTask: (id: string, patch: TaskPatch) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: generateTasks(),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  setTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}))
