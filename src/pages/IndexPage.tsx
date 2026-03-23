import { useTaskStore } from '../store/taskStore'

export function IndexPage() {
  const taskCount = useTaskStore((s) => s.tasks)

  return (
    <main className="p-6">
      <p className="text-neutral-700 dark:text-neutral-300">
        Tasks {taskCount.map((task) => 
        <div key={task.id}>{task.title}</div>)}
      </p>
    </main>
  )
}
