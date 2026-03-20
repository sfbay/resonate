'use client'

import { useState, useRef, useEffect } from 'react'

type FeedbackType = 'bug' | 'idea' | 'general'
type Priority = 'low' | 'medium' | 'high' | 'critical'

/**
 * BugReportForm — Quick bug/idea submission form.
 *
 * Auto-captures the current page URL. Title is required, everything
 * else is optional for maximum speed (1-2 clicks to report).
 */
export function BugReportForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
  const [priority, setPriority] = useState<Priority>('medium')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType,
          title: title.trim(),
          description: description.trim(),
          pageUrl,
          priority,
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
      setTitle('')
      setDescription('')
      setPriority('medium')

      // Reset success state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center animate-fade-in-up">
        <span className="text-4xl">🎉</span>
        <p className="text-lg font-medium text-[var(--color-text-primary)]">Thank you!</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your {feedbackType === 'bug' ? 'bug report' : feedbackType === 'idea' ? 'idea' : 'feedback'} has been recorded.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        What&apos;s the issue?
      </h3>

      {/* Title */}
      <input
        ref={titleRef}
        type="text"
        placeholder="Brief summary..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-3 py-2.5 rounded-lg text-sm
          bg-white/5 border border-white/10
          text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50
          focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20
          transition-colors"
      />

      {/* Description */}
      <textarea
        placeholder="Details (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg text-sm resize-none
          bg-white/5 border border-white/10
          text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50
          focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20
          transition-colors"
      />

      {/* Type + Priority row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Type</label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            className="w-full px-3 py-2 rounded-lg text-sm
              bg-white/5 border border-white/10
              text-[var(--color-text-primary)]
              focus:outline-none focus:border-[var(--color-accent)]/50
              transition-colors"
          >
            <option value="bug">Bug</option>
            <option value="idea">Idea</option>
            <option value="general">General</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 rounded-lg text-sm
              bg-white/5 border border-white/10
              text-[var(--color-text-primary)]
              focus:outline-none focus:border-[var(--color-accent)]/50
              transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Page URL chip */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span className="shrink-0">Page:</span>
        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 truncate font-mono">
          {pageUrl || '/'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="w-full py-2.5 rounded-lg text-sm font-medium
          bg-[var(--color-accent)] text-[var(--color-bg-base)]
          hover:opacity-90 active:opacity-80
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-opacity"
      >
        {submitting ? 'Submitting...' : `🐛 Submit ${feedbackType === 'bug' ? 'Report' : feedbackType === 'idea' ? 'Idea' : 'Feedback'}`}
      </button>
    </form>
  )
}
