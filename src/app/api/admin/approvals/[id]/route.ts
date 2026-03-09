import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ApprovalAction {
  action: 'approve' | 'reject';
  note?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  const orgType = (sessionClaims?.metadata as Record<string, string>)?.orgType;

  if (orgType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as ApprovalAction;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get the mapping record
  const { data: mapping, error: fetchError } = await supabase
    .from('user_org_mapping')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !mapping) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (body.action === 'approve') {
    // Update mapping status
    const { error: updateError } = await supabase
      .from('user_org_mapping')
      .update({ status: 'active' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Update Clerk org metadata to active
    try {
      const clerk = await clerkClient();
      await clerk.organizations.updateOrganization(mapping.clerk_org_id, {
        publicMetadata: { status: 'active' },
      });
    } catch (err) {
      console.error('Failed to update Clerk org:', err);
    }

    // TODO: Send welcome email

    return NextResponse.json({ success: true, status: 'active' });
  }

  if (body.action === 'reject') {
    const { error: updateError } = await supabase
      .from('user_org_mapping')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // TODO: Send rejection email with note

    return NextResponse.json({ success: true, status: 'rejected' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
