import { useEffect, useMemo, useState } from 'react'

export type PresenceUser = {
  id: string
  name: string
  colorClass: string
}

export type PresenceAssignment = {
  userId: string
  taskId: string
}

const MOCK_USERS: PresenceUser[] = [
  { id: 'p1', name: 'Ajay', colorClass: 'bg-violet-500' },
  { id: 'p2', name: 'Shubham', colorClass: 'bg-sky-500' },
  { id: 'p3', name: 'Ram', colorClass: 'bg-emerald-500' },
  { id: 'p4', name: 'Abhay', colorClass: 'bg-amber-500' },
]

const MOVE_INTERVAL_MS = 4000
const STICK_PROBABILITY = 0.8
const VIEWER_COUNT_INTERVAL_MS = 6000

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomTask(taskIds: string[]): string | null {
  if (taskIds.length === 0) {
    return null
  }
  return taskIds[randomInt(0, taskIds.length - 1)] ?? null
}

export function useMockPresence(taskIds: string[]) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])
  const [assignments, setAssignments] = useState<PresenceAssignment[]>([])

  useEffect(() => {
    if (taskIds.length === 0) {
      setActiveUsers([])
      setAssignments([])
      return
    }

    const count = randomInt(2, 4)
    const users = MOCK_USERS.slice(0, count)
    setActiveUsers(users)
    setAssignments(
      users
        .map((user) => {
          const taskId = randomTask(taskIds)
          return taskId ? { userId: user.id, taskId } : null
        })
        .filter((x): x is PresenceAssignment => Boolean(x)),
    )
  }, [taskIds])

  useEffect(() => {
    if (taskIds.length === 0 || activeUsers.length === 0) {
      return
    }

    const moveId = window.setInterval(() => {
      setAssignments((prev) =>
        prev.map((assignment) => {
          if (Math.random() < STICK_PROBABILITY) {
            return assignment
          }
          const nextTask = randomTask(taskIds)
          return nextTask ? { ...assignment, taskId: nextTask } : assignment
        }),
      )
    }, MOVE_INTERVAL_MS)

    const viewerCountId = window.setInterval(() => {
      const nextCount = randomInt(2, 4)
      const nextUsers = MOCK_USERS.slice(0, nextCount)
      setActiveUsers(nextUsers)
      setAssignments((prev) => {
        const previousByUser = new Map(prev.map((a) => [a.userId, a.taskId]))
        return nextUsers
          .map((user) => {
            const taskId = previousByUser.get(user.id) ?? randomTask(taskIds)
            return taskId ? { userId: user.id, taskId } : null
          })
          .filter((x): x is PresenceAssignment => Boolean(x))
      })
    }, VIEWER_COUNT_INTERVAL_MS)

    return () => {
      window.clearInterval(moveId)
      window.clearInterval(viewerCountId)
    }
  }, [activeUsers, taskIds])

  const taskPresenceMap = useMemo(() => {
    const map = new Map<string, PresenceUser[]>()
    const userById = new Map(activeUsers.map((u) => [u.id, u]))
    assignments.forEach((assignment) => {
      const user = userById.get(assignment.userId)
      if (!user) {
        return
      }
      const current = map.get(assignment.taskId) ?? []
      map.set(assignment.taskId, [...current, user])
    })
    return map
  }, [activeUsers, assignments])

  return {
    activeUsers,
    taskPresenceMap,
  }
}
