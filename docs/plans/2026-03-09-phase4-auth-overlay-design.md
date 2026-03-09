# Phase 4: Auth Overlay Design

**Date:** 2026-03-09
**Status:** Approved

## Goal

Add real authentication and authorization to Resonate using Clerk, replacing the mock `useCurrentUser()` stub with real identity, protecting portal routes, bridging Clerk JWTs to Supabase RLS, and building invite + gated sign-up onboarding flows.

## Key Decisions

- **Auth provider:** Clerk (native Next.js App Router support, org model maps to publisher/government/advertiser)
- **Sign-up model:** Invite-only (A) primary, gated sign-up (B) secondary. Advertisers first to go full self-service (C) in the future.
- **Admin tooling:** Clerk Dashboard for invites/org creation now. Lightweight in-app approval UI for gated sign-ups. Full admin portal later.
- **Gated sign-up fields:** Org name, org type, website URL, city/market, brief description (medium detail — enough to triage without a call)
- **Portal visibility rules:**
  - Publisher → publisher portal + can browse advertise portal
  - Government → government portal only
  - Advertiser → advertise portal only
  - Admin → all portals
- **Post-login routing:** Auto-route by org type, org switcher in nav for multi-org/admin users
- **Supabase integration:** Clerk JWT template → `auth.uid()` → RLS policies (official Clerk+Supabase pattern)
- **Public pages after auth:** Landing, home, media kits, demo/sample profiles stay public. Portal dashboards locked.
- **Demo pathway:** Curated sample publisher profiles and campaign walkthrough at `/demo/*`, no auth required

## Design Principles

- Always confirm complex form submissions back to the user via email
- No wall-of-text forms — progressive disclosure, conversational tone
- Future brainstorm: alternative intake modes (document upload with AI extraction, interactive video interview with automated processing and confirmation)

---

## Architecture: Layered Rollout

Three independently shippable layers:

### Layer 1: Auth Shell

**Clerk SDK setup:**
- Install `@clerk/nextjs`
- `<ClerkProvider>` wraps root `layout.tsx`
- Env vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

**Middleware:**
- Add `clerkMiddleware()` with route matchers
- Public routes: `/`, `/home`, `/media-kit/*`, `/demo/*`, `/api/webhooks/*`
- Protected routes: `/[city]/publisher/*`, `/[city]/government/*`, `/[city]/advertise/*`, `/api/*` (except webhooks)
- City-scoping redirect logic preserved, runs after Clerk auth check
- Portal access control: middleware checks `orgType` against portal route, redirects unauthorized access to user's home portal

**`useCurrentUser()` rewire:**
- Swap mock `MOCK_USER` for Clerk's `useUser()` + `useOrganization()`
- Same `CurrentUser` interface — no downstream breaking changes
- `orgType` from `organization.publicMetadata.type`
- `useCurrentUserOptional()` returns `null` for unauthenticated visitors

**Sign-in/sign-out:**
- Clerk `<SignIn />` at `/sign-in`, `<SignUp />` at `/sign-up`
- Post-login redirect based on org type → portal home

### Layer 2: Supabase JWT Bridge

**Clerk JWT template:**
- Named "supabase", created in Clerk dashboard
- Claims: `sub` (Clerk user ID), `role` ("authenticated"), `org_id`, `org_type`

**Supabase client changes:**
- Server client (`supabase-server.ts`): get Clerk token via `auth().getToken({ template: 'supabase' })`, pass as auth header
- Browser client (`supabase.ts`): get token via `session.getToken({ template: 'supabase' })`, pass to client
- Fall back to anon key for public/unauthenticated pages

**RLS policy updates:**
- Publishers: `USING (user_id = auth.uid())` for own data
- Campaigns/orders: scoped to advertiser org or assigned publisher via `user_org_mapping`
- Reference data (channel formats, market channels, unit templates): remain public read
- Campaign units: scoped to campaign's org or assigned publisher

**New table: `user_org_mapping`:**
- `clerk_user_id TEXT`, `clerk_org_id TEXT`, `org_type`, `publisher_id UUID NULL`, `advertiser_id UUID NULL`
- Links Clerk identity to internal Supabase entity IDs
- Populated during onboarding (Layer 3) or Clerk invite flow via webhook

### Layer 3: Onboarding & Sign-Up Flows

**Invite flow (primary):**
- Resonate team creates org in Clerk dashboard with `publicMetadata: { type, city }`
- Sends invite email to contact
- User accepts invite → sets password → Clerk webhook fires → creates `user_org_mapping` in Supabase
- User auto-routes to their portal

**Gated sign-up flow (secondary):**
- `/sign-up` → Clerk account creation → `/onboarding/apply`
- Application form: org name, org type, website, city/market, description
- Confirmation email sent restating all submitted information
- Account set to `pending_approval` (Clerk org metadata)
- Pending users see holding page ("Application under review")

**Approval flow:**
- `/admin/approvals` — Resonate staff only (`admin` org type)
- Pending applications shown as cards
- Approve → activates org, creates `user_org_mapping`, sends welcome email
- Reject → sends rejection email with optional note

**Demo/sample pathway:**
- `/demo/publisher/:slug` — read-only sample profiles, curated data
- `/demo/campaign` — campaign creation walkthrough with sample data
- No auth required, clearly labeled as demo
- Linked from landing page and pitch contexts

**Clerk webhook handler:**
- `POST /api/webhooks/clerk` — handles `organization.created`, `organizationMembership.created`, `user.created` events
- Creates/updates `user_org_mapping` rows
- Secured with Clerk webhook signing secret

---

## Files Affected

### New files
- `/sign-in/[[...sign-in]]/page.tsx` — Clerk sign-in page
- `/sign-up/[[...sign-up]]/page.tsx` — Clerk sign-up page
- `/onboarding/apply/page.tsx` — gated sign-up application form
- `/onboarding/pending/page.tsx` — "under review" holding page
- `/admin/approvals/page.tsx` — approval dashboard
- `/api/webhooks/clerk/route.ts` — Clerk webhook handler
- `/demo/publisher/[slug]/page.tsx` — sample publisher profile
- `/demo/campaign/page.tsx` — campaign walkthrough demo
- `supabase/migrations/NNNN_create_user_org_mapping.sql` — mapping table + RLS
- `supabase/migrations/NNNN_update_rls_policies.sql` — scoped RLS policies

### Modified files
- `src/app/layout.tsx` — add `<ClerkProvider>`
- `src/middleware.ts` — add Clerk middleware + portal access control
- `src/lib/auth/index.ts` — rewire to Clerk hooks
- `src/lib/db/supabase.ts` — Clerk JWT for browser client
- `src/lib/db/supabase-server.ts` — Clerk JWT for server client
- `package.json` — add `@clerk/nextjs`

---

## What This Does NOT Include

- Full admin portal (future — use Clerk Dashboard for now)
- Self-service advertiser sign-up (future Phase 5+)
- Advanced role/permission matrix beyond admin/editor/viewer
- SSO/SAML for government departments (future enterprise feature)
- Alternative intake modes (document upload, video interview — future brainstorm)
