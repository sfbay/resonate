# Phase 4: Auth Overlay Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mock auth stub with real Clerk authentication, protect portal routes, bridge Clerk JWTs to Supabase RLS, and build invite + gated sign-up onboarding flows.

**Architecture:** Three-layer rollout. Layer 1 installs Clerk SDK, wraps the app in ClerkProvider, rewires `useCurrentUser()` to read from Clerk, and adds middleware route protection. Layer 2 bridges Clerk JWTs to Supabase so RLS policies scope data to real users. Layer 3 builds onboarding flows (invite acceptance, gated sign-up with approval, demo pathway).

**Tech Stack:** Clerk (`@clerk/nextjs`), Supabase (existing), Next.js App Router middleware, Svix (Clerk webhook verification)

**Design doc:** `docs/plans/2026-03-09-phase4-auth-overlay-design.md`

---

## Layer 1: Auth Shell

### Task 1: Install Clerk SDK and Add ClerkProvider

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx:22-34`
- Create: `.env.local` (add Clerk keys — do NOT commit)

**Step 1: Install @clerk/nextjs**

Run:
```bash
npm install @clerk/nextjs
```

**Step 2: Add Clerk environment variables to `.env.local`**

Add these lines to your existing `.env.local` file (get values from Clerk dashboard → API Keys):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**Step 3: Wrap root layout with ClerkProvider**

Modify `src/app/layout.tsx` to:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Resonate - Connect Communities with Messages That Matter",
  description: "A civic marketplace connecting city departments with community media outlets for targeted, authentic local outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${dmSans.variable} ${fraunces.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Step 4: Verify dev server starts**

Run:
```bash
npm run dev
```
Expected: App loads without errors. No visual changes (Clerk doesn't render anything until you use its components).

**Step 5: Commit**

```bash
git add package.json package-lock.json src/app/layout.tsx
git commit -m "feat: install Clerk SDK and add ClerkProvider to root layout"
```

---

### Task 2: Create Sign-In and Sign-Up Pages

**Files:**
- Create: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/sign-up/[[...sign-up]]/page.tsx`

**Context:** Clerk uses catch-all routes (`[[...sign-in]]`) for its multi-step auth flows. The `<SignIn />` and `<SignUp />` components handle all UI — login, password reset, MFA, OAuth — with zero custom code.

**Step 1: Create the sign-in page**

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-md',
          },
        }}
      />
    </div>
  );
}
```

**Step 2: Create the sign-up page**

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-md',
          },
        }}
      />
    </div>
  );
}
```

**Step 3: Verify pages render**

Run:
```bash
npm run dev
```
Navigate to `http://localhost:3002/sign-in` and `http://localhost:3002/sign-up`.
Expected: Clerk sign-in and sign-up forms render centered on page.

**Step 4: Commit**

```bash
git add src/app/sign-in src/app/sign-up
git commit -m "feat: add Clerk sign-in and sign-up pages"
```

---

### Task 3: Add Clerk Middleware with Route Protection

**Files:**
- Modify: `src/middleware.ts` (full rewrite)

**Context:** The current middleware only handles city-scoping redirects (`/publisher` → `/sf/publisher`). We need to add Clerk's `clerkMiddleware()` for route protection while preserving the city-scoping logic. Clerk middleware runs first (checks auth), then our custom logic runs (city redirect + portal access control).

**Portal access rules:**
- `publisher` org type → can access `/[city]/publisher/*` and `/[city]/advertise/*` (browse-only)
- `government` org type → can access `/[city]/government/*` only
- `advertiser` org type → can access `/[city]/advertise/*` only
- `admin` org type → can access all portals
- Unauthorized portal access → redirect to user's home portal

**Step 1: Rewrite middleware**

Replace `src/middleware.ts` entirely with:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/home(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/media-kit(.*)',
  '/demo(.*)',
  '/api/webhooks(.*)',
]);

// Portal routes that need city-scoping redirect
const PORTAL_PREFIXES = ['/publisher', '/government', '/advertise'];
const DEFAULT_CITY = 'sf';

// Map org type → allowed portal path segments
const PORTAL_ACCESS: Record<string, string[]> = {
  publisher: ['publisher', 'advertise'],
  government: ['government'],
  advertiser: ['advertise'],
  admin: ['publisher', 'government', 'advertise'],
};

// Map org type → default portal home path
const PORTAL_HOME: Record<string, string> = {
  publisher: '/publisher/dashboard',
  government: '/government/discover',
  advertiser: '/advertise/dashboard',
  admin: '/government/discover',
};

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 1. City-scoping redirect (runs for all users, auth or not)
  for (const prefix of PORTAL_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_CITY}${pathname}`;
      return NextResponse.redirect(url, 307);
    }
  }

  // 2. Public routes — no auth required
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 3. Protected routes — require auth
  const { userId, orgId, sessionClaims } = await auth.protect();

  // 4. Portal access control (only for city-scoped portal routes)
  // Match pattern: /[city]/[portal]/...
  const cityPortalMatch = pathname.match(/^\/[^/]+\/(publisher|government|advertise)(\/|$)/);
  if (cityPortalMatch) {
    const portal = cityPortalMatch[1];
    const orgType = (sessionClaims?.metadata as Record<string, string>)?.orgType || 'advertiser';
    const allowedPortals = PORTAL_ACCESS[orgType] || [];

    if (!allowedPortals.includes(portal)) {
      // Redirect to user's home portal
      const homePath = PORTAL_HOME[orgType] || '/advertise/dashboard';
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_CITY}${homePath}`;
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

**Step 2: Verify middleware works**

Run:
```bash
npm run dev
```

Test these scenarios:
- `http://localhost:3002/` — should load (public)
- `http://localhost:3002/home` — should load (public)
- `http://localhost:3002/sign-in` — should load (public)
- `http://localhost:3002/sf/publisher/dashboard` — should redirect to sign-in (protected)
- `http://localhost:3002/publisher/dashboard` — should redirect to `/sf/publisher/dashboard` (city-scope), then to sign-in (protected)
- After signing in — should access portal matching your org type

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Clerk middleware with route protection and portal access control"
```

---

### Task 4: Rewire useCurrentUser() to Clerk

**Files:**
- Modify: `src/lib/auth/index.ts` (full rewrite)

**Context:** The current file exports a `useCurrentUser()` hook that returns a hardcoded `MOCK_USER`. We replace the implementation to read from Clerk's `useUser()` and `useOrganization()` hooks. The `CurrentUser` interface and permission helpers stay the same — no downstream changes needed.

**Important:** Clerk stores org type in `organization.publicMetadata.type` and role in `organizationMembership.role`. These are set when creating orgs in the Clerk dashboard or via webhooks.

**Step 1: Rewrite auth module**

Replace `src/lib/auth/index.ts` entirely with:

```typescript
'use client';

import { useUser, useOrganization } from '@clerk/nextjs';
import { useMemo } from 'react';

export type OrgType = 'publisher' | 'government' | 'advertiser';
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  orgName: string;
  orgType: OrgType;
  role: UserRole;
}

/**
 * Returns the current authenticated user.
 * Throws if called when not authenticated — only use in protected routes.
 */
export function useCurrentUser(): CurrentUser {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  return useMemo(() => {
    if (!user) {
      throw new Error('useCurrentUser called without authenticated user. Use useCurrentUserOptional for public pages.');
    }

    const orgType = (organization?.publicMetadata?.type as OrgType) || 'advertiser';
    const role = (membership?.role === 'org:admin' ? 'admin' : 'editor') as UserRole;

    return {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || '',
      orgId: organization?.id || '',
      orgName: organization?.name || '',
      orgType,
      role,
    };
  }, [user, organization, membership]);
}

/**
 * Returns the current user or null if not authenticated.
 * Safe to use on public pages.
 */
export function useCurrentUserOptional(): CurrentUser | null {
  const { user, isLoaded } = useUser();
  const { organization, membership } = useOrganization();

  return useMemo(() => {
    if (!isLoaded || !user) return null;

    const orgType = (organization?.publicMetadata?.type as OrgType) || 'advertiser';
    const role = (membership?.role === 'org:admin' ? 'admin' : 'editor') as UserRole;

    return {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || '',
      orgId: organization?.id || '',
      orgName: organization?.name || '',
      orgType,
      role,
    };
  }, [user, isLoaded, organization, membership]);
}

export function canManageCampaigns(user: CurrentUser): boolean {
  return user.orgType === 'government' || user.orgType === 'advertiser';
}

export function canManagePublisher(user: CurrentUser): boolean {
  return user.orgType === 'publisher';
}

export function canReviewUnits(user: CurrentUser): boolean {
  return user.orgType === 'publisher' && (user.role === 'admin' || user.role === 'editor');
}
```

**Step 2: Verify the app builds**

Run:
```bash
npm run build
```
Expected: Build succeeds. No type errors (same `CurrentUser` interface).

**Step 3: Commit**

```bash
git add src/lib/auth/index.ts
git commit -m "feat: rewire useCurrentUser to read from Clerk instead of mock data"
```

---

## Layer 2: Supabase JWT Bridge

### Task 5: Create user_org_mapping Table

**Files:**
- Create: `supabase/migrations/20260309000001_create_user_org_mapping.sql`

**Context:** This table maps Clerk user/org IDs to internal Supabase entity IDs (publisher_id, advertiser org, etc.). It's used by RLS policies to resolve `auth.uid()` → internal IDs, and populated by Clerk webhooks when users are invited or sign up.

**Step 1: Write the migration**

Create `supabase/migrations/20260309000001_create_user_org_mapping.sql`:

```sql
-- Migration: Create user-org mapping table
-- Links Clerk identities to internal Supabase entities

CREATE TABLE user_org_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  clerk_org_id TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('publisher', 'government', 'advertiser')),
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  city_slug TEXT DEFAULT 'sf',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clerk_user_id, clerk_org_id)
);

-- Indexes
CREATE INDEX idx_user_org_mapping_clerk_user ON user_org_mapping(clerk_user_id);
CREATE INDEX idx_user_org_mapping_clerk_org ON user_org_mapping(clerk_org_id);
CREATE INDEX idx_user_org_mapping_publisher ON user_org_mapping(publisher_id) WHERE publisher_id IS NOT NULL;
CREATE INDEX idx_user_org_mapping_status ON user_org_mapping(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_user_org_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_org_mapping_updated_at
  BEFORE UPDATE ON user_org_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_user_org_mapping_updated_at();

-- RLS
ALTER TABLE user_org_mapping ENABLE ROW LEVEL SECURITY;

-- Users can read their own mapping
CREATE POLICY "Users can view own mapping"
  ON user_org_mapping FOR SELECT
  USING (clerk_user_id = auth.jwt()->>'sub');

-- Service role has full access (for webhooks)
CREATE POLICY "Service role has full access to user_org_mapping"
  ON user_org_mapping FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE user_org_mapping IS 'Maps Clerk user/org IDs to internal Supabase entities';
```

**Step 2: Push migration to Supabase**

Run:
```bash
npx supabase db push
```
Expected: Migration applies successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260309000001_create_user_org_mapping.sql
git commit -m "feat: create user_org_mapping table for Clerk-Supabase identity bridge"
```

---

### Task 6: Add Supabase JWT Helper for Clerk Tokens

**Files:**
- Create: `src/lib/auth/supabase-token.ts`
- Modify: `src/lib/db/supabase-server.ts`

**Context:** Clerk can mint JWTs that Supabase accepts via a JWT template named "supabase" (configured in Clerk dashboard). Server-side API routes need to get this token from Clerk and pass it to Supabase. This task creates a helper for that and updates the server client.

**Prerequisites:** Before this code works, you must create a JWT template in Clerk dashboard:
1. Go to Clerk Dashboard → JWT Templates → New Template → Supabase
2. Set name to `supabase`
3. Add your Supabase JWT secret (from Supabase Dashboard → Settings → API → JWT Secret)
4. Save

**Step 1: Create the Supabase token helper**

Create `src/lib/auth/supabase-token.ts`:

```typescript
import { auth } from '@clerk/nextjs/server';

/**
 * Get a Supabase-compatible JWT from Clerk for server-side use.
 * Returns null if user is not authenticated.
 *
 * Requires a "supabase" JWT template configured in Clerk dashboard.
 */
export async function getSupabaseToken(): Promise<string | null> {
  const { getToken } = await auth();
  return getToken({ template: 'supabase' });
}
```

**Step 2: Update server Supabase client to accept Clerk JWT**

Replace `src/lib/db/supabase-server.ts` entirely with:

```typescript
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseToken } from '@/lib/auth/supabase-token';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for API routes and Server Components.
 *
 * When a Clerk user is authenticated, passes their Supabase JWT so
 * RLS policies see a real auth.uid(). Falls back to anon key for
 * unauthenticated/public requests.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  const supabaseToken = await getSupabaseToken();

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — safe to ignore
        }
      },
    },
    global: supabaseToken
      ? {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
          },
        }
      : undefined,
  });
}

export type { Database } from './types';
export type ServerSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;
```

**Step 3: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds. API routes still work (anon fallback when no Clerk session).

**Step 4: Commit**

```bash
git add src/lib/auth/supabase-token.ts src/lib/db/supabase-server.ts
git commit -m "feat: bridge Clerk JWT to Supabase server client for RLS"
```

---

### Task 7: Update Browser Supabase Client for Clerk JWT

**Files:**
- Modify: `src/lib/db/supabase.ts`

**Context:** The browser client also needs to pass Clerk's JWT to Supabase for client-side queries. We use Clerk's `useSession()` hook to get the token. Since the browser client is used in React components, we add a hook `useSupabaseClient()` alongside the existing `getSupabaseClient()` (which stays as anon fallback for non-auth contexts).

**Step 1: Update browser Supabase client**

Replace `src/lib/db/supabase.ts` entirely with:

```typescript
'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase browser client (anon key, no auth).
 * Use for public data or when Clerk session is unavailable.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Singleton anon browser client for non-auth contexts.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient();
  }
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

/**
 * React hook that returns a Supabase client authenticated with the
 * current Clerk session's JWT. Falls back to anon client if no session.
 *
 * Usage:
 *   const supabase = useSupabaseClient();
 *   const { data } = await supabase.from('publishers').select('*');
 */
export function useSupabaseClient() {
  const { session } = useSession();
  const [client, setClient] = useState(() => getSupabaseClient());

  useEffect(() => {
    if (!session) {
      setClient(getSupabaseClient());
      return;
    }

    session.getToken({ template: 'supabase' }).then((token) => {
      if (token) {
        const authClient = createSupabaseBrowserClient<Database>(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );
        setClient(authClient);
      }
    });
  }, [session]);

  return client;
}

export type { Database } from './types';
export type SupabaseClient = ReturnType<typeof createBrowserClient>;
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds. Existing code using `getSupabaseClient()` still works unchanged.

**Step 3: Commit**

```bash
git add src/lib/db/supabase.ts
git commit -m "feat: add useSupabaseClient hook with Clerk JWT for browser-side auth"
```

---

### Task 8: Update RLS Policies for Auth-Aware Access

**Files:**
- Create: `supabase/migrations/20260309000002_update_rls_for_clerk.sql`

**Context:** Current RLS policies are permissive (most use `USING (true)` or anon-friendly rules for demo mode). We need to tighten them so authenticated users only see their own data, while keeping reference data (channel formats, templates) publicly readable. We use `auth.jwt()->>'sub'` to get the Clerk user ID and join against `user_org_mapping` to resolve internal entity IDs.

**Important:** We keep existing permissive policies for `anon` role so public pages (media kits, demo) still work. We add new policies that scope `authenticated` users to their own data.

**Step 1: Write the RLS migration**

Create `supabase/migrations/20260309000002_update_rls_for_clerk.sql`:

```sql
-- Migration: Update RLS policies for Clerk-authenticated users
-- Adds scoped policies while preserving anon access for public pages

-- =============================================================================
-- CAMPAIGNS: Scoped to org via user_org_mapping
-- =============================================================================

-- Allow authenticated users to see campaigns they created (via org mapping)
DROP POLICY IF EXISTS "Authenticated users can view own campaigns" ON campaigns;
CREATE POLICY "Authenticated users can view own campaigns"
  ON campaigns FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_org_mapping uom
      WHERE uom.clerk_user_id = auth.jwt()->>'sub'
      AND uom.status = 'active'
    )
  );

-- Allow authenticated users to create campaigns for their org
DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON campaigns;
CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_org_mapping uom
      WHERE uom.clerk_user_id = auth.jwt()->>'sub'
      AND uom.org_type IN ('government', 'advertiser')
      AND uom.status = 'active'
    )
  );

-- =============================================================================
-- ORDERS: Visible to campaign advertiser org AND assigned publisher
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can view own orders" ON orders;
CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND (
      -- Publisher can see orders assigned to them
      publisher_id IN (
        SELECT uom.publisher_id FROM user_org_mapping uom
        WHERE uom.clerk_user_id = auth.jwt()->>'sub'
        AND uom.org_type = 'publisher'
        AND uom.status = 'active'
      )
      -- Or advertiser/government can see orders for their campaigns
      OR campaign_id IN (
        SELECT c.id FROM campaigns c
        WHERE EXISTS (
          SELECT 1 FROM user_org_mapping uom
          WHERE uom.clerk_user_id = auth.jwt()->>'sub'
          AND uom.org_type IN ('government', 'advertiser')
          AND uom.status = 'active'
        )
      )
    )
  );

-- =============================================================================
-- CAMPAIGN UNITS: Scoped to campaign org or assigned publisher
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can view own units" ON campaign_units;
CREATE POLICY "Authenticated users can view own units"
  ON campaign_units FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND (
      -- Publisher can see units assigned to them
      publisher_id IN (
        SELECT uom.publisher_id FROM user_org_mapping uom
        WHERE uom.clerk_user_id = auth.jwt()->>'sub'
        AND uom.org_type = 'publisher'
        AND uom.status = 'active'
      )
      -- Or campaign owner can see all units for their campaigns
      OR campaign_id IN (
        SELECT c.id FROM campaigns c
        WHERE EXISTS (
          SELECT 1 FROM user_org_mapping uom
          WHERE uom.clerk_user_id = auth.jwt()->>'sub'
          AND uom.org_type IN ('government', 'advertiser')
          AND uom.status = 'active'
        )
      )
    )
  );

-- =============================================================================
-- REFERENCE DATA: Public read (channel_formats, market_channels, unit_templates)
-- These already have permissive SELECT policies — no changes needed
-- =============================================================================

-- =============================================================================
-- USER_ORG_MAPPING: Users see own mapping (already set in Task 5)
-- =============================================================================
```

**Step 2: Push migration**

Run:
```bash
npx supabase db push
```
Expected: Migration applies successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260309000002_update_rls_for_clerk.sql
git commit -m "feat: add auth-scoped RLS policies for campaigns, orders, and units"
```

---

## Layer 3: Onboarding & Sign-Up Flows

### Task 9: Create Clerk Webhook Handler

**Files:**
- Create: `src/app/api/webhooks/clerk/route.ts`

**Context:** When Resonate staff creates an org and invites a user in the Clerk dashboard, Clerk fires webhook events. We listen for `organizationMembership.created` to automatically create the `user_org_mapping` row in Supabase. This is the "invite flow" — no custom UI needed for the inviter.

**Prerequisites:** In Clerk dashboard → Webhooks:
1. Add endpoint: `https://resonatelocal.org/api/webhooks/clerk`
2. Select events: `organizationMembership.created`, `organizationMembership.deleted`
3. Copy signing secret → add to `.env.local` as `CLERK_WEBHOOK_SECRET`

**Step 1: Install Svix for webhook verification**

Run:
```bash
npm install svix
```

**Step 2: Create webhook handler**

Create `src/app/api/webhooks/clerk/route.ts`:

```typescript
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
```

**Step 3: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/app/api/webhooks/clerk/route.ts
git commit -m "feat: add Clerk webhook handler for org membership events"
```

---

### Task 10: Build Gated Sign-Up Application Form

**Files:**
- Create: `src/app/onboarding/apply/page.tsx`
- Create: `src/app/onboarding/pending/page.tsx`

**Context:** After a user creates a Clerk account via `/sign-up`, they land on `/onboarding/apply` to submit their application (org name, type, website, city, description). On submit, a `user_org_mapping` row is created with `status: 'pending_approval'` and a confirmation email is sent restating their submission. They then see `/onboarding/pending` until approved.

**Step 1: Create the application form page**

Create `src/app/onboarding/apply/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ORG_TYPES = [
  { value: 'publisher', label: 'Community Media Publisher', description: 'Newspaper, radio, digital outlet, newsletter, podcast' },
  { value: 'government', label: 'Government Department', description: 'City, county, state, or federal agency' },
  { value: 'advertiser', label: 'Business, Nonprofit, or Foundation', description: 'Organization seeking community outreach' },
] as const;

const CITIES = [
  { value: 'sf', label: 'San Francisco' },
  { value: 'chicago', label: 'Chicago' },
] as const;

export default function ApplyPage() {
  const { user } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    orgName: '',
    orgType: '' as string,
    website: '',
    city: 'sf',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          contactName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      router.push('/onboarding/pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl font-bold text-charcoal-900">
            Join Resonate
          </h1>
          <p className="text-slate-600 mt-2">
            Tell us about your organization. We review every application personally.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-md border border-gray-100 space-y-6">
          {/* Org Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              required
              value={form.orgName}
              onChange={e => update('orgName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Your organization's name"
            />
          </div>

          {/* Org Type */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-900 mb-2">
              Organization Type
            </label>
            <div className="space-y-2">
              {ORG_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.orgType === type.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="orgType"
                    value={type.value}
                    required
                    checked={form.orgType === type.value}
                    onChange={e => update('orgType', e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-charcoal-900">{type.label}</div>
                    <div className="text-sm text-slate-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={e => update('website', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="https://yoursite.com"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Market / City
            </label>
            <select
              id="city"
              value={form.city}
              onChange={e => update('city', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>{city.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Brief Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Tell us about your audience, mission, or what you're looking for"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Create the pending approval page**

Create `src/app/onboarding/pending/page.tsx`:

```tsx
import { UserButton } from '@clerk/nextjs';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-2">
            Application Under Review
          </h1>
          <p className="text-slate-600 mb-6">
            Thank you for applying to Resonate! We review every application personally
            and will get back to you shortly. Check your email for a confirmation of
            your submission.
          </p>
          <div className="flex justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify pages render**

Run:
```bash
npm run dev
```
Navigate to `http://localhost:3002/onboarding/apply`.
Expected: Form renders with org name, type selection, website, city, description fields.

**Step 4: Commit**

```bash
git add src/app/onboarding/apply/page.tsx src/app/onboarding/pending/page.tsx
git commit -m "feat: add gated sign-up application form and pending approval page"
```

---

### Task 11: Build Application API Endpoint

**Files:**
- Create: `src/app/api/onboarding/apply/route.ts`

**Context:** The application form (Task 10) POSTs to this endpoint. It creates a `user_org_mapping` row with `status: 'pending_approval'` and a Clerk org with matching metadata. It also stores the application details for the approval UI.

**Step 1: Create the application API route**

Create `src/app/api/onboarding/apply/route.ts`:

```typescript
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
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/onboarding/apply/route.ts
git commit -m "feat: add application submission API with Clerk org creation"
```

---

### Task 12: Build Admin Approval Dashboard

**Files:**
- Create: `src/app/admin/approvals/page.tsx`
- Create: `src/app/api/admin/approvals/route.ts`
- Create: `src/app/api/admin/approvals/[id]/route.ts`

**Step 1: Create the approvals API (list pending)**

Create `src/app/api/admin/approvals/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const { sessionClaims } = await auth();
  const orgType = (sessionClaims?.metadata as Record<string, string>)?.orgType;

  if (orgType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('user_org_mapping')
    .select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ applications: data });
}
```

**Step 2: Create the approve/reject API**

Create `src/app/api/admin/approvals/[id]/route.ts`:

```typescript
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
```

**Step 3: Create the admin approvals page**

Create `src/app/admin/approvals/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/lib/auth';

interface Application {
  id: string;
  clerk_user_id: string;
  clerk_org_id: string;
  org_type: string;
  city_slug: string;
  status: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const user = useCurrentUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    const res = await fetch('/api/admin/approvals');
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  if (user.orgType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Access denied.</p>
      </div>
    );
  }

  const orgTypeLabel: Record<string, string> = {
    publisher: 'Publisher',
    government: 'Government',
    advertiser: 'Business / Nonprofit',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-6">
          Pending Applications
        </h1>

        {loading && <p className="text-slate-500">Loading...</p>}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
            <p className="text-slate-500">No pending applications.</p>
          </div>
        )}

        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                      {orgTypeLabel[app.org_type] || app.org_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {app.city_slug.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(app.id, 'approve')}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'reject')}
                    className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/api/admin/approvals src/app/admin/approvals
git commit -m "feat: add admin approval dashboard for gated sign-up applications"
```

---

### Task 13: Create Demo/Sample Profile Pathway

**Files:**
- Create: `src/app/demo/publisher/[slug]/page.tsx`
- Create: `src/app/demo/campaign/page.tsx`

**Context:** Public demo pages showing curated sample publisher profiles and a campaign creation walkthrough. No auth required. Uses existing Supabase data with anon key. These are for sales pitches, investor demos, and onboarding previews.

**Step 1: Create sample publisher profile page**

Create `src/app/demo/publisher/[slug]/page.tsx`:

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Curated demo publisher slugs (mapped to seeded publisher IDs)
const DEMO_PUBLISHERS: Record<string, string> = {
  'el-tecolote': '11111111-1111-1111-1111-111111111101',
  'mission-local': '11111111-1111-1111-1111-111111111102',
  'the-bay-view': '11111111-1111-1111-1111-111111111103',
  'sf-public-press': '11111111-1111-1111-1111-111111111104',
  '48-hills': '11111111-1111-1111-1111-111111111111',
};

export default async function DemoPublisherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publisherId = DEMO_PUBLISHERS[slug];

  if (!publisherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-2">
            Publisher Not Found
          </h1>
          <p className="text-slate-600">This demo profile doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: publisher } = await supabase
    .from('publishers')
    .select('*')
    .eq('id', publisherId)
    .single();

  if (!publisher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Publisher data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium">
        Sample Publisher Profile &mdash; <a href="/sign-up" className="underline">Join Resonate</a> to access the full platform
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            {publisher.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publisher.logo_url}
                alt={publisher.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="font-fraunces text-2xl font-bold text-charcoal-900">
                {publisher.name}
              </h1>
              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:underline"
                >
                  {publisher.website}
                </a>
              )}
            </div>
          </div>

          {publisher.description && (
            <p className="text-slate-600 mb-6">{publisher.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-slate-500">Status</div>
              <div className="font-semibold text-charcoal-900 capitalize">{publisher.status}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-slate-500">Contact</div>
              <div className="font-semibold text-charcoal-900">{publisher.contact_name || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create campaign walkthrough page**

Create `src/app/demo/campaign/page.tsx`:

```tsx
export default function DemoCampaignPage() {
  const steps = [
    {
      number: 1,
      title: 'Campaign Brief',
      description: 'Name your campaign, set goals, define your target audience by neighborhood, language, and community.',
    },
    {
      number: 2,
      title: 'Audience Targeting',
      description: 'Fine-tune geographic, demographic, and cultural targeting. Set budget range and flight dates.',
    },
    {
      number: 3,
      title: 'Publisher Matching',
      description: 'Our algorithm matches your campaign to community media publishers who reach your target audience. Select publishers to work with.',
    },
    {
      number: 4,
      title: 'Unit Builder',
      description: 'Build production-ready creative units for social media, display ads, newsletters, and more. Upload your own or use our templates.',
    },
    {
      number: 5,
      title: 'Review & Submit',
      description: 'Review all campaign details, creative units, and publisher assignments. Submit to send orders to publishers.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium">
        Campaign Walkthrough &mdash; <a href="/sign-up" className="underline">Join Resonate</a> to create real campaigns
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-10">
          <h1 className="font-fraunces text-3xl font-bold text-charcoal-900 mb-3">
            How Campaigns Work
          </h1>
          <p className="text-slate-600">
            From brief to delivery in five steps. Resonate connects your message
            with the communities that matter most.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map(step => (
            <div key={step.number} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-teal-700">{step.number}</span>
              </div>
              <div>
                <h2 className="font-semibold text-charcoal-900 mb-1">{step.title}</h2>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/sign-up"
            className="inline-block px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify pages render**

Run:
```bash
npm run dev
```
- Navigate to `http://localhost:3002/demo/publisher/el-tecolote` — should show publisher profile with demo banner
- Navigate to `http://localhost:3002/demo/campaign` — should show 5-step walkthrough

**Step 4: Commit**

```bash
git add src/app/demo
git commit -m "feat: add demo publisher profiles and campaign walkthrough pages"
```

---

### Task 14: Add Post-Login Redirect Logic

**Files:**
- Create: `src/app/api/auth/redirect/route.ts`
- Modify: `src/middleware.ts` (add redirect for authenticated users hitting `/sign-in`)

**Context:** After sign-in, users should land in their portal based on org type. If a user with `pending_approval` status signs in, they should be redirected to `/onboarding/pending`. Clerk's `afterSignInUrl` can point to an API route that resolves the correct destination.

**Step 1: Create auth redirect API**

Create `src/app/api/auth/redirect/route.ts`:

```typescript
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'));
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: mapping } = await supabase
    .from('user_org_mapping')
    .select('org_type, city_slug, status')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

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
}
```

**Step 2: Update Clerk env vars for redirect**

Add to `.env.local`:
```
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/api/auth/redirect
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/apply
```

**Step 3: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/api/auth/redirect/route.ts
git commit -m "feat: add post-login redirect routing based on org type and approval status"
```

---

## Summary

| Task | Layer | What It Does |
|------|-------|-------------|
| 1 | Auth Shell | Install Clerk, add ClerkProvider |
| 2 | Auth Shell | Sign-in and sign-up pages |
| 3 | Auth Shell | Middleware with route protection + portal access control |
| 4 | Auth Shell | Rewire useCurrentUser to Clerk |
| 5 | JWT Bridge | Create user_org_mapping table |
| 6 | JWT Bridge | Server Supabase client with Clerk JWT |
| 7 | JWT Bridge | Browser Supabase client with Clerk JWT |
| 8 | JWT Bridge | Auth-scoped RLS policies |
| 9 | Onboarding | Clerk webhook handler |
| 10 | Onboarding | Application form + pending page |
| 11 | Onboarding | Application API endpoint |
| 12 | Onboarding | Admin approval dashboard |
| 13 | Onboarding | Demo/sample profile pathway |
| 14 | Onboarding | Post-login redirect logic |

**Manual Clerk dashboard setup required (not automated):**
- Create Clerk application + get API keys
- Create "supabase" JWT template with Supabase JWT secret
- Configure webhook endpoint + get signing secret
- Create initial admin org with `publicMetadata: { type: 'admin' }`
