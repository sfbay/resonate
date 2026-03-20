'use client'

/**
 * BetaToolbar — Floating pill button anchored to bottom-right.
 *
 * Always visible for beta testers. Shows a task count badge when there
 * are pending tasks. Toggles the slide-out BetaPanel on click.
 */
export function BetaToolbar({
  isOpen,
  taskCount,
  onToggle,
}: {
  isOpen: boolean
  taskCount: number
  onToggle: () => void
}) {
  if (isOpen) return null

  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full
        bg-[var(--color-bg-base)]/90 px-5 py-3 text-base font-medium
        text-[var(--color-text-primary)] shadow-lg shadow-black/20
        backdrop-blur-xl border border-white/10
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-xl hover:shadow-black/30
        hover:border-white/20 active:scale-95
        animate-fade-in-up"
      aria-label="Open beta testing panel"
      aria-haspopup="dialog"
    >
      <span className="text-base" role="img" aria-hidden>
        🧪
      </span>
      <span>Beta</span>
      {taskCount > 0 && (
        <span
          className="flex items-center justify-center min-w-[20px] h-5 rounded-full
            bg-[var(--color-accent)] text-[var(--color-bg-base)] text-xs font-bold px-1.5"
        >
          {taskCount}
        </span>
      )}
    </button>
  )
}
