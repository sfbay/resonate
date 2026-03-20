'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  fetchAdminFeedback,
  fetchAdminStats,
  fetchTesters,
  updateFeedback,
  toggleBetaTester,
  type AdminFeedback,
  type AdminStats,
  type BetaTester,
} from './api'

type Tab = 'feedback' | 'testers' | 'tasks'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-400',
  acknowledged: 'bg-amber-400',
  in_progress: 'bg-blue-400',
  fixed: 'bg-green-400',
  wont_fix: 'bg-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  wont_fix: "Won't Fix",
}

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  bug: { color: 'text-red-400 bg-red-400/10', label: 'Bug' },
  idea: { color: 'text-green-400 bg-green-400/10', label: 'Idea' },
  general: { color: 'text-gray-400 bg-gray-400/10', label: 'General' },
  task_completion: { color: 'text-blue-400 bg-blue-400/10', label: 'Task' },
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

export function BetaAdminClient() {
  const [tab, setTab] = useState<Tab>('feedback')
  const [stats, setStats] = useState<AdminStats | null>(null)

  // Feedback state
  const [feedback, setFeedback] = useState<AdminFeedback[]>([])
  const [feedbackPage, setFeedbackPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(true)

  // Testers state
  const [testers, setTesters] = useState<BetaTester[]>([])
  const [testersLoading, setTestersLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Admin notes local state for textarea
  const [notesMap, setNotesMap] = useState<Record<number, string>>({})

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchAdminStats()
      setStats(data)
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }, [])

  const loadFeedback = useCallback(async () => {
    setFeedbackLoading(true)
    try {
      const data = await fetchAdminFeedback({
        status: filterStatus || undefined,
        feedbackType: filterType || undefined,
        priority: filterPriority || undefined,
        page: feedbackPage,
        limit: 20,
        sort: '-createdAt',
      })
      setFeedback(data.feedback)
      setTotalPages(data.totalPages)
    } catch (e) {
      console.error('Failed to load feedback:', e)
    } finally {
      setFeedbackLoading(false)
    }
  }, [filterStatus, filterType, filterPriority, feedbackPage])

  const loadTesters = useCallback(async () => {
    setTestersLoading(true)
    try {
      const data = await fetchTesters()
      setTesters(data.testers)
    } catch (e) {
      console.error('Failed to load testers:', e)
    } finally {
      setTestersLoading(false)
    }
  }, [])

  // Load stats + feedback on mount
  useEffect(() => {
    loadStats()
    loadFeedback()
  }, [loadStats, loadFeedback])

  // Load testers when tab switches
  useEffect(() => {
    if (tab === 'testers') loadTesters()
  }, [tab, loadTesters])

  // Reset page to 1 when filters change
  useEffect(() => {
    setFeedbackPage(1)
  }, [filterStatus, filterType, filterPriority])

  const handleUpdateFeedback = async (
    id: number,
    data: { status?: string; priority?: string; adminNotes?: string }
  ) => {
    try {
      const updated = await updateFeedback(id, data)
      setFeedback((prev) => prev.map((f) => (f.id === id ? updated : f)))
      // Refresh stats if status changed
      if (data.status) loadStats()
    } catch (e) {
      console.error('Failed to update feedback:', e)
    }
  }

  const handleToggleTester = async (tester: BetaTester) => {
    setTogglingId(tester.id)
    try {
      await toggleBetaTester(tester.id, !tester.isBetaTester)
      setTesters((prev) =>
        prev.map((t) =>
          t.id === tester.id ? { ...t, isBetaTester: !t.isBetaTester } : t
        )
      )
      loadStats()
    } catch (e) {
      console.error('Failed to toggle tester:', e)
    } finally {
      setTogglingId(null)
    }
  }

  const handleNotesBlur = (id: number) => {
    const notes = notesMap[id]
    const original = feedback.find((f) => f.id === id)?.adminNotes ?? ''
    if (notes !== undefined && notes !== original) {
      handleUpdateFeedback(id, { adminNotes: notes })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-white/90">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Beta Admin</h1>
            <p className="text-white/50 text-sm mt-1">
              Feedback inbox, tester management, and tasks
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Payload Admin &rarr;
          </a>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="flex flex-wrap gap-3 mb-8">
            <StatPill
              label="Open Bugs"
              value={stats.openBugs}
              color={stats.openBugs > 0 ? 'red' : 'gray'}
            />
            <StatPill
              label="In Progress"
              value={stats.inProgress}
              color={stats.inProgress > 0 ? 'amber' : 'gray'}
            />
            <StatPill
              label="Fixed This Week"
              value={stats.fixedThisWeek}
              color="green"
            />
            <StatPill label="Active Testers" value={stats.activeTesters} color="blue" />
            <StatPill label="Total Submissions" value={stats.totalFeedback} color="gray" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {(['feedback', 'testers', 'tasks'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative ${
                tab === t
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'feedback' && (
          <FeedbackTab
            feedback={feedback}
            loading={feedbackLoading}
            page={feedbackPage}
            totalPages={totalPages}
            expandedId={expandedId}
            filterStatus={filterStatus}
            filterType={filterType}
            filterPriority={filterPriority}
            notesMap={notesMap}
            onFilterStatus={setFilterStatus}
            onFilterType={setFilterType}
            onFilterPriority={setFilterPriority}
            onPageChange={setFeedbackPage}
            onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
            onNotesChange={(id, val) =>
              setNotesMap((prev) => ({ ...prev, [id]: val }))
            }
            onNotesBlur={handleNotesBlur}
            onUpdateFeedback={handleUpdateFeedback}
          />
        )}

        {tab === 'testers' && (
          <TestersTab
            testers={testers}
            loading={testersLoading}
            togglingId={togglingId}
            onToggle={handleToggleTester}
          />
        )}

        {tab === 'tasks' && <TasksTab />}
      </div>
    </div>
  )
}

/* ---------- Stat Pill ---------- */

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'red' | 'amber' | 'green' | 'blue' | 'gray'
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-400/10 text-red-400 border-red-400/20',
    amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    green: 'bg-green-400/10 text-green-400 border-green-400/20',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    gray: 'bg-white/[0.04] text-white/60 border-white/10',
  }

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm ${colorMap[color]}`}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

/* ---------- Filter Select ---------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ---------- Feedback Tab ---------- */

function FeedbackTab({
  feedback,
  loading,
  page,
  totalPages,
  expandedId,
  filterStatus,
  filterType,
  filterPriority,
  notesMap,
  onFilterStatus,
  onFilterType,
  onFilterPriority,
  onPageChange,
  onToggleExpand,
  onNotesChange,
  onNotesBlur,
  onUpdateFeedback,
}: {
  feedback: AdminFeedback[]
  loading: boolean
  page: number
  totalPages: number
  expandedId: number | null
  filterStatus: string
  filterType: string
  filterPriority: string
  notesMap: Record<number, string>
  onFilterStatus: (v: string) => void
  onFilterType: (v: string) => void
  onFilterPriority: (v: string) => void
  onPageChange: (p: number) => void
  onToggleExpand: (id: number) => void
  onNotesChange: (id: number, val: string) => void
  onNotesBlur: (id: number) => void
  onUpdateFeedback: (
    id: number,
    data: { status?: string; priority?: string; adminNotes?: string }
  ) => void
}) {
  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={onFilterStatus}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={onFilterType}
          options={Object.entries(TYPE_STYLES).map(([value, { label }]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          label="Priority"
          value={filterPriority}
          onChange={onFilterPriority}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
        />
      </div>

      {/* List */}
      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading feedback...</div>
        ) : feedback.length === 0 ? (
          <div className="p-8 text-center text-white/40">No feedback found</div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {feedback.map((item) => {
              const isExpanded = expandedId === item.id
              const typeStyle = TYPE_STYLES[item.feedbackType] ?? TYPE_STYLES.general
              const priorityStyle = PRIORITY_STYLES[item.priority] ?? 'text-gray-400'
              const submitterName =
                item.submitter?.displayName || item.submitter?.email || 'Anonymous'

              return (
                <div key={item.id}>
                  {/* Row */}
                  <button
                    onClick={() => onToggleExpand(item.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Status dot */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        STATUS_COLORS[item.status] ?? 'bg-gray-400'
                      }`}
                    />

                    {/* Type badge */}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${typeStyle.color}`}
                    >
                      {typeStyle.label}
                    </span>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                        <span className={`text-xs shrink-0 ${priorityStyle}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                        <span>{submitterName}</span>
                        <span>&middot;</span>
                        <span>{timeAgo(item.createdAt)}</span>
                        {item.pageUrl && (
                          <>
                            <span>&middot;</span>
                            <span className="truncate max-w-[200px]">
                              {item.pageUrl}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <span
                      className={`text-white/30 text-sm transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    >
                      &rsaquo;
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-white/[0.02] border-t border-white/[0.04]">
                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-white/70 mb-4 whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {/* User agent */}
                      {item.pageUrl && (
                        <p className="text-xs text-white/30 mb-4 font-mono break-all">
                          Page: {item.pageUrl}
                        </p>
                      )}

                      {/* Controls row */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div>
                          <label className="text-xs text-white/40 block mb-1">
                            Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              onUpdateFeedback(item.id, { status: e.target.value })
                            }
                            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 outline-none focus:border-white/20 appearance-none cursor-pointer"
                          >
                            {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-white/40 block mb-1">
                            Priority
                          </label>
                          <select
                            value={item.priority}
                            onChange={(e) =>
                              onUpdateFeedback(item.id, { priority: e.target.value })
                            }
                            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 outline-none focus:border-white/20 appearance-none cursor-pointer"
                          >
                            {[
                              { value: 'low', label: 'Low' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'high', label: 'High' },
                              { value: 'critical', label: 'Critical' },
                            ].map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Admin notes */}
                      <div>
                        <label className="text-xs text-white/40 block mb-1">
                          Admin Notes
                        </label>
                        <textarea
                          rows={3}
                          value={
                            notesMap[item.id] !== undefined
                              ? notesMap[item.id]
                              : item.adminNotes ?? ''
                          }
                          onChange={(e) => onNotesChange(item.id, e.target.value)}
                          onBlur={() => onNotesBlur(item.id)}
                          placeholder="Add internal notes..."
                          className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-white/20 resize-y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-white/40 px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Testers Tab ---------- */

function TestersTab({
  testers,
  loading,
  togglingId,
  onToggle,
}: {
  testers: BetaTester[]
  loading: boolean
  togglingId: number | null
  onToggle: (t: BetaTester) => void
}) {
  if (loading) {
    return <div className="text-white/40 py-8 text-center">Loading testers...</div>
  }

  if (testers.length === 0) {
    return <div className="text-white/40 py-8 text-center">No testers found</div>
  }

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
      <div className="divide-y divide-white/[0.06]">
        {testers.map((tester) => (
          <div
            key={tester.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {tester.displayName || 'Unnamed'}
              </div>
              <div className="text-xs text-white/40 flex items-center gap-2">
                {tester.email && <span>{tester.email}</span>}
                {tester.createdAt && (
                  <>
                    <span>&middot;</span>
                    <span>Joined {timeAgo(tester.createdAt)}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => onToggle(tester)}
              disabled={togglingId === tester.id}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                tester.isBetaTester
                  ? 'bg-green-400/10 text-green-400 border-green-400/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20'
                  : 'bg-white/[0.06] text-white/50 border-white/10 hover:bg-green-400/10 hover:text-green-400 hover:border-green-400/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {togglingId === tester.id
                ? '...'
                : tester.isBetaTester
                  ? 'Active'
                  : 'Grant Access'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Tasks Tab ---------- */

function TasksTab() {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-8 text-center">
      <p className="text-white/50 mb-3">Manage tasks in the Payload admin panel</p>
      <a
        href="/admin/collections/beta-tasks"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
      >
        Open Task Manager &rarr;
      </a>
    </div>
  )
}
