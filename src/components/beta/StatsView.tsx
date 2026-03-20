'use client'

import { useEffect, useState } from 'react'

type UserStats = {
  points: number
  level: {
    name: string
    currentPoints: number
    nextLevelName: string | null
    nextLevelMin: number | null
    progress: number
  }
  bugsReported: number
  tasksCompleted: number
  ideasSubmitted: number
  totalSubmissions: number
}

type GlobalStats = {
  totalBugs: number
  bugsByStatus: Record<string, number>
  totalTaskCompletions: number
  totalFeedback: number
  totalActiveTasks: number
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  acknowledged: 'Ack',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  wont_fix: "Won't Fix",
}

/**
 * StatsView — Metrics dashboard with level progress and global stats.
 *
 * Shows personal stats (level, points, bugs reported, tasks completed),
 * a progress bar toward the next level, and aggregate metrics across
 * all beta testers.
 */
export function StatsView() {
  const [user, setUser] = useState<UserStats | null>(null)
  const [global, setGlobal] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/beta?action=stats')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        setGlobal(data.global)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
        Loading stats...
      </div>
    )
  }

  if (!user || !global) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
        Could not load stats
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Level Card */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Your Level
          </span>
          <span className="text-sm font-bold text-[var(--color-accent)]">
            {user.level.name}
          </span>
        </div>

        {/* Points */}
        <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {user.points} <span className="text-sm font-normal text-[var(--color-text-muted)]">pts</span>
        </div>

        {/* Progress Bar */}
        {user.level.nextLevelMin && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
              <span>{user.points} pts</span>
              <span>{user.level.nextLevelMin} → {user.level.nextLevelName}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${Math.min(user.level.progress * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {!user.level.nextLevelMin && (
          <p className="text-xs text-[var(--color-accent)] mt-2">Max level reached!</p>
        )}
      </div>

      {/* Personal Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Bugs Reported" value={user.bugsReported} icon="🐛" />
        <StatBox label="Tasks Done" value={user.tasksCompleted} icon="✅" />
        <StatBox label="Ideas" value={user.ideasSubmitted} icon="💡" />
        <StatBox label="Total Reports" value={user.totalSubmissions} icon="📝" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">
          All Testers
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Global Stats */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Total Bugs</span>
            <span className="text-sm font-mono text-[var(--color-text-primary)]">{global.totalBugs}</span>
          </div>

          {/* Bug status breakdown */}
          {Object.keys(global.bugsByStatus).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(global.bugsByStatus).map(([status, count]) => (
                <span
                  key={status}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10
                    text-[var(--color-text-muted)]"
                >
                  {STATUS_LABELS[status] || status}: {count}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Tasks Completed</span>
            <span className="text-sm font-mono text-[var(--color-text-primary)]">
              {global.totalTaskCompletions}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Total Submissions</span>
            <span className="text-sm font-mono text-[var(--color-text-primary)]">
              {global.totalFeedback}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-xl font-bold text-[var(--color-text-primary)]">{value}</div>
      <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{label}</div>
    </div>
  )
}
