'use client';

/**
 * SFNeighborhoodMap - Interactive San Francisco neighborhood map
 *
 * Displays SF neighborhoods with choropleth coloring based on demographic data.
 * Supports simultaneous display of demographics AND publisher territories.
 *
 * Interaction model:
 * - Hover: Visual highlight only (no popup)
 * - Click: Calls parent callback with neighborhood + position
 * - Parent handles popover/supercard display
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, type MapRef, type LayerProps } from 'react-map-gl/mapbox';
import type { MapMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import type { SFNeighborhood } from '@/types';
import { getSFNeighborhoodsGeoJSON } from '@/lib/geo/sf-neighborhoods.geojson';
import { getSFCensusData } from '@/lib/census/sf-census-data';
import { SF_NEIGHBORHOODS } from '@/lib/geo/sf-geography';
import { ColorScaleLegend, LEGEND_PRESETS } from './ColorScaleLegend';
import type { TimeRange } from '@/lib/datasf/types';

import 'mapbox-gl/dist/mapbox-gl.css';

type MapLayerMouseEvent = MapMouseEvent & { features?: MapboxGeoJSONFeature[] };

// =============================================================================
// CONSTANTS
// =============================================================================

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamdhcm5pZXIiLCJhIjoiY21qem1kbnJuMDE0cjNlcHZ6em1tZGNneCJ9.rkWafIhT1k4RHXVRJWoEBw';

const SF_CENTER = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 11.5,
};

// Language-specific color scales
const LANGUAGE_COLOR_SCALES: Record<string, [number, string][]> = {
  chinese: [
    [0, '#fff5eb'], [10, '#fee6ce'], [25, '#fdd0a2'], [40, '#fdae6b'],
    [55, '#fd8d3c'], [70, '#f16913'], [85, '#8c2d04'],
  ],
  spanish: [
    [0, '#fff5eb'], [5, '#fee6ce'], [12, '#fdd0a2'], [20, '#fdae6b'],
    [30, '#fd8d3c'], [40, '#f16913'], [50, '#8c2d04'],
  ],
  tagalog: [
    [0, '#fff5eb'], [2, '#fee6ce'], [4, '#fdd0a2'], [7, '#fdae6b'],
    [10, '#fd8d3c'], [13, '#f16913'], [18, '#8c2d04'],
  ],
  vietnamese: [
    [0, '#fff5eb'], [0.5, '#fee6ce'], [1, '#fdd0a2'], [2, '#fdae6b'],
    [3, '#fd8d3c'], [4, '#f16913'], [6, '#8c2d04'],
  ],
  korean: [
    [0, '#fff5eb'], [0.3, '#fee6ce'], [0.6, '#fdd0a2'], [1, '#fdae6b'],
    [1.5, '#fd8d3c'], [2, '#f16913'], [3, '#8c2d04'],
  ],
  russian: [
    [0, '#fff5eb'], [0.3, '#fee6ce'], [0.6, '#fdd0a2'], [1, '#fdae6b'],
    [1.5, '#fd8d3c'], [2, '#f16913'], [3, '#8c2d04'],
  ],
};

// Ethnicity color scales
const ETHNICITY_COLOR_SCALES: Record<string, [number, string][]> = {
  white: [[0, '#f5f0ff'], [15, '#e0d4f7'], [30, '#c4b5eb'], [45, '#a896de'], [60, '#8b76d1'], [75, '#6b46c1']],
  asian: [[0, '#f5f0ff'], [15, '#e0d4f7'], [30, '#c4b5eb'], [50, '#a896de'], [70, '#8b76d1'], [90, '#6b46c1']],
  hispanic: [[0, '#f5f0ff'], [10, '#e0d4f7'], [20, '#c4b5eb'], [30, '#a896de'], [40, '#8b76d1'], [55, '#6b46c1']],
  black: [[0, '#f5f0ff'], [5, '#e0d4f7'], [10, '#c4b5eb'], [18, '#a896de'], [25, '#8b76d1'], [35, '#6b46c1']],
  pacific: [[0, '#f5f0ff'], [0.5, '#e0d4f7'], [1, '#c4b5eb'], [1.5, '#a896de'], [2.5, '#8b76d1'], [4, '#6b46c1']],
  multiracial: [[0, '#f5f0ff'], [1, '#e0d4f7'], [2, '#c4b5eb'], [3, '#a896de'], [4, '#8b76d1'], [6, '#6b46c1']],
};

// Age color scales
const AGE_COLOR_SCALES: Record<string, [number, string][]> = {
  under18: [[0, '#f0fdfa'], [5, '#ccfbf1'], [10, '#99f6e4'], [15, '#5eead4'], [20, '#2dd4bf'], [25, '#14b8a6']],
  '18-24': [[0, '#f0fdfa'], [3, '#ccfbf1'], [5, '#99f6e4'], [8, '#5eead4'], [11, '#2dd4bf'], [15, '#14b8a6']],
  '25-34': [[0, '#f0fdfa'], [10, '#ccfbf1'], [15, '#99f6e4'], [20, '#5eead4'], [25, '#2dd4bf'], [32, '#14b8a6']],
  '35-44': [[0, '#f0fdfa'], [5, '#ccfbf1'], [10, '#99f6e4'], [15, '#5eead4'], [20, '#2dd4bf'], [25, '#14b8a6']],
  '45-54': [[0, '#f0fdfa'], [4, '#ccfbf1'], [7, '#99f6e4'], [10, '#5eead4'], [14, '#2dd4bf'], [18, '#14b8a6']],
  '55-64': [[0, '#f0fdfa'], [4, '#ccfbf1'], [7, '#99f6e4'], [10, '#5eead4'], [13, '#2dd4bf'], [16, '#14b8a6']],
  seniors: [[0, '#f0fdfa'], [5, '#ccfbf1'], [8, '#99f6e4'], [12, '#5eead4'], [16, '#2dd4bf'], [22, '#14b8a6']],
};

// Income bracket scales
const INCOME_BRACKET_SCALES: Record<string, [number, string][]> = {
  extremelyLow: [[0, '#f7fcf5'], [10, '#e5f5e0'], [20, '#c7e9c0'], [30, '#a1d99b'], [40, '#74c476'], [50, '#238b45']],
  veryLow: [[0, '#f7fcf5'], [5, '#e5f5e0'], [8, '#c7e9c0'], [12, '#a1d99b'], [16, '#74c476'], [22, '#238b45']],
  low: [[0, '#f7fcf5'], [5, '#e5f5e0'], [10, '#c7e9c0'], [15, '#a1d99b'], [18, '#74c476'], [25, '#238b45']],
  moderate: [[0, '#f7fcf5'], [8, '#e5f5e0'], [14, '#c7e9c0'], [20, '#a1d99b'], [25, '#74c476'], [32, '#238b45']],
  aboveModerate: [[0, '#f7fcf5'], [15, '#e5f5e0'], [30, '#c7e9c0'], [45, '#a1d99b'], [60, '#74c476'], [80, '#238b45']],
};

// Evictions scales — separate ramps for 30-day vs 12-month totals
const EVICTIONS_SCALE_12MO: [number, string][] = [
  [0, '#fef0d9'], [5, '#fdcc8a'], [10, '#fc8d59'], [15, '#e34a33'], [20, '#b30000'], [30, '#7a0000'],
];
const EVICTIONS_SCALE_30D: [number, string][] = [
  [0, '#fef0d9'], [0.5, '#fdcc8a'], [1, '#fc8d59'], [2, '#e34a33'], [3, '#b30000'], [5, '#7a0000'],
];

// 311 scales — blue civic tone, per 1k residents
const THREE11_SCALE_12MO: [number, string][] = [
  [0, '#eff6ff'], [50, '#93c5fd'], [100, '#3b82f6'], [200, '#1d4ed8'], [400, '#1e3a8a'], [800, '#172554'],
];
const THREE11_SCALE_30D: [number, string][] = [
  [0, '#eff6ff'], [5, '#93c5fd'], [10, '#3b82f6'], [20, '#1d4ed8'], [40, '#1e3a8a'], [80, '#172554'],
];

// Safety scales — amber→red caution tone, per 1k residents
const SAFETY_SCALE_12MO: [number, string][] = [
  [0, '#fefce8'], [20, '#fde047'], [50, '#f59e0b'], [100, '#dc2626'], [150, '#991b1b'], [250, '#450a0a'],
];
const SAFETY_SCALE_30D: [number, string][] = [
  [0, '#fefce8'], [2, '#fde047'], [5, '#f59e0b'], [10, '#dc2626'], [15, '#991b1b'], [25, '#450a0a'],
];

// =============================================================================
// TYPES
// =============================================================================

type LanguageKey = 'spanish' | 'chinese' | 'tagalog' | 'vietnamese' | 'korean' | 'russian';
type EthnicityKey = 'white' | 'asian' | 'hispanic' | 'black' | 'pacific' | 'multiracial';
type AgeKey = 'under18' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | 'seniors';
type IncomeKey = 'extremelyLow' | 'veryLow' | 'low' | 'moderate' | 'aboveModerate';

export interface PublisherTerritoryOverlay {
  neighborhoods: SFNeighborhood[];
  color: string;
  publisherName?: string;
}

export interface SFNeighborhoodMapProps {
  mode: 'publisher' | 'department';
  audienceDistribution?: { neighborhood: SFNeighborhood; percentage: number }[];
  publisherCoverage?: { neighborhood: SFNeighborhood; publisherCount: number; totalReach: number }[];
  evictionData?: { neighborhood: SFNeighborhood; rate: number }[];
  three11Data?: { neighborhood: SFNeighborhood; rate: number }[];
  safetyData?: { neighborhood: SFNeighborhood; rate: number }[];
  selectedNeighborhoods?: SFNeighborhood[];
  onNeighborhoodClick?: (neighborhood: SFNeighborhood, screenPosition: { x: number; y: number }) => void;
  onNeighborhoodHover?: (neighborhood: SFNeighborhood | null) => void;
  showLegend?: boolean;
  colorBy?: 'none' | 'audience' | 'income' | 'language' | 'coverage' | 'evictions' | 'ethnicity' | 'age' | '311' | 'safety';
  selectedLanguage?: LanguageKey | null;
  selectedEthnicity?: EthnicityKey | null;
  selectedAge?: AgeKey | null;
  selectedIncome?: IncomeKey | null;
  /** Publisher territory to overlay (shown as dashed outline) */
  publisherTerritory?: PublisherTerritoryOverlay | null;
  height?: string;
  initialViewState?: { longitude: number; latitude: number; zoom: number };
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SFNeighborhoodMap({
  mode,
  audienceDistribution,
  publisherCoverage,
  evictionData,
  three11Data,
  safetyData,
  selectedNeighborhoods = [],
  onNeighborhoodClick,
  onNeighborhoodHover,
  showLegend = true,
  colorBy = mode === 'publisher' ? 'audience' : 'coverage',
  selectedLanguage,
  selectedEthnicity,
  selectedAge,
  selectedIncome,
  publisherTerritory,
  height = '600px',
  initialViewState,
  timeRange = '12mo',
  onTimeRangeChange,
}: SFNeighborhoodMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<SFNeighborhood | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const censusData = useMemo(() => getSFCensusData(), []);

  // Build GeoJSON with data properties for styling
  const geojsonWithData = useMemo(() => {
    const baseGeoJSON = getSFNeighborhoodsGeoJSON();

    const features = baseGeoJSON.features.map((feature) => {
      const id = feature.properties.id as SFNeighborhood;
      const census = censusData[id];

      let dataValue = 0;

      if (colorBy === 'audience' && audienceDistribution) {
        const dist = audienceDistribution.find((d) => d.neighborhood === id);
        dataValue = dist?.percentage || 0;
      } else if (colorBy === 'coverage' && publisherCoverage) {
        const cov = publisherCoverage.find((d) => d.neighborhood === id);
        dataValue = cov?.publisherCount || 0;
      } else if (colorBy === 'income' && census) {
        if (selectedIncome && census.economic.amiDistribution[selectedIncome] !== undefined) {
          dataValue = census.economic.amiDistribution[selectedIncome];
        } else {
          dataValue = census.economic.medianHouseholdIncome;
        }
      } else if (colorBy === 'language' && census) {
        if (selectedLanguage && census.language.languagesSpoken[selectedLanguage] !== undefined) {
          dataValue = census.language.languagesSpoken[selectedLanguage];
        } else {
          dataValue = census.language.limitedEnglishProficiency;
        }
      } else if (colorBy === 'ethnicity' && census) {
        if (selectedEthnicity && census.ethnicity.distribution[selectedEthnicity] !== undefined) {
          dataValue = census.ethnicity.distribution[selectedEthnicity];
        }
      } else if (colorBy === 'age' && census) {
        if (selectedAge) {
          if (selectedAge === 'under18') dataValue = census.age.under18;
          else if (selectedAge === 'seniors') dataValue = census.age.seniors;
          else if (census.age.distribution[selectedAge] !== undefined) {
            dataValue = census.age.distribution[selectedAge];
          }
        }
      } else if (colorBy === 'evictions' && evictionData) {
        const eviction = evictionData.find((d) => d.neighborhood === id);
        dataValue = eviction?.rate || 0;
      } else if (colorBy === '311' && three11Data) {
        const entry = three11Data.find((d) => d.neighborhood === id);
        dataValue = entry?.rate || 0;
      } else if (colorBy === 'safety' && safetyData) {
        const entry = safetyData.find((d) => d.neighborhood === id);
        dataValue = entry?.rate || 0;
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          dataValue,
          isSelected: selectedNeighborhoods.includes(id),
          isHovered: hoveredNeighborhood === id,
        },
      };
    });

    return { type: 'FeatureCollection' as const, features } as GeoJSON.FeatureCollection;
  }, [audienceDistribution, publisherCoverage, evictionData, three11Data, safetyData, colorBy, selectedLanguage, selectedEthnicity, selectedAge, selectedIncome, selectedNeighborhoods, hoveredNeighborhood, censusData]);

  // Build color interpolation expression
  const fillColorExpression = useMemo(() => {
    if (colorBy === 'none') return '#f1f5f9';
    if (colorBy === 'language' && !selectedLanguage) return '#f1f5f9';
    if (colorBy === 'ethnicity' && !selectedEthnicity) return '#f1f5f9';
    if (colorBy === 'age' && !selectedAge) return '#f1f5f9';
    if (colorBy === 'income' && !selectedIncome) return '#f1f5f9';

    let scale: [number, string][] | undefined;

    if (colorBy === 'language' && selectedLanguage) scale = LANGUAGE_COLOR_SCALES[selectedLanguage];
    else if (colorBy === 'ethnicity' && selectedEthnicity) scale = ETHNICITY_COLOR_SCALES[selectedEthnicity];
    else if (colorBy === 'age' && selectedAge) scale = AGE_COLOR_SCALES[selectedAge];
    else if (colorBy === 'income' && selectedIncome) scale = INCOME_BRACKET_SCALES[selectedIncome];
    else if (colorBy === 'evictions') scale = timeRange === '30d' ? EVICTIONS_SCALE_30D : EVICTIONS_SCALE_12MO;
    else if (colorBy === '311') scale = timeRange === '30d' ? THREE11_SCALE_30D : THREE11_SCALE_12MO;
    else if (colorBy === 'safety') scale = timeRange === '30d' ? SAFETY_SCALE_30D : SAFETY_SCALE_12MO;

    if (!scale || scale.length < 2) return '#f1f5f9';

    const stops: (string | number)[] = [];
    for (const [value, color] of scale) {
      stops.push(value, color);
    }

    return ['interpolate', ['linear'], ['get', 'dataValue'], ...stops];
  }, [colorBy, selectedLanguage, selectedEthnicity, selectedAge, selectedIncome, timeRange]);

  // Layer styles
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const fillLayer: LayerProps = {
    id: 'neighborhoods-fill',
    type: 'fill',
    paint: {
      'fill-color': fillColorExpression as any,
      'fill-opacity': [
        'case',
        ['boolean', ['get', 'isHovered'], false], 0.9,
        ['boolean', ['get', 'isSelected'], false], 0.85,
        0.7,
      ] as any,
    },
  };

  const lineLayer: LayerProps = {
    id: 'neighborhoods-line',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['get', 'isSelected'], false], '#2563eb',
        ['boolean', ['get', 'isHovered'], false], '#1e40af',
        '#64748b',
      ] as any,
      'line-width': [
        'case',
        ['boolean', ['get', 'isSelected'], false], 2.5,
        ['boolean', ['get', 'isHovered'], false], 2,
        0.5,
      ] as any,
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Publisher territory GeoJSON (for outline layer)
  const territoryGeoJSON = useMemo(() => {
    if (!publisherTerritory || publisherTerritory.neighborhoods.length === 0) return null;

    const baseGeoJSON = getSFNeighborhoodsGeoJSON();
    const features = baseGeoJSON.features.filter(f =>
      publisherTerritory.neighborhoods.includes(f.properties.id as SFNeighborhood)
    );

    return { type: 'FeatureCollection' as const, features } as GeoJSON.FeatureCollection;
  }, [publisherTerritory]);

  // Handle hover - just visual highlight, no popup
  const onMouseEnter = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const id = e.features[0].properties?.id as SFNeighborhood;
      setHoveredNeighborhood(id);
      onNeighborhoodHover?.(id);
    }
  }, [onNeighborhoodHover]);

  const onMouseLeave = useCallback(() => {
    setHoveredNeighborhood(null);
    onNeighborhoodHover?.(null);
  }, [onNeighborhoodHover]);

  // Handle click - call parent with neighborhood and screen position
  const onClick = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0 && mapRef.current) {
      const id = e.features[0].properties?.id as SFNeighborhood;

      // Get screen position from the click event
      const screenPosition = { x: e.point.x, y: e.point.y };

      onNeighborhoodClick?.(id, screenPosition);
    }
  }, [onNeighborhoodClick]);

  // Build legend config based on current colorBy and selection
  const legendConfig = useMemo(() => {
    if (colorBy === 'none') return null;
    if (colorBy === 'language' && !selectedLanguage) return null;
    if (colorBy === 'ethnicity' && !selectedEthnicity) return null;
    if (colorBy === 'age' && !selectedAge) return null;
    if (colorBy === 'income' && !selectedIncome) return null;

    const langLabels: Record<string, string> = {
      spanish: 'Spanish Speakers', chinese: 'Chinese Speakers', tagalog: 'Tagalog Speakers',
      vietnamese: 'Vietnamese Speakers', korean: 'Korean Speakers', russian: 'Russian Speakers',
    };
    const ethLabels: Record<string, string> = {
      white: 'White Population', asian: 'Asian Population', hispanic: 'Hispanic/Latino Population',
      black: 'Black Population', pacific: 'Pacific Islander', multiracial: 'Multiracial Population',
    };
    const ageLabels: Record<string, string> = {
      under18: 'Under 18', '18-24': 'Age 18-24', '25-34': 'Age 25-34', '35-44': 'Age 35-44',
      '45-54': 'Age 45-54', '55-64': 'Age 55-64', seniors: 'Seniors (65+)',
    };
    const incLabels: Record<string, string> = {
      extremelyLow: 'Extremely Low Income (≤30% AMI)', veryLow: 'Very Low Income (31-50% AMI)',
      low: 'Low Income (51-80% AMI)', moderate: 'Moderate Income (81-120% AMI)',
      aboveModerate: 'Above Moderate (>120% AMI)',
    };

    const getScale = (arr: [number, string][]) =>
      arr.map(([value, color]) => ({ value, color }));

    if (colorBy === 'language' && selectedLanguage) {
      return {
        label: langLabels[selectedLanguage] || selectedLanguage,
        scale: getScale(LANGUAGE_COLOR_SCALES[selectedLanguage]),
        unit: '%',
        sourceLabel: 'Census ACS 5-Year',
        sourceUrl: 'https://data.census.gov/',
      };
    }
    if (colorBy === 'ethnicity' && selectedEthnicity) {
      return {
        label: ethLabels[selectedEthnicity] || selectedEthnicity,
        scale: getScale(ETHNICITY_COLOR_SCALES[selectedEthnicity]),
        unit: '%',
        sourceLabel: 'Census ACS 5-Year',
        sourceUrl: 'https://data.census.gov/',
      };
    }
    if (colorBy === 'age' && selectedAge) {
      return {
        label: ageLabels[selectedAge] || selectedAge,
        scale: getScale(AGE_COLOR_SCALES[selectedAge]),
        unit: '%',
        sourceLabel: 'Census ACS 5-Year',
        sourceUrl: 'https://data.census.gov/',
      };
    }
    if (colorBy === 'income' && selectedIncome) {
      return {
        label: incLabels[selectedIncome] || selectedIncome,
        scale: getScale(INCOME_BRACKET_SCALES[selectedIncome]),
        unit: '%',
        sourceLabel: 'Census ACS 5-Year',
        sourceUrl: 'https://data.census.gov/',
      };
    }
    if (colorBy === 'evictions') {
      const preset = timeRange === '30d' ? LEGEND_PRESETS.evictions_30d : LEGEND_PRESETS.evictions_12mo;
      return {
        ...preset,
        showTimeToggle: true,
      };
    }
    if (colorBy === '311') {
      const preset = timeRange === '30d' ? LEGEND_PRESETS.three11_30d : LEGEND_PRESETS.three11_12mo;
      return {
        ...preset,
        showTimeToggle: true,
      };
    }
    if (colorBy === 'safety') {
      const preset = timeRange === '30d' ? LEGEND_PRESETS.safety_30d : LEGEND_PRESETS.safety_12mo;
      return {
        ...preset,
        showTimeToggle: true,
      };
    }
    if (colorBy === 'coverage') {
      return LEGEND_PRESETS.coverage;
    }

    return null;
  }, [colorBy, selectedLanguage, selectedEthnicity, selectedAge, selectedIncome, timeRange]);

  return (
    <div className="relative rounded-xl" style={{ height, overflow: 'visible' }}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState || SF_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['neighborhoods-fill']}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={() => setMapLoaded(true)}
        cursor={hoveredNeighborhood ? 'pointer' : 'grab'}
      >
        <NavigationControl position="top-right" />

        {/* Main neighborhoods layer */}
        <Source id="neighborhoods" type="geojson" data={geojsonWithData} generateId>
          <Layer {...fillLayer} />
          <Layer {...lineLayer} />
        </Source>

        {/* Publisher territory outline layer */}
        {territoryGeoJSON && publisherTerritory && (
          <Source id="publisher-territory" type="geojson" data={territoryGeoJSON}>
            <Layer
              id="publisher-territory-line"
              type="line"
              paint={{
                'line-color': publisherTerritory.color,
                'line-width': 3,
                'line-dasharray': [3, 2],
              }}
            />
          </Source>
        )}
      </Map>

      {/* Static color scale legend */}
      {showLegend && legendConfig && (
        <ColorScaleLegend
          {...legendConfig}
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
          showTimeToggle={colorBy === 'evictions' || colorBy === '311' || colorBy === 'safety'}
        />
      )}

      {/* Publisher territory indicator */}
      {publisherTerritory && publisherTerritory.publisherName && (
        <div
          className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border"
          style={{ borderColor: publisherTerritory.color }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: publisherTerritory.color }}
            />
            <span className="text-sm font-medium text-slate-700">
              {publisherTerritory.publisherName}
            </span>
            <span className="text-xs text-slate-500">
              ({publisherTerritory.neighborhoods.length} neighborhoods)
            </span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-slate-500">Loading map...</div>
        </div>
      )}

      {/* Source attribution */}
      <div className="absolute bottom-1 left-1 z-10">
        <a
          href="https://data.sfgov.org/Geographic-Locations-and-Boundaries/Analysis-Neighborhoods/p5b7-5n3h"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline"
        >
          Neighborhoods: DataSF Analysis Neighborhoods
        </a>
      </div>
    </div>
  );
}

export default SFNeighborhoodMap;
