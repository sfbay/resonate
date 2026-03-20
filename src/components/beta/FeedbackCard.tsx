'use client'

import type { LucideIcon } from 'lucide-react'

/**
 * FeedbackCard — Large tappable card for simple feedback mode.
 *
 * Designed for elderly faculty testers: big touch target (140-160px),
 * large text, prominent icon, and left accent border for category color.
 * Each card represents a single feedback intent.
 */
export function FeedbackCard({
  icon: Icon,
  label,
  description,
  color,
  delay,
  onClick,
}: {
  icon: LucideIcon
  label: string
  description: string
  color: string
  delay: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full
        flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
        bg-white/[0.06] backdrop-blur-md
        border border-white/10 border-l-[3px]
        transition-all duration-200 ease-out
        hover:bg-white/[0.10] hover:border-white/15 hover:scale-[1.02]
        active:scale-[0.98]
        opacity-0 animate-fade-in-up`}
      style={{
        borderLeftColor: color,
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
      aria-label={label}
    >
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06]"
        style={{ color }}
      >
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-base font-semibold text-[var(--color-text-primary)] leading-tight">
          {label}
        </span>
        <span className="text-sm text-white/60 leading-snug">
          {description}
        </span>
      </div>

      {/* Hover arrow hint */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 translate-x-1
          group-hover:opacity-40 group-hover:translate-x-0
          transition-all duration-200 text-[var(--color-text-muted)]"
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  )
}
