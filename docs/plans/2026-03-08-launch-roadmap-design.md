# Resonate Launch Roadmap Design

**Date:** 2026-03-08
**Status:** Approved

## Vision

Resonate is a marketplace connecting advertisers (government, business, nonprofit) with community media publishers. The platform matches campaigns to publishers, helps advertisers build production-ready creative units, and gives publishers the tools to accept, produce, and deliver sponsored content — all while maintaining editorial independence.

Launch targets SF and Chicago in parallel, with a possible third smaller market. Individual community outreach and onboarding, not self-service sign-up (for now).

---

## Channel Taxonomy

### Buyer-Facing Groups (Three Top-Level Tabs)

| Group | Buyer Label | Channels Inside |
|-------|------------|----------------|
| **Social** | Social Advertising | Social media (feed/story/reel/carousel), Newsletter (mentions/dedicated sends), Messaging (WhatsApp/Telegram/Signal/Discord broadcasts) |
| **Display** | Display & Sponsored | Banner ads (IAB standard sizes), Sponsored content (articles/advertorials) |
| **Audio/Video** | Audio & Video | Podcast (pre-roll/mid-roll/sponsored segments), Video (YouTube/publisher site) |

### Underlying Architecture: Format → Platform → Placement

Buyer-facing labels are marketing language. Under the hood, units are modeled as:

- **Format** — what are we making? (static image, video/reel, story, text+image, carousel, HTML block, banner, audio clip, script, brief+assets)
- **Platform** — where does it go? (Instagram, TikTok, Facebook, Mailchimp, Substack, WhatsApp, Telegram, publisher website, Spotify, YouTube)
- **Placement** — what slot does it fill? (feed post, story, reel, newsletter mention, dedicated send, broadcast, 300x250 banner, leaderboard, pre-roll, talent read, sponsored segment)

### Market Gating

Per-market configuration controls which channels/groups are available. Example: SF disables Display (coalition partner covers that), Chicago enables all three groups. Gating works at the group level or individual format level.

---

## Unit Builder

### Position in Campaign Flow

The unit builder is **Step 4** in the campaign wizard, after publisher selection:

1. Campaign Brief
2. Audience Targeting
3. Publisher Matches (select publishers)
4. **Unit Builder** (new) — build/upload creative units per format
5. Review & Submit

### Layout

- **Top:** Three group tabs (Social | Display & Sponsored | Audio & Video) — only market-enabled tabs shown
- **Left column:** Builder panel — format selection, creative inputs, copy fields
- **Right column:** Live preview — phone mockup (social), browser mockup (display), audio player (podcast)

### Builder Flow (Per Tab)

1. **Pick format** — visual cards (e.g., "Instagram Reel", "Newsletter Mention", "300x250 Banner")
2. **Create or upload:**
   - *Upload:* drag-and-drop, auto-detect dimensions, validate against format requirements
   - *Free Templates:* curated library, customize text/colors/images/logo
   - *Premium Templates:* elevated designs, seasonal, category-specific (upsell)
   - *Assisted:* AI generation from brief + brand assets, or Resonate team custom design (premium upsell)
3. **Add copy/metadata** — headline, body, CTA, hashtags, URL, disclosure text (pre-filled with platform compliance defaults)
4. **Assign to publishers** — checkboxes from selected publishers, or "all"
5. **Review** — all units as cards, grouped by publisher

Upload is always available alongside any tier — it's an escape hatch, not a tier.

### Creative Tiers (Revenue Model)

| Tier | What You Get | Price |
|------|-------------|-------|
| **Free Templates** | Polished, customizable templates per format. Professional baseline — nobody looks bad. | Included in campaign fee |
| **Premium Templates** | Elevated designs, more variety, trending/seasonal styles, category-specific (government outreach, events, public health). Feels bespoke. | Upsell |
| **Assisted** | AI generation from brief + brand assets, or Resonate team designs custom. One-click "make this look amazing." | Premium upsell (highest margin) |

### Key Interactions

- Duplicate units across publishers with one click
- Format requirements shown inline (e.g., "Reels: 9:16, max 90s, under 100MB")
- Compliance notes auto-populated per platform ("Instagram requires Paid Partnership tag")
- "Add another unit" to build multiple units per channel
- Text/copy fields available for all social formats (captions, hashtags, CTAs)

---

## Publisher Accept/Reject & Deliverable Packaging

### Order Flow

When an advertiser submits a campaign, each assigned publisher receives an order containing their units in the Orders dashboard (`/publisher/dashboard/orders`).

### Order Detail View

1. **Campaign summary card** — advertiser name, campaign name, flight dates, total value
2. **Units list** — expandable cards per unit:
   - Format + placement label
   - Live preview of creative
   - Copy/caption/CTA
   - Platform compliance requirements
   - Deadline
   - Payout for this unit
3. **Actions** (per-unit or bulk):
   - **Accept** — commits to producing this unit
   - **Request Revision** — sends specific feedback to advertiser, unit stays open for creative adjustment
   - **Reject** — with required reason (editorial standards / audience mismatch / scheduling conflict / other)
4. **Accept All / Reject All** — bulk action

No rate negotiation. The rate card is the rate card. Publishers set their rates; advertisers see them when selecting publishers.

### Production Kit (After Acceptance)

Unit card transforms into a production card with everything needed:

| Format | Package Contents |
|--------|-----------------|
| Social (image) | Sized image files, caption, hashtags, @mentions, CTA link, Paid Partnership instructions |
| Social (reel/video) | Video file (platform-sized), caption, thumbnail, posting checklist |
| Newsletter | HTML block or text + image + CTA, placement notes, tracking link |
| Messaging | Text + image/video, broadcast copy, link |
| Display banner | Creative files per IAB size, click-through URL, tracking pixel, flight dates |
| Audio/Podcast | Audio clip OR script with talking points, sponsor URL, FTC disclosure language, read length |
| Sponsored content | Brief, key messages, brand assets, links — publisher writes in their voice |

**One-click download:** "Download Production Kit" bundles all assets + spec sheet PDF into a zip.

### Delivery Confirmation

Publisher marks unit as delivered, optionally uploads proof (screenshot, post URL, analytics). Advertiser gets notified.

---

## Unit Status Lifecycle

```
draft → ready → sent → pending_publisher → accepted → in_production → delivered
                                         → revision_requested → (back to ready)
                                         → rejected
```

---

## Auth & User System

### Technology: Clerk

- Native Next.js App Router support (middleware, server components, hooks)
- Organization model maps to publisher/government/business orgs
- Role management per org (admin, editor, viewer)
- JWT templates integrate with Supabase RLS
- Handles sign-up, login, magic links, OAuth — no custom auth UI

### User Model Mapping

| Clerk Concept | Resonate Concept |
|---------------|-----------------|
| User | Individual person (email, name, avatar) |
| Organization | Publisher, Government department, or Business/Nonprofit |
| Org membership role | admin, editor, viewer |
| Org metadata | `type: 'publisher' \| 'government' \| 'advertiser'`, linked Supabase IDs |

### Stub Strategy

Build `useCurrentUser()` hook returning `{ userId, orgId, orgType, role }`. Initially returns mock data. When Clerk goes in, hook reads from Clerk context. No component changes needed.

---

## Data Model

### New Tables

**`market_channels`** — per-city channel gating
- `city_slug`, `channel_group` (social/display/audio_video), `enabled` (boolean)
- Optional: per-format granularity

**`campaign_units`** — the atomic deliverable
- `id`, `campaign_id`, `publisher_id`
- `channel_group` (social/display/audio_video)
- `format`, `platform`, `placement`
- `status` (draft/ready/sent/pending_publisher/accepted/revision_requested/rejected/in_production/delivered)
- `creative_assets` (JSON — file URLs, copy, headlines, CTAs, hashtags, tracking pixels)
- `compliance_notes` (platform-specific disclosure requirements)
- `tier` (free/premium/assisted)
- `revision_feedback` (text — publisher's revision request)
- `proof` (JSON — delivery proof URLs, post links, screenshots)
- `deadline`, `payout_cents`

**`unit_templates`** — template library
- `id`, `name`, `channel_group`, `format`, `platform`
- `tier` (free/premium)
- `template_data` (JSON — layout, default styles, placeholder content)
- `thumbnail_url`, `category` (government/event/health/general)

### Extended Tables

**`orders`** — add reference to units
- Units replace or supplement existing `order_line_items` as the primary deliverable model

---

## Build Phases

### Phase 1: Data Foundation — COMPLETE (2026-03-08)
- [x] Channel/format/placement taxonomy (DB tables + market gating config)
- [x] `campaign_units` table with status lifecycle
- [x] `unit_templates` table for template library
- [x] TypeScript channel registry with types, constants, compliance defaults
- [x] Channel query utilities + market channels API
- [x] Campaign units CRUD API (`/api/campaigns/[id]/units`)
- [x] `useCurrentUser()` stub hook
- Plan: `docs/plans/2026-03-08-phase1-data-foundation.md`

### Phase 2: Unit Builder — COMPLETE (2026-03-09)
- [x] Step 4 added to both government and advertise campaign wizards
- [x] `useChannelFormats` hook for city-gated format fetching
- [x] ChannelGroupTabs (Social / Display & Sponsored / Audio & Video)
- [x] FormatPicker grid with spec summaries
- [x] CreativeEditor with drag-and-drop upload, copy fields, compliance
- [x] PublisherAssignment checkboxes
- [x] UnitReviewCard for campaign review
- [x] UnitBuilder orchestrator component
- [x] Units saved to database on campaign submit
- Plan: `docs/plans/2026-03-08-phase2-unit-builder.md`

### Phase 3: Publisher Order Flow — COMPLETE (2026-03-09)
- [x] Units included in order API response
- [x] Unit status transition validation (accept/revision/reject)
- [x] Publisher UnitCard with creative preview + per-unit actions
- [x] Production kit API endpoint + inline panel
- [x] Delivery confirmation with proof upload per unit
- [x] Format label lookup utility
- Plan: `docs/plans/2026-03-09-phase3-publisher-order-flow.md`

### Phase 4: Auth Overlay — COMPLETE (2026-03-09)
- [x] Clerk SDK setup + ClerkProvider
- [x] Sign-in/sign-up pages
- [x] Middleware route protection + portal access control
- [x] `useCurrentUser()` wired to Clerk
- [x] user_org_mapping table (Clerk↔Supabase identity bridge)
- [x] Supabase JWT bridge (server + browser clients)
- [x] RLS policies scoped to real users
- [x] Clerk webhook handler for org membership events
- [x] Gated sign-up application form + approval dashboard
- [x] Demo/sample profile pathway
- [x] Post-login redirect routing
- Plan: `docs/plans/2026-03-09-phase4-auth-overlay.md`

### Phase 5: Premium Templates, AI Assist & Performance Tracking — IN PROGRESS
- [ ] Seed unit templates library (social, display, newsletter)
- [ ] Templates API endpoint
- [ ] TemplatePicker component with category filter + tier badges
- [ ] Creation mode tabs (Upload/Templates/Assist) in CreativeEditor
- [ ] AI-assisted generation endpoint (copy + template recommendation)
- [ ] AssistMode component wired into CreativeEditor
- [ ] UTM tracked link generator
- [ ] Auto-generate tracked URLs on unit creation
- [ ] Metrics fields in publisher delivery form
- [ ] Campaign performance dashboard
- [ ] Publisher social scheduling (deferred to post-auth testing)
- Plan: `docs/plans/2026-03-09-phase5-premium-assist.md`

---

## Design Principles

- **Buyer language first** — UI says "Social Advertising," system models format/platform/placement
- **Nobody looks bad** — free template tier must be genuinely professional
- **Editorial independence** — publishers accept/reject on their terms, no rate negotiation
- **Package, don't pipeline** — Resonate delivers production-ready assets; publishers execute (except social scheduling assist in Phase 5)
- **Auth-aware, auth-deferred** — stub `useCurrentUser()` now, wire Clerk later
- **Market-flexible** — channel gating per city, parallel SF/Chicago development
