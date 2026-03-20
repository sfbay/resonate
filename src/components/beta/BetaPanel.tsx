'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { AlertTriangle, ThumbsDown, Lightbulb, HelpCircle, ClipboardCheck } from 'lucide-react'
import type { BetaTab } from './BetaLayer'
import { BugReportForm } from './BugReportForm'
import { TaskList } from './TaskList'
import { StatsView } from './StatsView'
import { FeedbackCard } from './FeedbackCard'
import { SimpleFollowUp } from './SimpleFollowUp'
import { SimpleTaskList } from './SimpleTaskList'
import { ModeToggle, type FeedbackMode } from './ModeToggle'

const TABS: { id: BetaTab; label: string; icon: string }[] = [
  { id: 'report', label: 'Report', icon: '🐛' },
  { id: 'tasks', label: 'Tasks', icon: '📋' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

type SimplePhase = 'cards' | 'followUp' | 'tasks' | 'success'

type CardConfig = {
  icon: typeof AlertTriangle
  label: string
  description: string
  color: string
  feedbackType: 'bug' | 'general' | 'idea'
  priority: 'high' | 'medium' | 'low'
}

const FEEDBACK_CARDS: CardConfig[] = [
  { icon: AlertTriangle, label: 'Something isn\'t working', description: 'Report a bug or broken feature', color: '#f87171', feedbackType: 'bug', priority: 'high' },
  { icon: ThumbsDown, label: 'I don\'t like something', description: 'Tell us what feels off', color: '#fbbf24', feedbackType: 'general', priority: 'medium' },
  { icon: Lightbulb, label: 'I have an idea', description: 'Suggest an improvement', color: '#34d399', feedbackType: 'idea', priority: 'medium' },
  { icon: HelpCircle, label: 'I want to know more', description: 'Ask a question about the site', color: '#60a5fa', feedbackType: 'general', priority: 'low' },
]

/**
 * BetaPanel — Unified slide-out panel for both Simple and Power modes.
 *
 * Single panel shell (right-side drawer) with mode-dependent content:
 *   - Simple: 5 feedback cards → follow-up textarea → success
 *   - Power: Tabbed interface with Report, Tasks, and Stats
 */
export function BetaPanel({
  feedbackMode,
  activeTab,
  onTabChange,
  onClose,
  onTaskCountChange,
  onModeChange,
}: {
  feedbackMode: FeedbackMode
  activeTab: BetaTab
  onTabChange: (tab: BetaTab) => void
  onClose: () => void
  onTaskCountChange: (count: number) => void
  onModeChange: (mode: FeedbackMode) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Simple mode phase state
  const [phase, setPhase] = useState<SimplePhase>('cards')
  const [selectedCard, setSelectedCard] = useState<CardConfig | null>(null)

  // Reset simple mode when switching to it
  useEffect(() => {
    if (feedbackMode === 'simple') {
      setPhase('cards')
      setSelectedCard(null)
    }
  }, [feedbackMode])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Auto-close after success
  useEffect(() => {
    if (phase !== 'success') return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [phase, onClose])

  // Close on click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  const handleCardTap = useCallback((card: CardConfig) => {
    setSelectedCard(card)
    setPhase('followUp')
  }, [])

  const handleBackToCards = useCallback(() => {
    setPhase('cards')
    setSelectedCard(null)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-[380px] max-w-[90vw] h-full flex flex-col
          bg-[var(--color-bg-base)]/95 backdrop-blur-xl
          border-l border-white/10 shadow-2xl shadow-black/40
          animate-slide-in-from-right"
        role="dialog"
        aria-modal="true"
        aria-label="Beta feedback"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
              // Beta Lab
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md
              text-white/50 hover:text-white/80
              hover:bg-white/5 transition-colors"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Power mode: tabs */}
        {feedbackMode === 'power' && (
          <div className="flex border-b border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm
                  transition-colors relative
                  ${
                    activeTab === tab.id
                      ? 'text-[var(--color-accent)]'
                      : 'text-white/50 hover:text-white/80'
                  }`}
              >
                <span role="img" aria-hidden>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--color-accent)] rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* ── Power mode content ── */}
          {feedbackMode === 'power' && (
            <>
              {activeTab === 'report' && <BugReportForm />}
              {activeTab === 'tasks' && <TaskList onTaskCountChange={onTaskCountChange} />}
              {activeTab === 'stats' && <StatsView />}
            </>
          )}

          {/* ── Simple mode content ── */}
          {feedbackMode === 'simple' && phase === 'cards' && (
            <div className="flex flex-col gap-3 p-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-0.5">
                  How can we help?
                </h2>
                <p className="text-sm text-white/50">
                  Tap the option that fits best
                </p>
              </div>

              {FEEDBACK_CARDS.map((card, i) => (
                <FeedbackCard
                  key={card.feedbackType + card.priority}
                  icon={card.icon}
                  label={card.label}
                  description={card.description}
                  color={card.color}
                  delay={80 + i * 40}
                  onClick={() => handleCardTap(card)}
                />
              ))}

              <FeedbackCard
                icon={ClipboardCheck}
                label="I want to help test"
                description="See what needs testing"
                color="#c084fc"
                delay={80 + FEEDBACK_CARDS.length * 40}
                onClick={() => setPhase('tasks')}
              />
            </div>
          )}

          {feedbackMode === 'simple' && phase === 'followUp' && selectedCard && (
            <div className="flex flex-col gap-2 p-4">
              {/* Card echo */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]"
                  style={{ color: selectedCard.color }}
                >
                  <selectedCard.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {selectedCard.label}
                </h2>
              </div>

              <SimpleFollowUp
                feedbackType={selectedCard.feedbackType}
                priority={selectedCard.priority}
                onSuccess={() => setPhase('success')}
                onBack={handleBackToCards}
              />
            </div>
          )}

          {feedbackMode === 'simple' && phase === 'tasks' && (
            <div className="p-4">
              <SimpleTaskList
                onBack={handleBackToCards}
                onTaskCountChange={onTaskCountChange}
              />
            </div>
          )}

          {feedbackMode === 'simple' && phase === 'success' && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                Thank you!
              </h2>
              <p className="text-sm text-white/50">
                Your feedback helps us make this better.
              </p>
            </div>
          )}
        </div>

        {/* Mode toggle footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <ModeToggle currentMode={feedbackMode} onToggle={onModeChange} />
        </div>
      </div>
    </div>
  )
}
