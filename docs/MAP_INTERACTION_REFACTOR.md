# Map Interaction Refactor Plan

## Overview

Unify the discover map interactions into a clear, consistent flow that shows the "magical overlap" between demographics and publisher territories.

## Current Problems

1. **Hover fires popup immediately** - Can't navigate without popup appearing
2. **Two competing info displays** - Popup AND ExpandableLegend show similar data
3. **Demographics OR territory** - Should show BOTH simultaneously
4. **Legend expands on hover** - Confusing; should be static

## Target Interaction Model

```
HOVER → Visual highlight only (no information)
CLICK → Mini popover (one key metric for current tab)
CLICK POPOVER → Supercard (full demographic profile)
DISMISS → Click X or outside
```

## Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAP AREA                                 │
│                                                                  │
│   LAYER 1: Demographic Choropleth (fill colors)                 │
│   LAYER 2: Publisher Territory Outlines (when publisher         │
│            is hovered/selected in right sidebar)                │
│   LAYER 3: Hover/Selection states (borders)                     │
│                                                                  │
│                    ┌──────────────────┐                         │
│                    │   SUPERCARD      │  ← Anchored to          │
│                    │   (on click)     │    neighborhood         │
│                    └──────────────────┘                         │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │  LEGEND (static)    │  ← Always visible                      │
│  │  ████████░░░░░░░░   │    Shows color scale only              │
│  │  0%    40%    80%   │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Static Color Scale Legend

### File: `src/components/map/ColorScaleLegend.tsx`

**Purpose:** Replace the expanding ExpandableLegend with a simple, static color scale.

**Props:**
```typescript
interface ColorScaleLegendProps {
  label: string;                    // "Spanish Speakers", "Eviction Rate", etc.
  scale: { value: number; color: string }[];
  unit: string;                     // "%", "/1k", etc.
  sourceLabel: string;              // "Census ACS 5-Year"
  sourceUrl: string;
}
```

**Behavior:**
- Always visible in bottom-left
- No expansion, no hover effects
- Just shows what the colors mean

---

## Phase 2: Neighborhood Mini Popover

### File: `src/components/map/NeighborhoodPopover.tsx`

**Purpose:** Small popover that appears on neighborhood click.

**Props:**
```typescript
interface NeighborhoodPopoverProps {
  neighborhood: SFNeighborhood;
  name: string;
  position: { longitude: number; latitude: number };
  activeDemoTab: 'languages' | 'communities' | 'income' | 'age' | 'housing';
  selectedDemographic: string | null;  // e.g., 'spanish', 'asian', 'extremelyLow'
  censusData: CensusData;
  evictionData?: { rate: number; total: number };
  onExpand: () => void;
  onDismiss: () => void;
}
```

**Content (varies by tab):**
| Tab | Display |
|-----|---------|
| Languages | "42% Spanish speakers" |
| Communities | "67% Asian population" |
| Income | "38% Extremely Low Income" |
| Age | "24% Seniors (65+)" |
| Housing | "127 evictions (12.4/1k)" |

**Visual:**
```
┌─────────────────────────┐
│  Mission District       │
│  ━━━━━━━━━━━━━━━━━━━━━  │
│  42% Spanish speakers   │
│  #3 of 45 neighborhoods │
│                         │
│  [View full profile →]  │
└─────────────────────────┘
```

---

## Phase 3: Neighborhood Supercard

### File: `src/components/map/NeighborhoodSupercard.tsx`

**Purpose:** Rich "trading card" with complete demographic profile.

**Props:**
```typescript
interface NeighborhoodSupercardProps {
  neighborhood: SFNeighborhood;
  name: string;
  position: { longitude: number; latitude: number };
  censusData: CensusData;
  evictionData?: NeighborhoodEvictionData;
  publishersInArea: Publisher[];
  onDismiss: () => void;
  onPublisherClick: (publisher: Publisher) => void;
}
```

**Layout:**
```
┌────────────────────────────────────────────┐
│  [X]                                       │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  MISSION DISTRICT                    ┃  │
│  ┃  Population: 58,543                  ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                            │
│  LANGUAGES                                 │
│  ▓▓▓▓▓▓▓░░░ 42.1% Spanish                 │
│  ▓▓▓░░░░░░░ 12.3% Chinese                 │
│  ▓░░░░░░░░░  4.2% Tagalog                 │
│                                            │
│  COMMUNITIES                               │
│  ▓▓▓▓▓░░░░░ 38.2% Hispanic/Latino         │
│  ▓▓▓░░░░░░░ 22.1% White                   │
│  ▓▓░░░░░░░░ 15.4% Asian                   │
│                                            │
│  INCOME (% of households)                  │
│  ▓▓▓▓░░░░░░ 28% Extremely Low (≤30% AMI)  │
│  ▓▓░░░░░░░░ 18% Very Low (31-50%)         │
│  ▓▓▓▓▓░░░░░ 32% Above Moderate (>120%)    │
│                                            │
│  AGE                                       │
│  ▓▓▓▓▓░░░░░ 24% 25-34                     │
│  ▓▓▓░░░░░░░ 18% 35-44                     │
│  ▓▓░░░░░░░░ 12% Seniors (65+)             │
│                                            │
│  HOUSING                                   │
│  68% Renters · $1,842 median rent         │
│  127 evictions (12.4/1k) — #3 of 45       │
│  Top cause: Non-payment (34%)              │
│                                            │
│  ─────────────────────────────────────     │
│  PUBLISHERS SERVING THIS AREA              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Mission  │ │ El       │ │ +1 more  │   │
│  │ Local    │ │ Tecolote │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└────────────────────────────────────────────┘
```

---

## Phase 4: Update SFNeighborhoodMap

### Changes:

1. **Remove** Mapbox `<Popup>` component entirely
2. **Remove** `onMouseEnter` → `setPopupInfo` logic
3. **Keep** `onMouseEnter` → `setHoveredNeighborhood` (for visual highlight)
4. **Modify** `onClick` → call `onNeighborhoodClick(id)` callback (let parent handle)
5. **Replace** `<ExpandableLegend>` with `<ColorScaleLegend>`
6. **Add** new callback props:
   ```typescript
   onNeighborhoodClick?: (neighborhood: SFNeighborhood, position: { lng: number; lat: number }) => void;
   ```

### New: Publisher Territory Outline Layer

Add a second GeoJSON source/layer for publisher territories:

```typescript
// When a publisher is hovered/selected, show their territory as outlines
const publisherTerritoryLayer: LayerProps = {
  id: 'publisher-territory',
  type: 'line',
  paint: {
    'line-color': publisherColor,  // From TERRITORY_COLORS
    'line-width': 3,
    'line-dasharray': [2, 1],  // Dashed for visual distinction
  },
  filter: ['in', ['get', 'id'], ['literal', publisherNeighborhoods]],
};
```

---

## Phase 5: Update PublisherDiscoveryMap

### New State:

```typescript
const [clickedNeighborhood, setClickedNeighborhood] = useState<{
  id: SFNeighborhood;
  position: { lng: number; lat: number };
} | null>(null);

const [popoverMode, setPopoverMode] = useState<'mini' | 'supercard' | null>(null);
```

### Handler:

```typescript
const handleNeighborhoodClick = (id: SFNeighborhood, position: { lng: number; lat: number }) => {
  if (clickedNeighborhood?.id === id) {
    // Clicking same neighborhood dismisses
    setClickedNeighborhood(null);
    setPopoverMode(null);
  } else {
    setClickedNeighborhood({ id, position });
    setPopoverMode('mini');
  }
};
```

### Render:

```tsx
{/* Map */}
<SFNeighborhoodMap
  // ... existing props
  onNeighborhoodClick={handleNeighborhoodClick}
  publisherTerritory={hoveredPublisher || selectedPublisher ? {
    neighborhoods: getPublisherNeighborhoods(hoveredPublisher || selectedPublisher),
    color: publisherColors[hoveredPublisher || selectedPublisher],
  } : undefined}
/>

{/* Popover (rendered as sibling, positioned absolutely) */}
{clickedNeighborhood && popoverMode === 'mini' && (
  <NeighborhoodPopover
    neighborhood={clickedNeighborhood.id}
    // ... other props
    onExpand={() => setPopoverMode('supercard')}
    onDismiss={() => {
      setClickedNeighborhood(null);
      setPopoverMode(null);
    }}
  />
)}

{clickedNeighborhood && popoverMode === 'supercard' && (
  <NeighborhoodSupercard
    neighborhood={clickedNeighborhood.id}
    // ... other props
    onDismiss={() => {
      setClickedNeighborhood(null);
      setPopoverMode(null);
    }}
  />
)}
```

---

## Phase 6: Styling Polish

- Supercard shadow and border radius
- Smooth transitions between mini → supercard
- Bar chart styling for demographics
- Publisher mini-cards at bottom
- Responsive sizing for different map heights

---

## Files to Create

1. `src/components/map/ColorScaleLegend.tsx`
2. `src/components/map/NeighborhoodPopover.tsx`
3. `src/components/map/NeighborhoodSupercard.tsx`

## Files to Modify

1. `src/components/map/SFNeighborhoodMap.tsx`
2. `src/components/advertiser/PublisherDiscoveryMap.tsx`

## Files to Delete (optional, after refactor)

1. `src/components/map/ExpandableLegend.tsx` (or keep for other uses)

---

## Testing Checklist

- [ ] Hover neighborhood → highlight only, no popup
- [ ] Click neighborhood → mini popover appears
- [ ] Click popover → supercard appears
- [ ] Click X or outside → dismisses
- [ ] Click different neighborhood → switches to new mini popover
- [ ] Hover publisher → territory outline appears on map
- [ ] Click publisher → territory persists, card expands
- [ ] Demographic tab change → choropleth updates, popover updates metric
- [ ] Legend always shows correct color scale
- [ ] Both choropleth AND territory visible simultaneously
