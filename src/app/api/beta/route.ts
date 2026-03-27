import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy init — avoids crashing at build time when env vars aren't set
let _supabase: ReturnType<typeof createClient> | null = null
function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

// Proxy so existing `supabase.from(...)` calls keep working
const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as Record<string, unknown>)[prop as string]
  },
})

// ─── snake_case → camelCase mapping ──────────────────────────────────
// Supabase returns snake_case columns; frontend expects camelCase.
// This recursively converts all keys in objects and arrays.

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function mapKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(mapKeys)
  if (obj !== null && typeof obj === 'object') {
    const mapped: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      mapped[snakeToCamel(k)] = mapKeys(v)
    }
    return mapped
  }
  return obj
}

// Points per feedback type
const POINTS_MAP: Record<string, number> = {
  bug: 5, idea: 3, general: 2, task_completion: 0,
}

const LEVELS = [
  { name: 'Newcomer', min: 0, max: 49 },
  { name: 'Explorer', min: 50, max: 149 },
  { name: 'Power Tester', min: 150, max: 299 },
  { name: 'MVP', min: 300, max: Infinity },
]

function getLevel(points: number) {
  const level = LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0]
  const next = LEVELS[LEVELS.indexOf(level) + 1]
  return {
    name: level.name,
    currentPoints: points,
    nextLevelName: next?.name || null,
    nextLevelMin: next?.min || null,
    progress: next ? (points - level.min) / (next.min - level.min) : 1,
  }
}

async function ensureProfile(clerkId: string): Promise<{ is: boolean; profile: Record<string, unknown> | null }> {
  const { data } = await supabase
    .from('profiles')
    .select('id, is_beta_tester, display_name, email, clerk_id, role')
    .eq('clerk_id', clerkId)
    .single()

  if (!data) {
    // Auto-create profile on first beta check (not a beta tester yet)
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ clerk_id: clerkId, is_beta_tester: false })
      .select()
      .single()
    return { is: false, profile: newProfile }
  }

  return { is: data.is_beta_tester === true, profile: data }
}

async function isAdmin(clerkId: string): Promise<boolean> {
  // Check Clerk org metadata first (Resonate's native admin detection)
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', clerkId)
    .single()
  if (data?.role === 'admin') return true

  // Fallback: check user_org_mapping for admin orgType
  const { data: mapping } = await supabase
    .from('user_org_mapping')
    .select('org_type')
    .eq('clerk_user_id', clerkId)
    .eq('status', 'active')
    .limit(1)
    .single()
  return mapping?.org_type === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const action = request.nextUrl.searchParams.get('action') || 'check'

    // CHECK
    if (action === 'check') {
      const { is } = await ensureProfile(userId)
      return NextResponse.json({ isBetaTester: is })
    }

    // All other actions require beta tester
    const { is, profile } = await ensureProfile(userId)
    if (!is) return NextResponse.json({ error: 'Not a beta tester' }, { status: 403 })

    // TASKS
    if (action === 'tasks') {
      const [{ data: tasks }, { data: completions }] = await Promise.all([
        supabase.from('beta_tasks').select('*').eq('active', true).order('sort_order'),
        supabase.from('beta_feedback')
          .select('task_id')
          .eq('clerk_user_id', userId)
          .eq('feedback_type', 'task_completion'),
      ])
      const completedIds = new Set((completions || []).map(c => c.task_id))
      return NextResponse.json({
        tasks: (tasks || []).map(t => mapKeys({ ...t, completed: completedIds.has(t.id) })),
      })
    }

    // FEEDBACK (user's own)
    if (action === 'feedback') {
      const { data } = await supabase
        .from('beta_feedback')
        .select('*, submitter:profiles(id, display_name, email)')
        .eq('clerk_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      return NextResponse.json({ feedback: mapKeys(data || []) })
    }

    // STATS
    if (action === 'stats') {
      const [{ data: userFb }, { data: allFb }, { data: tasks }] = await Promise.all([
        supabase.from('beta_feedback')
          .select('*, task:beta_tasks(points)')
          .eq('clerk_user_id', userId),
        supabase.from('beta_feedback').select('feedback_type, status'),
        supabase.from('beta_tasks').select('id').eq('active', true),
      ])

      let points = 0, bugs = 0, tasksCompleted = 0, ideas = 0
      for (const fb of userFb || []) {
        if (fb.feedback_type === 'task_completion') {
          points += (fb.task as Record<string, number> | null)?.points || 10
          tasksCompleted++
        } else {
          points += POINTS_MAP[fb.feedback_type] || 0
          if (fb.feedback_type === 'bug') bugs++
          if (fb.feedback_type === 'idea') ideas++
        }
      }

      const allBugs = (allFb || []).filter(f => f.feedback_type === 'bug')
      const bugsByStatus: Record<string, number> = {}
      for (const b of allBugs) bugsByStatus[b.status] = (bugsByStatus[b.status] || 0) + 1

      return NextResponse.json({
        user: {
          points, level: getLevel(points),
          bugsReported: bugs, tasksCompleted, ideasSubmitted: ideas,
          totalSubmissions: (userFb || []).length,
        },
        global: {
          totalBugs: allBugs.length, bugsByStatus,
          totalTaskCompletions: (allFb || []).filter(f => f.feedback_type === 'task_completion').length,
          totalFeedback: (allFb || []).length,
          totalActiveTasks: (tasks || []).length,
        },
      })
    }

    // ADMIN-FEEDBACK
    if (action === 'admin-feedback') {
      if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const status = request.nextUrl.searchParams.get('status')
      const feedbackType = request.nextUrl.searchParams.get('feedbackType')
      const priority = request.nextUrl.searchParams.get('priority')
      const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)

      let query = supabase
        .from('beta_feedback')
        .select('*, submitter:profiles(id, display_name, email)', { count: 'exact' })
      if (status) query = query.eq('status', status)
      if (feedbackType) query = query.eq('feedback_type', feedbackType)
      if (priority) query = query.eq('priority', priority)
      query = query.order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      const { data, count } = await query
      return NextResponse.json({
        feedback: mapKeys(data || []),
        totalDocs: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        page,
      })
    }

    // ADMIN-STATS
    if (action === 'admin-stats') {
      if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const [{ data: fb }, { count: testerCount }, { count: taskCount }] = await Promise.all([
        supabase.from('beta_feedback').select('feedback_type, status, priority, updated_at'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_beta_tester', true),
        supabase.from('beta_tasks').select('id', { count: 'exact', head: true }).eq('active', true),
      ])
      const all = fb || []
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const byType: Record<string, number> = {}, byPriority: Record<string, number> = {}, byStatus: Record<string, number> = {}
      for (const f of all) {
        byType[f.feedback_type] = (byType[f.feedback_type] || 0) + 1
        byPriority[f.priority] = (byPriority[f.priority] || 0) + 1
        byStatus[f.status] = (byStatus[f.status] || 0) + 1
      }
      return NextResponse.json({
        openBugs: all.filter(f => f.feedback_type === 'bug' && f.status === 'open').length,
        inProgress: all.filter(f => f.status === 'in_progress').length,
        fixedThisWeek: all.filter(f => f.status === 'fixed' && f.updated_at > weekAgo).length,
        activeTesters: testerCount || 0,
        activeTasks: taskCount || 0,
        totalFeedback: all.length,
        byType, byPriority, byStatus,
      })
    }

    // ADMIN-TESTERS
    if (action === 'admin-testers') {
      if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, email, clerk_id, is_beta_tester, created_at')
        .eq('is_beta_tester', true)
      return NextResponse.json({
        testers: mapKeys(data || []),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Beta API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { is, profile } = await ensureProfile(userId)
    if (!is) return NextResponse.json({ error: 'Not a beta tester' }, { status: 403 })

    const { feedbackType, title, description, pageUrl, priority, taskId, userAgent } = await request.json()
    if (!title || !feedbackType) {
      return NextResponse.json({ error: 'Title and feedbackType required' }, { status: 400 })
    }

    // Prevent duplicate task completions
    if (feedbackType === 'task_completion' && taskId) {
      const { data: existing } = await supabase
        .from('beta_feedback')
        .select('id')
        .eq('clerk_user_id', userId)
        .eq('feedback_type', 'task_completion')
        .eq('task_id', taskId)
        .limit(1)
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Task already completed' }, { status: 409 })
      }
    }

    const { data: feedback, error } = await supabase
      .from('beta_feedback')
      .insert({
        feedback_type: feedbackType,
        title,
        description: description || '',
        page_url: pageUrl || '',
        status: 'open',
        submitter_id: (profile as Record<string, unknown>)?.id as number,
        clerk_user_id: userId,
        task_id: feedbackType === 'task_completion' ? taskId : null,
        user_agent: userAgent || '',
        priority: priority || 'medium',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ feedback: mapKeys(feedback), success: true })
  } catch (error) {
    console.error('[Beta API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    // Toggle tester
    if (body.action === 'toggle-tester') {
      const { data } = await supabase
        .from('profiles')
        .update({ is_beta_tester: body.isBetaTester })
        .eq('id', body.userProfileId)
        .select('id, is_beta_tester')
        .single()
      return NextResponse.json({ profile: data })
    }

    // Update feedback
    const { feedbackId, status, priority, adminNotes } = body
    if (!feedbackId) return NextResponse.json({ error: 'feedbackId required' }, { status: 400 })

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (typeof adminNotes === 'string') updates.admin_notes = adminNotes

    const { data } = await supabase
      .from('beta_feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single()

    return NextResponse.json({ feedback: mapKeys(data) })
  } catch (error) {
    console.error('[Beta API] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
