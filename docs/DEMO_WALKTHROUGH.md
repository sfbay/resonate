# Resonate Demo Walkthrough

**Last updated:** 2026-03-07
**Production URL:** https://resonatelocal.org

This document describes the three portal demo journeys available on the Resonate platform. Use these pathways when presenting to stakeholders, potential partners, or during investor meetings.

---

## Entry Point

**Start at:** https://resonatelocal.org

The geographic selector shows an interactive US map. Click **San Francisco** (or type "San Francisco" in the search). This takes you to the city landing page at `/sf`.

The city landing page introduces all three portals with "Get Started" CTAs.

---

## Journey 1: Government Portal (Teal)

**URL:** https://resonatelocal.org/sf/government

**Audience:** City department communications staff who need to reach specific communities.

### Step-by-step:

1. **Landing page** — Value proposition: "Reach every community in San Francisco." Shows department logos, stat blocks (17 publishers, $97K+ invested, 98% delivery rate).

2. **Discover Publishers** (nav: "Discover")
   - URL: `/sf/government/discover`
   - Interactive 3-column layout: neighborhoods list | Mapbox map | publisher cards
   - 8 filter tabs: Demographics, Languages, Communities, Income, Age, Housing, Community Needs, Public Safety
   - Click a publisher card to **add to cart** (teal checkmark + "Selected" badge)
   - Sticky top bar shows: "X publishers selected — Build Campaign →"
   - Can select multiple publishers before proceeding

3. **Build Campaign** (click "Build Campaign →" in cart bar)
   - URL: `/sf/government/onboarding?publishers=...`
   - 3-step wizard: Campaign Brief → Audience → Publishers
   - **Step 1:** Department, campaign name, description, contact, timeline, budget
   - **Step 2:** Geographic targeting (neighborhoods), languages, age groups, communities
   - **Step 3:** Matched publishers ranked by 5-dimension scoring algorithm
     - Pre-selected publishers from cart appear with "selected" state
     - Coverage map shows geographic overlap
     - Mix Coverage bars show geographic + language coverage percentages
     - Each publisher card shows match breakdown (Geographic, Demographic, Economic, Cultural, Reach)

4. **Campaign Management** (nav: "Campaigns")
   - URL: `/sf/government/campaigns`
   - Dashboard: Active campaigns count, total budget, spend to date
   - Campaign list with status badges (Matching, Active, Completed)
   - Search and filter by status

### Key talking points:
- Matching algorithm uses real Census Bureau ACS data for demographic inference
- Publishers are scored across 5 dimensions with configurable weights
- Cart pattern lets users build a publisher mix before committing to a campaign
- Department-specific procurement workflow (PO numbers, vendor registration)

---

## Journey 2: Publisher Portal (Coral)

**URL:** https://resonatelocal.org/sf/publisher

**Audience:** Community and ethnic media publishers who want to monetize their audience through campaign partnerships.

### Step-by-step:

1. **Landing page** — Value proposition: "Transform reach into revenue." Shows audience demographics widget, revenue stats.

2. **Analytics Dashboard** (nav: "Dashboard")
   - URL: `/sf/publisher/dashboard`
   - Total Reach, Engagement Rate, Momentum indicator, Connected Platforms
   - Audience Growth chart (30-day trend with Recharts)
   - Growth Periods: 7-day, 30-day, 90-day metrics
   - Platform Details: Instagram, Facebook, TikTok, etc. with verification badges
   - Audience Demographics: neighborhood breakdown, language distribution
   - Census overlay enrichment (inferred from geographic coverage)

3. **Order Inbox** (nav: "Orders")
   - URL: `/sf/publisher/dashboard/orders`
   - Campaign orders with status: In Progress, Delivered, Completed
   - Per-order details: department, deliverable amounts
   - Tabs: All Orders, Needs Response, Active, Completed

4. **Rate Card Builder** (nav: "Rate Card")
   - URL: `/sf/publisher/dashboard/rate-card`
   - Per-platform pricing (Instagram, Facebook, Newsletter, TikTok)
   - Deliverable types: Sponsored Post, Story, Reel, Carousel, Newsletter Placement
   - Revenue model: "You keep 100% — Resonate adds 15% service fee on top"

5. **Publisher Onboarding** (nav: "Get Started")
   - URL: `/sf/publisher/onboarding`
   - Multi-step registration flow

### Key talking points:
- Publishers keep 100% of their rates — Resonate adds a transparent service fee
- Analytics dashboard pulls real platform data via OAuth (Instagram, Facebook, TikTok, Mailchimp)
- Census overlay enriches audience profiles automatically based on geographic coverage
- Order inbox gives publishers a single place to manage campaign fulfillment

---

## Journey 3: Advertise Portal (Marigold)

**URL:** https://resonatelocal.org/sf/advertise

**Audience:** Businesses, nonprofits, and foundations who want to reach communities through local media.

### Step-by-step:

1. **Landing page** — Value proposition: "Advertising IS support." Dual-value framing: marketing ROI + community journalism investment.

2. **Campaign Dashboard** (nav: "Dashboard")
   - URL: `/sf/advertise/dashboard`
   - Campaign list with budget tracking
   - Community Impact metric: "invested in local journalism"
   - Empty state for new users with "Create your first campaign" CTA

### Key talking points:
- Third portal expanding beyond government to private sector
- Same matching algorithm, different onboarding (goal-based instead of department-based)
- Community Impact framing: every ad dollar supports local journalism
- Phase 2 features planned: business onboarding, goal presets, impact dashboard

---

## Cross-Portal Navigation

The top navigation bar adapts to each portal:
- **Publisher (coral):** Dashboard | Orders | Rate Card | Get Started
- **Government (teal):** Discover | Campaigns | Get Started
- **Advertise (marigold):** Dashboard | Get Started

The footer includes cross-portal links so users can explore all three portals.

All navigation is city-scoped — links stay within the `/sf/` prefix when browsing San Francisco.

---

## Technical Demo Notes

### Matching Algorithm
The 5-dimension scoring uses:
- **Geographic** (25%): Neighborhood overlap between campaign targets and publisher coverage
- **Demographic** (20%): Language, age range alignment
- **Economic** (20%): Income level, housing status match
- **Cultural** (20%): Ethnicity, community affiliation overlap
- **Reach** (15%): Audience size and platform presence

### Data Sources
- **Census Bureau ACS 5-year estimates**: Population, income, race, language, housing by census tract
- **DataSF Open Data**: Eviction notices, civic data
- **Platform APIs**: Instagram, Facebook, TikTok, Mailchimp (via OAuth)
- **Mapbox GL**: Interactive choropleth maps with GeoJSON boundaries

### Infrastructure
- **Frontend**: Next.js 16 on Render (auto-deploy from main branch)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Maps**: Mapbox GL JS with 45 SF neighborhood boundaries
- **AI**: Multi-provider (Claude, Gemini, OpenAI) for publisher recommendations
