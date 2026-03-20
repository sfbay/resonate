'use client'

import { useState } from 'react'

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  hard: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const CATEGORY_ACCENTS: Record<string, string> = {
  bug_hunt: 'border-l-red-400',
  feature_test: 'border-l-blue-400',
  exploration: 'border-l-purple-400',
  feedback: 'border-l-amber-400',
}

export type Task = {
  id: number
  title: string
  description?: string
  category: string
  targetUrl?: string
  points: number
  difficulty: string
  completed: boolean
}

/**
 * TaskCard — Displays a single testing task with completion tracking.
 *
 * Shows difficulty badge, points, and an optional "Go to page" link.
 * Completed tasks are styled as checked off. Click "Mark Complete"
 * to submit a task_completion feedback entry.
 */
export function TaskCard({
  task,
  onComplete,
}: {
  task: Task
  onComplete: (taskId: number) => void
}) {
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
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
        onComplete(task.id)
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setCompleting(false)
    }
  }

  const accentClass = CATEGORY_ACCENTS[task.category] || 'border-l-white/20'
  const difficultyClass = DIFFICULTY_COLORS[task.difficulty] || DIFFICULTY_COLORS.medium

  return (
    <div
      className={`rounded-lg border border-white/10 border-l-[3px] ${accentClass}
        bg-white/[0.03] transition-opacity
        ${task.completed ? 'opacity-50' : ''}`}
    >
      <div className="p-4">
        {/* Header row: title + badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className={`text-sm font-medium leading-snug
            ${task.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}
          >
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-mono text-[var(--color-accent)]">
              {task.points}pts
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${difficultyClass}`}>
              {task.difficulty}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-white/60 leading-relaxed mb-3">
            {task.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {task.targetUrl && !task.completed && (
            <a
              href={task.targetUrl}
              className="text-xs text-[var(--color-accent)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Go to page →
            </a>
          )}
          {task.completed ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              ✅ Completed
            </span>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="ml-auto text-xs px-3 py-1.5 rounded-md
                bg-[var(--color-accent)]/10 text-[var(--color-accent)]
                border border-[var(--color-accent)]/20
                hover:bg-[var(--color-accent)]/20
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors"
            >
              {completing ? 'Saving...' : '✓ Mark Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
