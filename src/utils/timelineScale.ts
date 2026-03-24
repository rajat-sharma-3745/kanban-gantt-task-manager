export type TimelineScale = {
  monthStart: Date
  monthEnd: Date
  daysInMonth: number
  dayWidth: number
  totalWidth: number
  todayIndex: number | null
  dayLabels: string[]
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function createTimelineScale(dayWidth = 32): TimelineScale {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = monthEnd.getDate()

  const todayIndex =
    now.getMonth() === monthStart.getMonth() &&
    now.getFullYear() === monthStart.getFullYear()
      ? now.getDate() - 1
      : null

  return {
    monthStart,
    monthEnd,
    daysInMonth,
    dayWidth,
    totalWidth: dayWidth * daysInMonth,
    todayIndex,
    dayLabels: Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
  }
}

export function dayIndexInMonth(dateIso: string, monthStart: Date): number {
  const date = new Date(`${dateIso}T00:00:00`)
  const start = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    monthStart.getDate(),
  )
  return Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY)
}

export function clampToMonth(index: number, daysInMonth: number): number {
  return clamp(index, 0, daysInMonth - 1)
}
