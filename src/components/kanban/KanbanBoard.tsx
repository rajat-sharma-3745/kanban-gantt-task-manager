import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ASSIGNEES } from '../../data/assignees'
import type { Task, TaskStatus } from '../../types/task'
import { TASK_STATUSES } from '../../types/task'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'

type KanbanBoardProps = {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

type DragState = {
  taskId: string
  sourceStatus: TaskStatus
  sourceIndex: number
  sourceRect: DOMRect
  cardHeight: number
  offsetX: number
  offsetY: number
  pointerX: number
  pointerY: number
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dropStatus, setDropStatus] = useState<TaskStatus | null>(null)
  const [snapBack, setSnapBack] = useState(false)
  const clearTimerRef = useRef<number | null>(null)

  const grouped = useMemo(() => {
    const base: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    }
    tasks.forEach((task) => {
      base[task.status].push(task)
    })
    return base
  }, [tasks])

  useEffect(() => {
    return () => {
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!drag) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY)
      const zone = element?.closest('[data-drop-status]')
      const status = zone?.getAttribute('data-drop-status')
      const nextDrop = TASK_STATUSES.includes(status as TaskStatus)
        ? (status as TaskStatus)
        : null

      setDropStatus(nextDrop)
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              pointerX: event.clientX,
              pointerY: event.clientY,
            }
          : null,
      )
    }

    const clearDragState = () => {
      setDropStatus(null)
      setDrag(null)
      setSnapBack(false)
    }

    const handlePointerUp = () => {
      if (dropStatus) {
        onStatusChange(drag.taskId, dropStatus)
        clearDragState()
        return
      }

      setSnapBack(true)
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              pointerX: prev.sourceRect.left + prev.offsetX,
              pointerY: prev.sourceRect.top + prev.offsetY,
            }
          : null,
      )
      clearTimerRef.current = window.setTimeout(clearDragState, 180)
    }

    const handleCancel = () => {
      clearDragState()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handleCancel)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handleCancel)
    }
  }, [drag, dropStatus, onStatusChange])

  const previewTask = drag ? tasks.find((task) => task.id === drag.taskId) : null
  const previewAssignee = previewTask
    ? ASSIGNEES.find((assignee) => assignee.id === previewTask.assigneeId)
    : null

  const startDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    task: Task,
    status: TaskStatus,
    index: number,
  ) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    setSnapBack(false)
    setDrag({
      taskId: task.id,
      sourceStatus: status,
      sourceIndex: index,
      sourceRect: rect,
      cardHeight: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
    })
  }

  const renderColumn = (status: TaskStatus) => {
    const tasksInColumn = grouped[status]
    const withPlaceholder = tasksInColumn.flatMap((task, idx) => {
      if (!drag || drag.sourceStatus !== status || drag.sourceIndex !== idx) {
        return [{ kind: 'task' as const, task, index: idx }]
      }
      return [
        { kind: 'placeholder' as const, index: idx },
        { kind: 'task' as const, task, index: idx },
      ]
    })

    const visibleItems = withPlaceholder.filter((item) => {
      if (item.kind === 'placeholder') {
        return true
      }
      return item.task.id !== drag?.taskId
    })

    return (
      <KanbanColumn
        key={status}
        status={status}
        title={STATUS_LABELS[status]}
        count={tasksInColumn.length}
        isDropTarget={dropStatus === status}
      >
        {tasksInColumn.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-center text-sm text-neutral-500">
            No tasks in this column.
          </div>
        ) : (
          visibleItems.map((item) => {
            if (item.kind === 'placeholder') {
              return (
                <div
                  key={`placeholder-${status}-${item.index}`}
                  className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100"
                  style={{ height: `${drag?.cardHeight ?? 80}px` }}
                />
              )
            }

            const assigneeName =
              ASSIGNEES.find((assignee) => assignee.id === item.task.assigneeId)
                ?.displayName ?? item.task.assigneeId

            return (
              <KanbanCard
                key={item.task.id}
                task={item.task}
                assigneeName={assigneeName}
                onPointerDown={(event) =>
                  startDrag(event, item.task, status, item.index)
                }
              />
            )
          })
        )}
      </KanbanColumn>
    )
  }

  return (
    <div className="relative">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((status) => renderColumn(status))}
      </div>

      {drag && previewTask ? (
        <div
          className="pointer-events-none fixed z-50 transition-[top,left] duration-150 ease-out"
          style={{
            left: `${drag.pointerX - drag.offsetX}px`,
            top: `${drag.pointerY - drag.offsetY}px`,
            width: `${drag.sourceRect.width}px`,
            transitionDuration: snapBack ? '180ms' : '0ms',
          }}
        >
          <KanbanCard
            task={previewTask}
            assigneeName={previewAssignee?.displayName ?? previewTask.assigneeId}
            isDragging
          />
        </div>
      ) : null}
    </div>
  )
}
