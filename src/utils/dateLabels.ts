export function getDueDateLabel(dueDate: string): {
  label: string
  isOverdue: boolean
} {
  const due = new Date(`${dueDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const msPerDay = 24 * 60 * 60 * 1000
  const dayDiff = Math.floor((today.getTime() - due.getTime()) / msPerDay)

  if (dayDiff === 0) {
    return { label: 'Due Today', isOverdue: false }
  }

  if (dayDiff > 7) {
    return { label: `${dayDiff} days overdue`, isOverdue: true }
  }

  if (dayDiff > 0) {
    return { label: dueDate, isOverdue: true }
  }

  return { label: dueDate, isOverdue: false }
}
