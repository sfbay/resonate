# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resonate is a civic marketplace platform connecting San Francisco city departments (advertisers) with community media publishers. The platform facilitates targeted, authentic local outreach by matching department campaigns with publishers who serve specific communities.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Tech Stack
- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4

### Path Alias
Use `@/*` to import from `./src/*` (configured in tsconfig.json).

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with fonts (DM Sans, Fraunces)
│   ├── publisher/          # Publisher-facing routes
│   │   └── onboarding/     # Multi-step publisher registration
│   └── advertiser/         # Department-facing routes
│       ├── discover/       # Publisher discovery map
│       └── onboarding/     # Campaign creation wizard
├── components/
│   ├── map/                # SFNeighborhoodMap, ExpandableLegend
│   ├── advertiser/         # PublisherDiscoveryMap
│   ├── publisher/          # AudienceDemographicsView
│   └── shared/             # Reusable UI components (Nav, Button, Footer, etc.)
├── lib/
│   ├── census/             # Census Bureau API integration
│   ├── datasf/             # DataSF API (evictions, etc.)
│   ├── geo/                # SF geography & GeoJSON boundaries
│   ├── matching/           # Core matching algorithm
│   └── integrations/       # External system integrations
└── types/                  # TypeScript type definitions
```

### Core Domain Models (src/types/index.ts)

- **Publisher**: Community media outlets with audience profiles, rate cards, and vendor status
- **Advertiser**: City departments creating campaigns
- **Campaign**: Outreach initiatives with target audiences and budgets
- **Order**: Procurement layer connecting campaigns to publishers
- **MatchResult**: Algorithm output with 5-dimension scoring breakdown

### Audience Profile Types

The platform uses comprehensive profile types for matching:

- **GeographicProfile**: SF neighborhoods (45 typed values), districts (1-11), zip codes, census tracts
- **DemographicProfile**: Age ranges, languages (19), education levels, family status
- **EconomicProfile**: AMI-based income levels, housing status, employment, benefit programs
- **CulturalProfile**: Ethnicities, immigration generation, community affiliations, identity factors

### Matching Algorithm (src/lib/matching/index.ts)

The `findMatchingPublishers()` function scores publishers using 5 weighted dimensions:
- Geographic overlap (default 25%) - neighborhood/district coverage
- Demographic match (default 20%) - languages, age ranges, education
- Economic alignment (default 20%) - income levels, housing status
- Cultural fit (default 20%) - ethnicity, community affiliations
- Reach/platform presence (default 15%) - audience size, platforms

Campaigns can specify custom priority weights to emphasize specific dimensions.

### City Systems Integration (src/lib/integrations/city-systems.ts)

Stub layer for future SF city system integrations:
- Vendor registration validation
- Purchase order generation
- Department code validation

Currently disabled (`enabled: false`), returns mock data for development.

### Design System

Custom CSS variables defined in globals.css:
- Primary colors: coral, teal, marigold
- Neutrals: charcoal, slate, cream, mist
- Fonts: DM Sans (body), Fraunces (headings)

Shared components in `src/components/shared/` follow the color theming:
- Publisher flows use coral accent
- Advertiser/department flows use teal accent

## Census Overlay System

The platform infers publisher audience demographics by overlaying geographic distribution with ACS census data.

### Key Files

- `src/lib/geo/sf-geography.ts` - SF neighborhood/district reference data with coordinates
- `src/lib/census/types.ts` - Census data structures, overlay results, publisher annotations
- `src/lib/census/sf-census-data.ts` - Census data access (sync sample + async live API)
- `src/lib/census/census-api.ts` - Census Bureau API client (ACS 5-year estimates)
- `src/lib/census/census-aggregator.ts` - Aggregates tract data to neighborhood level
- `src/lib/census/tract-mapping.ts` - Maps census tracts to SF neighborhoods
- `src/lib/census/use-census-data.ts` - React hook for components
- `src/lib/census/overlay-service.ts` - Demographic inference calculations

### Census Bureau API Integration

The platform fetches real ACS 5-year estimates from api.census.gov:

```typescript
// Async: Fetch live data from Census Bureau
const liveData = await fetchSFCensusData();

// Sync: Get sample data for SSR/fallback
const sampleData = getSFCensusData();

// React hook with automatic fetching
const { data, isLoading, isLive } = useCensusData();
```

Data pipeline:
1. Census API client fetches tract-level ACS data (population, income, race, language, housing)
2. Tract-to-neighborhood mapping assigns tracts to neighborhoods (with weights for split tracts)
3. Aggregator combines tract data using population-weighted averages
4. Result cached for 24 hours to minimize API calls

### How Overlay Works

1. Publisher provides geographic coverage (neighborhoods, zip codes, or citywide)
2. System weights each area by audience distribution
3. Census demographics are aggregated using population-weighted averages
4. Result includes inferred income, ethnicity, language, age, housing status

### Map Components (Mapbox GL)

Uses Mapbox GL JS via `react-map-gl` for interactive maps.

- `src/components/map/SFNeighborhoodMap.tsx` - Interactive SF map with choropleth layers
- `src/components/publisher/AudienceDemographicsView.tsx` - Publisher dashboard showing inferred demographics
- `src/components/advertiser/PublisherDiscoveryMap.tsx` - Department view for finding publishers by area
- `src/lib/geo/sf-neighborhoods.geojson.ts` - GeoJSON polygon boundaries for all 45 SF neighborhoods

**SFNeighborhoodMap Features:**
- Seven `colorBy` modes: `audience`, `income`, `language`, `coverage`, `evictions`, `ethnicity`, `age`
- Single-select demographic filters with per-category color scales:
  - Languages (orange): Spanish, Chinese, Tagalog, Vietnamese, Korean, Russian
  - Ethnicities (purple): White, Asian, Hispanic, Black, Pacific Islander, Multiracial
  - Ages (teal): Under 18, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
  - Income brackets (green): Extremely Low, Very Low, Low, Moderate, Above Moderate AMI
- Expandable legend that transforms into data card on neighborhood selection
- Hover popups with census data (population, income, renters, LEP rate)
- Click-to-pin neighborhood for detailed statistics
- Data-driven Mapbox styling expressions with calibrated color scales

## DataSF Integration

The platform integrates with San Francisco's open data portal for real-time civic data.

### Key Files

- `src/lib/datasf/client.ts` - Generic DataSF API client with caching
- `src/lib/datasf/types.ts` - TypeScript types for eviction records
- `src/lib/datasf/evictions.ts` - Eviction data fetching and aggregation
- `src/lib/datasf/zip-to-neighborhood.ts` - Maps SF zip codes to Analysis Neighborhoods

### Evictions Data

Fetches from DataSF Eviction Notices dataset (`5cei-gny5`):

```typescript
// Get eviction stats for last 12 months
const stats = await getEvictionStats({ timeRange: '12mo' });

// Returns city-wide statistics and per-neighborhood breakdown:
{
  totalEvictions: 1234,
  averageRate: 8.5,  // per 1,000 rental units
  rankings: [...],   // neighborhoods ranked by rate
  byNeighborhood: {
    mission: { total: 89, rate: 12.4, topCauses: [...] },
    tenderloin: { total: 156, rate: 18.2, topCauses: [...] },
  }
}
```

### Eviction Cause Types

The dataset includes 20 boolean cause flags:
- `non_payment` - Non-payment of rent
- `breach` - Lease violation
- `nuisance` - Nuisance behavior
- `owner_move_in` - Owner/relative move-in (Ellis Act related)
- `ellis_act_withdrawal` - Building withdrawal from rental market
- `demolition`, `capital_improvement`, `substantial_rehab`, etc.

### Publisher Annotations

Publishers can add community notes to supplement census data:
- `community_insight` - Knowledge about the community
- `demographic_correction` - What census doesn't capture
- `cultural_note` - Cultural context
- `audience_segment` - Distinct audience segments

## Development Status

### Completed
- [x] Core type system with comprehensive matching profiles (geographic, demographic, economic, cultural)
- [x] 5-dimension matching algorithm with configurable weights
- [x] Census overlay system for demographic inference
- [x] SF neighborhood GeoJSON boundaries (41 neighborhoods)
- [x] Mapbox GL integration with choropleth visualization
- [x] Publisher demographics dashboard with annotations
- [x] Department publisher discovery map with 3-column layout
- [x] City systems integration stubs
- [x] Real ACS census data integration via Census Bureau API
- [x] DataSF eviction data integration with time-range filtering (30d/12mo)
- [x] Expandable legend with neighborhood detail cards
- [x] Single-select demographic filters (languages, ethnicities, ages, income brackets)
- [x] Per-category calibrated color scales for meaningful differentiation

### Pending
- [ ] Publisher onboarding flow completion
- [ ] Department campaign creation wizard
- [ ] Order/procurement workflow
- [ ] Platform OAuth connections for audience data
- [ ] City vendor system API integration
- [ ] Additional DataSF datasets (traffic crashes, fire/EMS dispatch)
