# Resonate

A civic marketplace platform connecting San Francisco city departments with community media publishers for targeted, authentic local outreach.

## Overview

Resonate helps SF city departments reach specific communities by matching their campaigns with local publishers who serve those audiences. The platform uses census data overlays and demographic inference to provide insight into publisher reach.

### Key Features

- **Publisher Discovery Map** - Interactive choropleth map with demographic filters
- **5-Dimension Matching** - Algorithm scoring geographic, demographic, economic, cultural fit, and reach
- **Census Data Overlay** - Real ACS 5-year estimates for demographic inference
- **DataSF Integration** - Live eviction data with neighborhood-level aggregation
- **Single-Select Demographics** - Filter by language, ethnicity, age, or income bracket

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) to view the app.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Maps**: Mapbox GL JS via react-map-gl
- **Data**: Census Bureau API, DataSF API
- **Language**: TypeScript (strict mode)

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── advertiser/         # Department-facing routes
│   └── publisher/          # Publisher-facing routes
├── components/
│   ├── map/                # SFNeighborhoodMap, ExpandableLegend
│   ├── advertiser/         # PublisherDiscoveryMap
│   └── publisher/          # AudienceDemographicsView
├── lib/
│   ├── census/             # Census Bureau API integration
│   ├── datasf/             # DataSF API (evictions, etc.)
│   ├── geo/                # SF geography & GeoJSON
│   └── matching/           # Publisher matching algorithm
└── types/                  # TypeScript definitions
```

## Data Sources

| Source | Data | Usage |
|--------|------|-------|
| Census Bureau ACS | Demographics, income, language, housing | Audience inference |
| DataSF | Eviction notices, housing data | Housing tab visualization |
| SF Analysis Neighborhoods | 41 neighborhood boundaries | Geographic filtering |

## Environment Variables

```bash
# Optional: DataSF app token for higher rate limits
DATASF_APP_TOKEN=your_token_here
```

## Scripts

```bash
npm run dev       # Development server (port 3002)
npm run build     # Production build
npm run lint      # ESLint
npm run start     # Production server
```

## License

Private - All rights reserved.
