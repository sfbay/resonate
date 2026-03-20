export interface AdminFeedback {
  id: number
  feedbackType: string
  title: string
  description?: string
  pageUrl?: string
  status: string
  priority: string
  adminNotes?: string
  clerkUserId?: string
  submitter?: {
    id: number
    displayName?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
}

export interface AdminStats {
  openBugs: number
  inProgress: number
  fixedThisWeek: number
  activeTesters: number
  activeTasks: number
  totalFeedback: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  byStatus: Record<string, number>
}

export interface BetaTester {
  id: number
  displayName?: string
  email?: string
  clerkId?: string
  isBetaTester: boolean
  createdAt: string
}

export async function fetchAdminFeedback(filters?: {
  status?: string
  feedbackType?: string
  priority?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<{ feedback: AdminFeedback[]; totalDocs: number; totalPages: number; page: number }> {
  const params = new URLSearchParams()
  params.set('action', 'admin-feedback')
  if (filters?.status) params.set('status', filters.status)
  if (filters?.feedbackType) params.set('feedbackType', filters.feedbackType)
  if (filters?.priority) params.set('priority', filters.priority)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  if (filters?.sort) params.set('sort', filters.sort)

  const res = await fetch(`/api/beta?${params}`)
  if (!res.ok) throw new Error('Failed to fetch feedback')
  return res.json()
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/beta?action=admin-stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchTesters(): Promise<{ testers: BetaTester[] }> {
  const res = await fetch('/api/beta?action=admin-testers')
  if (!res.ok) throw new Error('Failed to fetch testers')
  return res.json()
}

export async function updateFeedback(
  feedbackId: number,
  data: { status?: string; priority?: string; adminNotes?: string }
): Promise<AdminFeedback> {
  const res = await fetch('/api/beta', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedbackId, ...data }),
  })
  if (!res.ok) throw new Error('Failed to update feedback')
  const json = await res.json()
  return json.feedback
}

export async function toggleBetaTester(
  userProfileId: number,
  isBetaTester: boolean
): Promise<void> {
  const res = await fetch('/api/beta', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle-tester', userProfileId, isBetaTester }),
  })
  if (!res.ok) throw new Error('Failed to toggle tester status')
}
