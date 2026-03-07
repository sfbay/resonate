# Eric Newton Demo Polish — Design Doc

**Date:** 2026-03-07
**Status:** Completed
**Goal:** Prepare resonatelocal.org for Eric Newton review by fixing publisher cart behavior and wiring up hidden features.

## 1. Publisher Shopping Cart (Discover Page) — DONE

**Problem:** Clicking a publisher on `/government/discover` immediately navigated to the campaign wizard. Should be a multi-select cart.

**Solution implemented:**
- `handlePublisherSelect` toggles publisher in a `useState<Set<string>>` instead of navigating
- Selected publishers get teal checkmark badge + highlighted border on their card
- Sticky top notification bar appears when 1+ selected: "X publishers selected — Build Campaign"
- "Build Campaign" button navigates to `/government/onboarding?publishers=id1,id2,id3`
- Step 3 (matches) pre-selects those publisher IDs in `selectedPublishers` Set and pins them to top

**Additional fix required:** Discover page publisher IDs were `pub-N` format while matching API returns Supabase UUIDs. Aligned all discover page IDs to use Supabase UUIDs so the cart→wizard bridge works correctly.

**Components modified:**
- `src/app/government/discover/page.tsx` — cart state, top bar, card badges, UUID alignment
- `src/components/government/PublisherDiscoveryMap.tsx` — `selectedIds` prop, card selection visuals
- `src/app/government/onboarding/page.tsx` — read `publishers` param, pre-select in Step 3, `sortedMatches`

## 2. Portal Navigation Links — DONE

### Publisher Dashboard Navigation
- Dashboard → `/[city]/publisher/dashboard`
- Orders → `/[city]/publisher/dashboard/orders`
- Rate Card → `/[city]/publisher/dashboard/rate-card`

**Note:** Ad Builder and Schedule were in the original plan but don't have pages built. Replaced with Orders and Rate Card which were built but unlinked. This avoids 404s while exposing more features.

### Government Portal Navigation
- Discover → `/[city]/government/discover`
- Campaigns → `/[city]/government/campaigns`

### Advertise Portal Navigation
- Dashboard → `/[city]/advertise/dashboard`

**Components modified:**
- `src/components/shared/index.tsx` (Nav) — portal-specific nav links with city-aware prefixes

## 3. City-Scoped Link Fixes — DONE

**Problem:** Next.js `<Link>` client-side navigation doesn't reliably follow middleware redirects for city-scoping.

**Solution:** Added `useCityOptional()` to all portal landing pages to generate direct city-scoped URLs.

**Files fixed:**
- `src/app/publisher/page.tsx`
- `src/app/publisher/dashboard/page.tsx`
- `src/app/government/page.tsx`
- `src/app/government/discover/page.tsx`
- `src/app/advertise/page.tsx`
- `src/app/[city]/page.tsx` (ClosingSection)
- `src/components/shared/index.tsx` (Nav + Footer)

**City-scoped re-exports created:**
- `src/app/[city]/publisher/onboarding/page.tsx`
- `src/app/[city]/government/discover/page.tsx`
- `src/app/[city]/government/onboarding/page.tsx`
- `src/app/[city]/publisher/dashboard/guidelines/page.tsx`
- `src/app/[city]/publisher/dashboard/orders/page.tsx`
- `src/app/[city]/publisher/dashboard/rate-card/page.tsx`

## 4. Journey Audit — DONE

All three portal journeys verified working with no 404s or dead ends:

| Portal | Flow | Status |
|--------|------|--------|
| Publisher (coral) | Landing → Dashboard → Orders → Rate Card | Pass |
| Government (teal) | Landing → Discover → Cart → Build Campaign → Wizard → Campaigns | Pass |
| Advertise (marigold) | Landing → Dashboard | Pass |

## Out of Scope (saved for future)
- Publisher Ad Builder page (social ad creation tool — not yet built)
- Publisher Schedule page (content calendar — not yet built)
- Government-facing Creative Studio (AI ad builder for compliant display ads)
- Persistent cart (session storage / DB) — ephemeral state is sufficient for now
- Media Kit Slides page
