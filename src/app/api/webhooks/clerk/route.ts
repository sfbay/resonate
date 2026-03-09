import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ClerkWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

interface OrgMembershipData {
  id: string;
  organization: {
    id: string;
    name: string;
    public_metadata: {
      type?: string;
      city?: string;
      publisher_id?: string;
    };
  };
  public_user_data: {
    user_id: string;
  };
  role: string;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify webhook signature
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  // Use service role client (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (event.type === 'organizationMembership.created') {
    const membership = event.data as unknown as OrgMembershipData;
    const orgMeta = membership.organization.public_metadata;

    const { error } = await supabase
      .from('user_org_mapping')
      .upsert({
        clerk_user_id: membership.public_user_data.user_id,
        clerk_org_id: membership.organization.id,
        org_type: orgMeta.type || 'advertiser',
        publisher_id: orgMeta.publisher_id || null,
        city_slug: orgMeta.city || 'sf',
        status: 'active',
      }, {
        onConflict: 'clerk_user_id,clerk_org_id',
      });

    if (error) {
      console.error('Failed to create user_org_mapping:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (event.type === 'organizationMembership.deleted') {
    const membership = event.data as unknown as OrgMembershipData;

    const { error } = await supabase
      .from('user_org_mapping')
      .delete()
      .eq('clerk_user_id', membership.public_user_data.user_id)
      .eq('clerk_org_id', membership.organization.id);

    if (error) {
      console.error('Failed to delete user_org_mapping:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
