'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Task } from './TaskCard'

/**
 * SimpleTaskList — Accessible task list for simple feedback mode.
 *
 * Displays tasks with big text, large tap targets, and clear completion status.
 * Designed for faculty testers who need minimal cognitive load.
 */
export function SimpleTaskList({
  onBack,
  onTaskCountChange,
}: {
  onBack: () => void
  onTaskCountChange: (count: number) => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completingId, setCompletingId] = useState<number | null>(null)

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

  async function handleComplete(task: Task) {
    setCompletingId(task.id)
    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType: 'task_completion',
          title: `Completed: ${task.title}`,
          taskId: task.id,
          pageUrl: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      })

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
        )
        const remaining = tasks.filter((t) => !t.completed && t.id !== task.id).length
        onTaskCountChange(remaining)
      }
    } catch {
      // Silently fail
    } finally {
      setCompletingId(null)
    }
  }

  // Sort: incomplete first
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="flex flex-col gap-5 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm text-white/50
          hover:text-white/80 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Testing Tasks
        </h3>
        {tasks.length > 0 && (
          <span className="text-sm text-white/50">
            {completedCount}/{tasks.length} done
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-base text-white/50">
          Loading tasks...
        </div>
      )}

      {/* Empty state */}
      {!loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <span className="text-4xl">📋</span>
          <p className="text-lg text-white/60">No tasks available yet</p>
          <p className="text-sm text-white/50">Check back soon!</p>
        </div>
      )}

      {/* Task list */}
      {!loading && sorted.map((task, i) => (
        <div
          key={task.id}
          className={`flex items-start gap-4 p-5 rounded-2xl
            border border-white/10 bg-white/[0.04]
            transition-opacity
            ${task.completed ? 'opacity-50' : ''}
            opacity-0 animate-fade-in-up`}
          style={{
            animationDelay: `${100 + i * 60}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {/* Completion indicator */}
          <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-lg
            ${task.completed
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/[0.06] text-white/40'
            }`}
          >
            {task.completed ? '✓' : (
              <span className="w-3 h-3 rounded-full border-2 border-current" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-base font-medium leading-snug mb-1
              ${task.completed
                ? 'line-through text-white/40'
                : 'text-[var(--color-text-primary)]'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                {task.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {task.targetUrl && !task.completed && (
                <a
                  href={task.targetUrl}
                  className="text-sm text-[var(--color-accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to page →
                </a>
              )}
              {!task.completed && (
                <button
                  onClick={() => handleComplete(task)}
                  disabled={completingId === task.id}
                  className="text-sm px-4 py-2 rounded-lg
                    bg-[var(--color-accent)]/10 text-[var(--color-accent)]
                    border border-[var(--color-accent)]/20
                    hover:bg-[var(--color-accent)]/20
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {completingId === task.id ? 'Saving...' : '✓ Done'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
