'use client'

import { useState, useRef, useEffect } from 'react'

/**
 * SimpleFollowUp — Single textarea form for simple feedback mode.
 *
 * Auto-derives title from first 120 chars of textarea content.
 * Auto-captures pageUrl and userAgent. Minimum 10 chars to submit.
 * Submits to the existing POST /api/beta endpoint with zero API changes.
 */
export function SimpleFollowUp({
  feedbackType,
  priority,
  onSuccess,
  onBack,
}: {
  feedbackType: 'bug' | 'general' | 'idea'
  priority: 'high' | 'medium' | 'low'
  onSuccess: () => void
  onBack: () => void
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus textarea on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 350) // Wait for entry animation
    return () => clearTimeout(timer)
  }, [])

  const canSubmit = text.trim().length >= 10

  const PLACEHOLDERS: Record<string, string> = {
    bug: 'Tell us what happened... What did you expect to see?',
    general: 'What bothered you? We want to make it better.',
    idea: 'What would make this better? We\'re all ears.',
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError('')

    const trimmed = text.trim()
    const title = trimmed.length > 120 ? trimmed.slice(0, 117) + '...' : trimmed

    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType,
          title,
          description: trimmed,
          priority,
          pageUrl: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Cmd/Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault()
      handleSubmit()
    }
  }

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

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDERS[feedbackType] || 'Tell us more...'}
        className="w-full min-h-[160px] p-4 rounded-xl text-lg leading-relaxed resize-y
          bg-white/[0.06] border border-white/10
          text-white/90 placeholder:text-white/30
          focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20
          transition-colors"
      />

      {/* Character hint */}
      <div className="flex items-center justify-between text-sm text-white/50">
        <span>
          {text.trim().length < 10
            ? `${10 - text.trim().length} more characters needed`
            : 'Press Ctrl+Enter to submit'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full py-4 text-lg font-semibold rounded-xl
          bg-[var(--color-accent)] text-[var(--color-bg-base)]
          transition-all duration-200
          hover:brightness-110 active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
      >
        {submitting ? 'Sending...' : 'Send Feedback'}
      </button>
    </div>
  )
}
