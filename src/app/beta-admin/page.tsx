import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { BetaAdminClient } from './BetaAdminClient'

export const dynamic = 'force-dynamic'

export default async function BetaAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check admin via profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', userId)
    .single()

  // Fallback: check user_org_mapping for admin orgType
  if (profile?.role !== 'admin') {
    const { data: mapping } = await supabase
      .from('user_org_mapping')
      .select('org_type')
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (mapping?.org_type !== 'admin') {
      redirect('/')
    }
  }

  return <BetaAdminClient />
}
