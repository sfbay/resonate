'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { BetaToolbar } from './BetaToolbar'
import { BetaPanel } from './BetaPanel'
import type { FeedbackMode } from './ModeToggle'

export type BetaTab = 'report' | 'tasks' | 'stats'

const STORAGE_KEY = 'beta-feedback-mode'

/**
 * BetaLayer — Root wrapper mounted in the frontend layout.
 *
 * Checks if the current user is a beta tester via /api/beta?action=check.
 * If yes, renders the floating toolbar and conditionally the panel.
 *
 * Supports two modes persisted to localStorage:
 *   - "simple" (default): Card-based feedback in slide-out panel
 *   - "power": Tabbed interface with Report, Tasks, and Stats
 */
export function BetaLayer() {
  const { isSignedIn } = useAuth()
  const [isBetaTester, setIsBetaTester] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<BetaTab>('report')
  const [taskCount, setTaskCount] = useState(0)
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('simple')

  // Load persisted mode preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FeedbackMode | null
      if (stored === 'simple' || stored === 'power') {
        setFeedbackMode(stored)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  function handleModeChange(mode: FeedbackMode) {
    setFeedbackMode(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // localStorage unavailable
    }
  }

  useEffect(() => {
    if (!isSignedIn) return

    fetch('/api/beta?action=check')
      .then((res) => res.json())
      .then((data) => {
        if (data.isBetaTester) {
          setIsBetaTester(true)
          // Also fetch task count for the badge
          fetch('/api/beta?action=tasks')
            .then((res) => res.json())
            .then((taskData) => {
              if (taskData.tasks) {
                const pending = taskData.tasks.filter((t: any) => !t.completed).length
                setTaskCount(pending)
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [isSignedIn])

  if (!isBetaTester) return null

  return (
    <>
      <BetaToolbar
        isOpen={panelOpen}
        taskCount={taskCount}
        onToggle={() => setPanelOpen((prev) => !prev)}
      />
      {panelOpen && (
        <BetaPanel
          feedbackMode={feedbackMode}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setPanelOpen(false)}
          onTaskCountChange={setTaskCount}
          onModeChange={handleModeChange}
        />
      )}
    </>
  )
}
