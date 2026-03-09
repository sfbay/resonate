# Phase 5: Premium Templates, AI Assist & Performance Tracking Design

**Date:** 2026-03-09
**Status:** Approved

## Goal

Add a template library to the unit builder (free + premium tiers), AI-assisted creative generation that recommends templates and writes copy, and per-unit performance tracking with tracked links and publisher-reported metrics.

Social scheduling is deferred until Phase 4 (Auth) is complete and tested.

## Key Decisions

- **Templates:** Static pre-made designs with text/logo customization for launch. Structured JSON layouts (client-side rendering) as a future evolution. `template_data` JSONB supports both patterns.
- **Premium gating:** Badge only, no gate. All templates available to everyone. Premium badge tracks traction. Gate activates when billing (Stripe) goes in later.
- **AI assist:** Copy generation + template recommendation (not image generation). AI picks the best template and writes headline/body/CTA/hashtags from the campaign brief. Uses existing multi-provider AI factory (Claude/Gemini/OpenAI).
- **Performance tracking:** Publisher-reported metrics on delivery + auto-generated tracked URLs (UTM params). Independent click measurement. No platform API integration yet — same `DeliveryProof.metrics` shape will accept API data later.

## Design Principles

- Templates should make everyone look professional — "nobody looks bad" is the baseline
- AI assist is a recommendation, not a replacement — user always reviews and can edit
- Performance data is honest about sourcing — clearly label "publisher-reported" vs. "tracked" metrics
- Room to grow: static → structured templates, UTM → short links, manual metrics → platform API

---

## Architecture: Layered Build

Three independently shippable layers:

### Layer 1: Template Library + Picker

**Template data model:**
- Existing `unit_templates` table: `tier` (free/premium), `category`, `template_data` JSONB, `thumbnail_url`
- `template_data` for static templates: `{ baseImageUrl, textFields: [{ key, label, x, y, fontSize, color, maxWidth }], logoArea: { x, y, width, height }, colorScheme: { primary, secondary } }`
- Future structured templates: same schema, rendered client-side on canvas instead of CSS overlay

**Seed library:**
- ~3-5 templates per social format (static_image, story, carousel)
- ~2-3 per display format (banner_ad)
- ~1-2 per newsletter format
- Categories: `general`, `government`, `health`, `events`, `community`
- Mix of free and premium tiers (badged, not gated)

**CreativeEditor creation modes:**
- New mode selector at top: **Upload** | **Templates** | **Assist**
- Upload = existing drag-and-drop (unchanged)
- Templates = grid of template cards filtered by current format, thumbnail + name + tier badge ("Premium" badge on premium, no lock)
- Clicking template loads: base image as creative file, text fields pre-populated with placeholder copy
- User customizes headline, body, CTA (existing fields) + optionally uploads logo

**Template preview:**
- Live preview panel (right side): phone frame for social, browser frame for display
- CSS-based text overlay on template image (not canvas rendering for now)

### Layer 2: AI-Assisted Generation

**Generation API:**
- `POST /api/campaigns/[id]/units/assist`
- Input: `{ formatKey, platform, placement, campaignId }`
- Server fetches campaign brief from DB, queries matching templates, calls AI provider
- Output: `{ recommendedTemplateId, headline, bodyText, ctaText, hashtags, reasoning }`
- Uses existing `generateCompletion()` from `src/lib/ai/`

**Prompt design:**
- System: Resonate's role, format constraints (char limits, platform compliance)
- User: campaign brief, target audience, format specs, available template names/categories
- Response: structured JSON with copy + template pick + reasoning
- Fallback: if AI unavailable, show template picker without recommendation

**CreativeEditor "Assist" mode:**
- "Generate Creative" button with campaign context summary
- Loading state → results: recommended template applied, copy pre-filled
- User can: accept, edit any field, switch template (keep copy), regenerate

### Layer 3: Performance Tracking

**Tracked link generation:**
- Auto-generate tracked CTA URL when unit is created
- UTM params: `utm_source=resonate`, `utm_medium=[format]`, `utm_campaign=[campaign_id]`, `utm_content=[unit_id]`
- Stored in `creative_assets.trackedCtaUrl` alongside original `ctaUrl`
- Future: Resonate-branded short link redirector with click counting

**Publisher metrics submission:**
- Delivery proof form expanded with: impressions, reach, engagement, clicks (all optional number inputs)
- Stored in existing `campaign_units.proof` JSON (`DeliveryProof.metrics`)
- Same shape accepts platform API data in the future

**Campaign performance dashboard:**
- "Performance" tab on campaign detail page (government + advertise portals)
- Per-unit cards: format, publisher, status, reported metrics, tracked clicks
- Aggregate stats: total impressions, reach, engagement, clicks across delivered units
- Stat blocks layout — clear numbers, nothing fancy
- Units pending delivery show "Awaiting" state

---

## Files Affected

### New files
- `src/components/government/unit-builder/TemplatePicker.tsx` — template browsing grid
- `src/components/government/unit-builder/TemplatePreview.tsx` — live preview with text overlay
- `src/components/government/unit-builder/AssistMode.tsx` — AI generation UI
- `src/app/api/campaigns/[id]/units/assist/route.ts` — AI generation endpoint
- `src/app/api/templates/route.ts` — template listing API
- `src/lib/tracking/utm.ts` — UTM link generator utility
- `src/components/government/campaigns/PerformanceDashboard.tsx` — campaign performance view
- `src/components/publisher/orders/MetricsForm.tsx` — publisher metrics submission
- `supabase/migrations/NNNN_seed_unit_templates.sql` — template seed data

### Modified files
- `src/components/government/unit-builder/CreativeEditor.tsx` — add mode selector (Upload/Templates/Assist)
- `src/components/publisher/orders/UnitCard.tsx` — add metrics fields to delivery proof form
- `src/app/api/campaigns/[id]/units/route.ts` — auto-generate tracked URLs on unit creation

---

## What This Does NOT Include

- Social scheduling (deferred to post-Phase 4 auth)
- Image generation (AI generates copy only, not images)
- Canvas-based template rendering (CSS overlay for now, canvas later)
- Billing/paywall for premium templates (badge only, gate when Stripe goes in)
- Platform API metric ingestion (publisher-reported + UTM tracking only)
- Short link service (UTM params for now, branded redirector later)
