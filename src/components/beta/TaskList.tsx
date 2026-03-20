'use client'

import { useEffect, useState, useCallback } from 'react'
import { TaskCard, type Task } from './TaskCard'

/**
 * TaskList — Fetches and displays active beta tasks.
 *
 * Tasks are sorted with incomplete first, completed at the bottom.
 * Completion triggers a re-fetch and updates the parent task count badge.
 */
export function TaskList({
  onTaskCountChange,
}: {
  onTaskCountChange: (count: number) => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/beta?action=tasks')
      const data = await res.json()
      if (data.tasks) {
        setTasks(data.tasks)
        const pending = data.tasks.filter((t: Task) => !t.completed).length
        onTaskCountChange(pending)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [onTaskCountChange])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  function handleComplete(taskId: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    )
    const remaining = tasks.filter((t) => !t.completed && t.id !== taskId).length
    onTaskCountChange(remaining)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
        Loading tasks...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <span className="text-2xl">📋</span>
        <p className="text-sm text-[var(--color-text-muted)]">No tasks available yet</p>
      </div>
    )
  }

  // Sort: incomplete first, then completed
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Testing Tasks
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {tasks.filter((t) => t.completed).length}/{tasks.length} done
        </span>
      </div>
      {sorted.map((task) => (
        <TaskCard key={task.id} task={task} onComplete={handleComplete} />
      ))}
    </div>
  )
}
