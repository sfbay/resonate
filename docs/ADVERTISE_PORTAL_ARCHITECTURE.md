# Advertise Portal Architecture

## Overview

Resonate's third portal: a community media advertising marketplace for businesses, nonprofits, foundations, and other organizations. The portal embraces the dual value proposition: *advertising IS support* for community/ethnic publishers.

**Three-portal system:**
- **Publisher** (coral) — Community/ethnic media outlets
- **Government** (teal) — City departments with procurement-specific workflows
- **Advertise** (marigold) — Businesses, nonprofits, foundations, and other advertisers

## Status: Phase 1 Complete

- [x] Three-portal architecture (routes, nav, footer, city landing)
- [x] Advertise landing page (`/advertise`)
- [x] Government portal renamed from `/advertiser` to `/government`
- [x] Marigold theme integration (btn-marigold, accent-advertise, Testimonial variant)
- [ ] Type system expansion (advertiser source discriminator)
- [ ] Database schema (advertisers table with source enum)
- [ ] Goal-based matching presets
- [ ] Onboarding flow for businesses
- [ ] Community Impact dashboard
- [ ] Campaign builder

---

## Type System

### Advertiser as Umbrella Type

The `Advertiser` type will evolve to support multiple source types via a discriminated union:

```typescript
type AdvertiserSource = 'government' | 'business' | 'nonprofit' | 'foundation';

interface AdvertiserBase {
  id: string;
  userId: string;
  source: AdvertiserSource;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// Government: department-specific fields
interface GovernmentProfile extends AdvertiserBase {
  source: 'government';
  departmentName: string;
  departmentCode?: string;
  budgetCode?: string;
  fiscalYear?: string;
}

// Business: commercial fields
interface BusinessProfile extends AdvertiserBase {
  source: 'business';
  businessName: string;
  industry: string;
  businessSize: 'solo' | 'small' | 'medium' | 'large';
  address?: string;
  neighborhood?: string;
  goals: CampaignGoal[];
}

// Nonprofit: mission-driven fields
interface NonprofitProfile extends AdvertiserBase {
  source: 'nonprofit';
  orgName: string;
  mission: string;
  ein?: string;
  focusAreas: string[];
}

// Foundation: grant/philanthropy fields
interface FoundationProfile extends AdvertiserBase {
  source: 'foundation';
  foundationName: string;
  grantAreas: string[];
  annualBudget?: string;
}

type Advertiser = GovernmentProfile | BusinessProfile | NonprofitProfile | FoundationProfile;
```

### UserRole Update

```typescript
type UserRole = 'publisher' | 'government' | 'advertiser' | 'admin';
```

Government users get their own role (special pathway, different onboarding). Private advertisers share the `'advertiser'` role.

---

## Goal-Based Matching

Instead of manually configuring match weights, advertisers choose a campaign goal. Each goal auto-configures the matching algorithm weights.

### Campaign Goal Presets

| Goal | Geographic | Demographic | Economic | Cultural | Reach |
|------|-----------|-------------|----------|----------|-------|
| Reach nearby customers | 40 | 15 | 15 | 20 | 10 |
| Promote event | 35 | 15 | 10 | 15 | 25 |
| Build brand awareness | 15 | 15 | 15 | 15 | 40 |
| Reach specific community | 20 | 30 | 10 | 30 | 10 |
| Support local journalism | 10 | 10 | 10 | 10 | 10 |
| Launch product locally | 30 | 25 | 15 | 15 | 15 |
| Recruit local talent | 25 | 25 | 20 | 15 | 15 |
| Nonprofit program outreach | 25 | 20 | 25 | 20 | 10 |
| Foundation initiative | 15 | 15 | 20 | 35 | 15 |

### Implementation

File: `src/lib/campaigns/goal-presets.ts`

```typescript
interface CampaignGoalPreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  weights: MatchWeights;
  suggestedFormats: string[];
  applicableSources: AdvertiserSource[];
}
```

---

## Database Schema

### advertisers table (ALTER existing)

```sql
ALTER TABLE advertisers ADD COLUMN source TEXT DEFAULT 'government';
ALTER TABLE advertisers ADD COLUMN profile JSONB DEFAULT '{}';
-- source: 'government' | 'business' | 'nonprofit' | 'foundation'
-- profile: source-specific fields as JSONB
```

### campaign_goal_presets table

```sql
CREATE TABLE campaign_goal_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  weights JSONB NOT NULL,
  suggested_formats TEXT[],
  applicable_sources TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### community_impact_metrics table

```sql
CREATE TABLE community_impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  publisher_id UUID REFERENCES publishers(id),
  advertiser_id UUID REFERENCES advertisers(id),
  ad_spend_cents INTEGER NOT NULL,
  journalism_contribution_cents INTEGER,
  audience_reached INTEGER,
  engagement_count INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/advertise` | Landing page (built) |
| `/[city]/advertise` | City-scoped landing (built) |
| `/advertise/onboarding` | Business registration + goal selection |
| `/[city]/advertise/onboarding` | City-scoped onboarding |
| `/advertise/dashboard` | Campaign management + impact dashboard |
| `/[city]/advertise/dashboard` | City-scoped dashboard |
| `/advertise/campaigns/new` | Campaign builder with goal presets |
| `/advertise/campaigns/[id]` | Campaign detail + performance |

---

## Components (Future)

| Component | Location | Purpose |
|-----------|----------|---------|
| GoalSelector | `src/components/advertise/GoalSelector.tsx` | Visual goal picker with preset cards |
| CommunityImpactDashboard | `src/components/advertise/CommunityImpactDashboard.tsx` | Dual panel: marketing ROI + journalism impact |
| BusinessOnboardingForm | `src/components/advertise/BusinessOnboardingForm.tsx` | Multi-step registration |
| CampaignBuilder | `src/components/advertise/CampaignBuilder.tsx` | Goal → Publishers → Assets → Launch |

---

## Design Decisions

1. **Government as first-class portal** — Not "just another advertiser type." Government has its own route (`/government`), its own nav variant, its own onboarding, and procurement-specific workflows. This respects that government campaigns have unique requirements (vendor registration, PO numbers, department codes).

2. **"Advertise" as a verb** — The portal uses "Advertise" as an action rather than labeling users as "advertisers." This avoids the naming tension between advertising and support, letting the copy carry the dual value proposition.

3. **Goal-based matching** — Users choose friendly presets that configure algorithm weights behind the scenes. This makes the matching algorithm accessible without exposing its complexity.

4. **Publisher handles billing** (for now) — Payment flows directly between advertiser and publisher. Resonate facilitates the connection but doesn't process payments yet. Architecture supports future payment processing.

5. **Marigold color theme** — The third color in the existing palette, previously unused as a portal accent. Creates visual distinction from publisher (coral) and government (teal).

---

## Implementation Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1. Portal Architecture | Routes, nav, landing page, rename | Done |
| 2. Type System | Advertiser discriminated union, goal presets | Planned |
| 3. Database | Schema migrations, seed presets | Planned |
| 4. Onboarding | Business registration flow | Planned |
| 5. Matching | Goal-to-weights mapping, preset selector | Planned |
| 6. Dashboard | Campaign management + community impact | Planned |
| 7. Campaign Builder | Create campaigns with goal selection | Planned |
| 8. Polish | Copy, design, edge cases, testing | Planned |
