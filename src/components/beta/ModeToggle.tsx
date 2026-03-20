'use client'

export type FeedbackMode = 'simple' | 'power'

/**
 * ModeToggle — Subtle toggle link between simple and power feedback modes.
 *
 * Deliberately understated (text-xs, muted) so it doesn't distract
 * faculty testers from the primary UI. Power users will find it.
 */
export function ModeToggle({
  currentMode,
  onToggle,
}: {
  currentMode: FeedbackMode
  onToggle: (mode: FeedbackMode) => void
}) {
  if (currentMode === 'simple') {
    return (
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        Want more control?{' '}
        <button
          onClick={() => onToggle('power')}
          className="text-[var(--color-accent)] hover:underline"
        >
          Switch to power mode
        </button>
      </p>
    )
  }

  return (
    <p className="text-xs text-[var(--color-text-muted)] text-center">
      Prefer simpler?{' '}
      <button
        onClick={() => onToggle('simple')}
        className="text-[var(--color-accent)] hover:underline"
      >
        Switch to simple mode
      </button>
    </p>
  )
}
