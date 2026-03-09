import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ApplicationBody {
  orgName: string;
  orgType: string;
  website: string;
  city: string;
  description: string;
  clerkUserId: string;
  email: string;
  contactName: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as ApplicationBody;

  if (!body.orgName || !body.orgType) {
    return NextResponse.json(
      { error: 'Organization name and type are required' },
      { status: 400 }
    );
  }

  try {
    const clerk = await clerkClient();

    // Create Clerk organization with pending metadata
    const org = await clerk.organizations.createOrganization({
      name: body.orgName,
      createdBy: userId,
      publicMetadata: {
        type: body.orgType,
        city: body.city || 'sf',
        status: 'pending_approval',
        website: body.website,
        description: body.description,
        appliedAt: new Date().toISOString(),
      },
    });

    // Create user_org_mapping with pending status
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: dbError } = await supabase
      .from('user_org_mapping')
      .insert({
        clerk_user_id: userId,
        clerk_org_id: org.id,
        org_type: body.orgType,
        city_slug: body.city || 'sf',
        status: 'pending_approval',
      });

    if (dbError) {
      console.error('Failed to create user_org_mapping:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // TODO: Send confirmation email restating submission details
    // This will use a transactional email service (Resend, SendGrid, etc.)
    // For now, Clerk sends its own welcome email

    return NextResponse.json({
      success: true,
      orgId: org.id,
      status: 'pending_approval',
    });
  } catch (err) {
    console.error('Application error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
