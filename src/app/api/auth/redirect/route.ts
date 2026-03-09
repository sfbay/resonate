import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DEFAULT_CITY = 'sf';

const PORTAL_HOME: Record<string, string> = {
  publisher: '/publisher/dashboard',
  government: '/government/discover',
  advertiser: '/advertise/dashboard',
  admin: '/government/discover',
};

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', baseUrl));
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: mapping, error } = await supabase
      .from('user_org_mapping')
      .select('org_type, city_slug, status')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Redirect: failed to fetch user mapping:', error);
    }

    // No mapping yet — send to application form
    if (!mapping) {
      return NextResponse.redirect(new URL('/onboarding/apply', baseUrl));
    }

    // Pending approval — show holding page
    if (mapping.status === 'pending_approval') {
      return NextResponse.redirect(new URL('/onboarding/pending', baseUrl));
    }

    // Rejected
    if (mapping.status === 'rejected') {
      return NextResponse.redirect(new URL('/onboarding/pending', baseUrl));
    }

    // Active — route to portal
    const city = mapping.city_slug || DEFAULT_CITY;
    const portalPath = PORTAL_HOME[mapping.org_type] || PORTAL_HOME.advertiser;
    return NextResponse.redirect(new URL(`/${city}${portalPath}`, baseUrl));
  } catch (error) {
    console.error('Redirect: unexpected error:', error);
    return NextResponse.redirect(new URL('/sign-in', baseUrl));
  }
}
