# Campaign Builder & Advertiser Flow - Sprint Plan

> **Status**: Planning document for future sprint
> **Created**: January 2026
> **Context**: Comprehensive analysis from code exploration agents

---

## Executive Summary

The advertiser/campaign side of Resonate has **excellent backend infrastructure** (5-dimension matching, census integration, demographic overlays) but needs **customer-facing surfaces** to close the loop.

---

## What Exists Today

### Matching Algorithm (`src/lib/matching/index.ts`)
- **5-dimension scoring** with configurable weights:
  - Geographic (25%): Neighborhood/district overlap
  - Demographic (20%): Language, age range alignment
  - Economic (20%): Income level, housing status, benefit programs
  - Cultural (25%): Ethnicity, community affiliations, identity factors
  - Reach (10%): Audience size + engagement quality

- **MatchResult output** includes:
  - `overallScore`: 0-100
  - `scores`: Breakdown by dimension
  - `matchDetails`: Specific matches (neighborhoods, languages, etc.)
  - `matchReasons`: Human-readable explanations
  - `confidenceLevel`: high/medium/low
  - `estimatedCost`: Range based on rate card
  - `estimatedReach`: Projected impressions/engagements

### Census Integration (`src/lib/census/`)
- **Data Flow**:
  ```
  Census Bureau API (api.census.gov)
      ↓
  census-api.ts: Fetch tract-level ACS 5-year data
      ↓
  tract-mapping.ts: Map 197 tracts to 45 SF neighborhoods (with weights)
      ↓
  census-aggregator.ts: Population-weighted aggregation
      ↓
  overlay-service.ts: Calculate publisher audience demographics
      ↓
  matching/index.ts: Score matches using inferred data
  ```

- **Variables Fetched**: Population, income (16 brackets), poverty, race/ethnicity (8 categories), language (14 specific), housing tenure, education, foreign-born status

### Discovery Map (`src/components/advertiser/PublisherDiscoveryMap.tsx`)
- 3-column layout: Neighborhoods | Map | Publisher cards
- 5 demographic filter tabs: Languages, Communities, Income, Age, Housing
- Choropleth visualization with single-select filters
- Publisher hover → territory overlay on map

### Onboarding Wizard (`src/app/advertiser/onboarding/page.tsx`)
- 3-step process (Department → Audience → Review)
- UI complete but NOT connected to database

---

## What's Missing (Build List)

### Priority 1: Database Schema
```sql
-- campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  advertiser_id UUID REFERENCES advertisers(id),
  name TEXT NOT NULL,
  status campaign_status DEFAULT 'draft',
  target_audience JSONB NOT NULL,
  priority_weights JSONB,
  start_date DATE,
  end_date DATE,
  total_budget INTEGER, -- cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- campaign_publishers junction (selections)
CREATE TABLE campaign_publishers (
  campaign_id UUID REFERENCES campaigns(id),
  publisher_id UUID REFERENCES publishers(id),
  match_score INTEGER,
  match_details JSONB,
  status selection_status DEFAULT 'pending',
  PRIMARY KEY (campaign_id, publisher_id)
);

-- campaign_orders (actual purchases)
CREATE TABLE campaign_orders (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  publisher_id UUID REFERENCES publishers(id),
  line_items JSONB NOT NULL,
  total INTEGER NOT NULL, -- cents
  status order_status DEFAULT 'pending',
  po_number TEXT,
  procurement_status procurement_status DEFAULT 'pending'
);
```

### Priority 2: Campaign Creation API
```typescript
// POST /api/campaigns
// - Create campaign draft
// - Store target audience criteria
// - Trigger matching algorithm
// - Return top matches

// GET /api/campaigns/[id]/matches
// - Fetch cached match results
// - Include full MatchResult data

// POST /api/campaigns/[id]/publishers
// - Add publisher to campaign cart
// - Calculate updated total

// POST /api/campaigns/[id]/submit
// - Finalize selections
// - Generate orders
// - Trigger notification to publishers
```

### Priority 3: Publisher Selection Cart
- Floating cart widget during discovery
- Shows: Selected publishers, total cost, total reach
- Actions: Remove, adjust quantities, "Build Campaign"
- Persists across sessions (localStorage + DB sync)

### Priority 4: Match Score Visualization
```
Mission Local: 87/100 Overall Match

Geographic (92/100) ████████████████████ Excellent
  ✓ Covers 4 of 4 target neighborhoods

Demographic (78/100) ███████████████░░░░░ Good
  ✓ Spanish + English match
  ⚠ Higher education than target

Economic (95/100) ███████████████████░ Excellent
  ✓ Income alignment: 85% low-moderate
  ✓ Reaches CalFresh recipients

Cultural (82/100) ████████████████░░░░ Very Good
  ✓ Strong Latino audience (64%)

Reach (75/100) ███████████████░░░░░ Good
  • 43,000 total reach
  • 4.2% engagement rate
```

### Priority 5: Budget Optimizer
- Input: Total budget + target criteria
- Output: Recommended publisher mix
- Algorithm: Knapsack optimization (match score as value, cost as weight)
- Shows: Reach projection, demographic coverage, cost efficiency

### Priority 6: Campaign Dashboard
- Active campaigns list with status
- Budget spent vs. remaining
- Deliverables pending review
- Aggregate performance metrics

---

## UI Enhancement Opportunities

### Match Explanation Modal
Triggered on click of any match score:
- Dimension breakdown with visual bars
- Specific matches listed (neighborhoods, languages, etc.)
- "Why This Match Works" natural language summary
- Data confidence indicator

### Publisher Comparison View
Select 2-4 publishers for side-by-side:
- Geographic coverage overlap/gaps
- Demographic strengths by dimension
- Cost per 1K reach comparison
- "Best For" recommendation

### Real-Time Availability
Publisher cards show:
- Current campaign load
- Response time history
- Next available slot
- Capacity warnings

### Census Drill-Down
Click neighborhood on map:
- Full demographic breakdown
- Income distribution chart
- Language pie chart
- Publishers serving that area with match scores

---

## Technical Architecture Notes

### Caching Strategy
- Census data: 24-hour cache (ACS updates annually)
- Match results: Cache per campaign, invalidate on criteria change
- Publisher metrics: 1-hour cache, real-time for dashboard

### Performance
- Set-based intersection for matching (~100 ops/publisher)
- Early exit for inactive/non-vendor publishers
- Pre-aggregated neighborhood census data (~2MB)

### Data Quality
- **Verified**: OAuth-connected platforms
- **Partially Verified**: Census overlay + self-reported
- **Self-Reported**: Publisher claims only
- Surface confidence level to advertisers

---

## Demo Impact Rankings

### Must Have (Credible Demo)
- [ ] Campaign cart with cost calculation
- [ ] Match score explanation with dimension breakdown
- [ ] Budget allocation visualization

### Should Have (Compelling Demo)
- [ ] Publisher side-by-side comparison
- [ ] Engagement forecasting
- [ ] Neighborhood match highlighting on map

### Nice to Have (Delightful Demo)
- [ ] AI-generated campaign suggestions
- [ ] Budget optimizer with strategy presets
- [ ] Procurement document preview

---

## Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/types/index.ts` | 966 | Domain models (Campaign, Order, MatchResult) |
| `src/lib/matching/index.ts` | 814 | 5-dimension matching algorithm |
| `src/components/advertiser/PublisherDiscoveryMap.tsx` | 1,196 | Discovery UI |
| `src/app/advertiser/onboarding/page.tsx` | 476 | Campaign wizard |
| `src/lib/census/overlay-service.ts` | 511 | Demographic inference |
| `src/lib/census/census-aggregator.ts` | 355 | Neighborhood aggregation |

---

## Next Sprint Recommendations

1. **Week 1**: Database schema + Campaign creation API
2. **Week 2**: Publisher selection cart + Match visualization
3. **Week 3**: Budget optimizer + Campaign dashboard
4. **Week 4**: Polish, testing, procurement integration stubs

---

*This document captures comprehensive analysis from code exploration. Ready for implementation when advertiser features become priority.*
