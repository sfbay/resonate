'use client';

import { useState, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, type LayerProps } from 'react-map-gl/mapbox';
import type { MapMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import type { SFNeighborhood } from '@/types';
import { getSFNeighborhoodsGeoJSON } from '@/lib/geo/sf-neighborhoods.geojson';
import { getSFCensusData } from '@/lib/census/sf-census-data';
import { SF_NEIGHBORHOODS } from '@/lib/geo/sf-geography';
import { ExpandableLegend, LEGEND_CONFIGS, type LegendColorBy } from './ExpandableLegend';
import type { TimeRange, NeighborhoodEvictionData, CityEvictionStats } from '@/lib/datasf/types';

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

// Color scales for different data types
const COLOR_SCALES: Record<string, [number, string][]> = {
  none: [
    [0, '#f1f5f9'],  // neutral slate-100
  ],
  audience: [
    [0, '#f7fbff'],
    [10, '#deebf7'],
    [20, '#c6dbef'],
    [30, '#9ecae1'],
    [50, '#6baed6'],
    [70, '#4292c6'],
    [90, '#2171b5'],
    [100, '#084594'],
  ],
  income: [
    [0, '#f7fcf5'],
    [50000, '#e5f5e0'],
    [75000, '#c7e9c0'],
    [100000, '#a1d99b'],
    [125000, '#74c476'],
    [150000, '#41ab5d'],
    [200000, '#238b45'],
    [300000, '#005a32'],
  ],
  language: [
    [0, '#fff5eb'],
    [10, '#fee6ce'],
    [20, '#fdd0a2'],
    [30, '#fdae6b'],
    [40, '#fd8d3c'],
    [50, '#f16913'],
    [60, '#d94801'],
    [80, '#8c2d04'],
  ],
  coverage: [
    [0, '#f7fcfd'],
    [1, '#e5f5f9'],
    [2, '#ccece6'],
    [3, '#99d8c9'],
    [5, '#66c2a4'],
    [8, '#41ae76'],
    [12, '#238b45'],
    [20, '#005824'],
  ],
  evictions: [
    [0, '#fef0d9'],
    [5, '#fdcc8a'],
    [10, '#fc8d59'],
    [15, '#e34a33'],
    [20, '#b30000'],
    [30, '#7a0000'],
  ],
};

// Language-specific color scales (each language has different prevalence ranges)
const LANGUAGE_COLOR_SCALES: Record<string, [number, string][]> = {
  // Chinese: Peak ~85% in Chinatown
  chinese: [
    [0, '#fff5eb'],
    [10, '#fee6ce'],
    [25, '#fdd0a2'],
    [40, '#fdae6b'],
    [55, '#fd8d3c'],
    [70, '#f16913'],
    [85, '#8c2d04'],
  ],
  // Spanish: Peak ~45% in Mission
  spanish: [
    [0, '#fff5eb'],
    [5, '#fee6ce'],
    [12, '#fdd0a2'],
    [20, '#fdae6b'],
    [30, '#fd8d3c'],
    [40, '#f16913'],
    [50, '#8c2d04'],
  ],
  // Tagalog: Peak ~15% in Excelsior/SoMa areas
  tagalog: [
    [0, '#fff5eb'],
    [2, '#fee6ce'],
    [4, '#fdd0a2'],
    [7, '#fdae6b'],
    [10, '#fd8d3c'],
    [13, '#f16913'],
    [18, '#8c2d04'],
  ],
  // Vietnamese: Peak ~3-5%
  vietnamese: [
    [0, '#fff5eb'],
    [0.5, '#fee6ce'],
    [1, '#fdd0a2'],
    [2, '#fdae6b'],
    [3, '#fd8d3c'],
    [4, '#f16913'],
    [6, '#8c2d04'],
  ],
  // Korean: Peak ~2-3%
  korean: [
    [0, '#fff5eb'],
    [0.3, '#fee6ce'],
    [0.6, '#fdd0a2'],
    [1, '#fdae6b'],
    [1.5, '#fd8d3c'],
    [2, '#f16913'],
    [3, '#8c2d04'],
  ],
  // Russian: Peak ~2-3% (Richmond area)
  russian: [
    [0, '#fff5eb'],
    [0.3, '#fee6ce'],
    [0.6, '#fdd0a2'],
    [1, '#fdae6b'],
    [1.5, '#fd8d3c'],
    [2, '#f16913'],
    [3, '#8c2d04'],
  ],
};

// Ethnicity-specific color scales (purple/violet tones for communities)
const ETHNICITY_COLOR_SCALES: Record<string, [number, string][]> = {
  // White: 5% - 75%
  white: [
    [0, '#f5f0ff'],
    [15, '#e0d4f7'],
    [30, '#c4b5eb'],
    [45, '#a896de'],
    [60, '#8b76d1'],
    [75, '#6b46c1'],
  ],
  // Asian: 12% - 88%
  asian: [
    [0, '#f5f0ff'],
    [15, '#e0d4f7'],
    [30, '#c4b5eb'],
    [50, '#a896de'],
    [70, '#8b76d1'],
    [90, '#6b46c1'],
  ],
  // Hispanic: 3% - 50%
  hispanic: [
    [0, '#f5f0ff'],
    [10, '#e0d4f7'],
    [20, '#c4b5eb'],
    [30, '#a896de'],
    [40, '#8b76d1'],
    [55, '#6b46c1'],
  ],
  // Black: 1% - 32%
  black: [
    [0, '#f5f0ff'],
    [5, '#e0d4f7'],
    [10, '#c4b5eb'],
    [18, '#a896de'],
    [25, '#8b76d1'],
    [35, '#6b46c1'],
  ],
  // Pacific Islander: 0.2% - 3%
  pacificIslander: [
    [0, '#f5f0ff'],
    [0.5, '#e0d4f7'],
    [1, '#c4b5eb'],
    [1.5, '#a896de'],
    [2.5, '#8b76d1'],
    [4, '#6b46c1'],
  ],
  // Multiracial: 2% - 5%
  multiracial: [
    [0, '#f5f0ff'],
    [1, '#e0d4f7'],
    [2, '#c4b5eb'],
    [3, '#a896de'],
    [4, '#8b76d1'],
    [6, '#6b46c1'],
  ],
};

// Age-specific color scales (teal/cyan tones for age)
const AGE_COLOR_SCALES: Record<string, [number, string][]> = {
  // Under 18: ~12-20%
  under18: [
    [0, '#f0fdfa'],
    [5, '#ccfbf1'],
    [10, '#99f6e4'],
    [15, '#5eead4'],
    [20, '#2dd4bf'],
    [25, '#14b8a6'],
  ],
  // 18-24: ~8-12%
  age18To24: [
    [0, '#f0fdfa'],
    [3, '#ccfbf1'],
    [5, '#99f6e4'],
    [8, '#5eead4'],
    [11, '#2dd4bf'],
    [15, '#14b8a6'],
  ],
  // 25-34: ~18-28%
  age25To34: [
    [0, '#f0fdfa'],
    [10, '#ccfbf1'],
    [15, '#99f6e4'],
    [20, '#5eead4'],
    [25, '#2dd4bf'],
    [32, '#14b8a6'],
  ],
  // 35-44: ~14-22%
  age35To44: [
    [0, '#f0fdfa'],
    [5, '#ccfbf1'],
    [10, '#99f6e4'],
    [15, '#5eead4'],
    [20, '#2dd4bf'],
    [25, '#14b8a6'],
  ],
  // 45-54: ~10-16%
  age45To54: [
    [0, '#f0fdfa'],
    [4, '#ccfbf1'],
    [7, '#99f6e4'],
    [10, '#5eead4'],
    [14, '#2dd4bf'],
    [18, '#14b8a6'],
  ],
  // 55-64: ~8-14%
  age55To64: [
    [0, '#f0fdfa'],
    [4, '#ccfbf1'],
    [7, '#99f6e4'],
    [10, '#5eead4'],
    [13, '#2dd4bf'],
    [16, '#14b8a6'],
  ],
  // Seniors (65+): ~8-20%
  seniors: [
    [0, '#f0fdfa'],
    [5, '#ccfbf1'],
    [8, '#99f6e4'],
    [12, '#5eead4'],
    [16, '#2dd4bf'],
    [22, '#14b8a6'],
  ],
};

// Income bracket color scales (green tones for income/money)
const INCOME_BRACKET_SCALES: Record<string, [number, string][]> = {
  // Extremely Low (≤30% AMI): 4% - 48%
  extremelyLow: [
    [0, '#f7fcf5'],
    [10, '#e5f5e0'],
    [20, '#c7e9c0'],
    [30, '#a1d99b'],
    [40, '#74c476'],
    [50, '#238b45'],
  ],
  // Very Low (31-50% AMI): 3% - 20%
  veryLow: [
    [0, '#f7fcf5'],
    [5, '#e5f5e0'],
    [8, '#c7e9c0'],
    [12, '#a1d99b'],
    [16, '#74c476'],
    [22, '#238b45'],
  ],
  // Low (51-80% AMI): 5% - 22%
  low: [
    [0, '#f7fcf5'],
    [5, '#e5f5e0'],
    [10, '#c7e9c0'],
    [15, '#a1d99b'],
    [18, '#74c476'],
    [25, '#238b45'],
  ],
  // Moderate (81-120% AMI): 10% - 28%
  moderate: [
    [0, '#f7fcf5'],
    [8, '#e5f5e0'],
    [14, '#c7e9c0'],
    [20, '#a1d99b'],
    [25, '#74c476'],
    [32, '#238b45'],
  ],
  // Above Moderate (>120% AMI): 10% - 78%
  aboveModerate: [
    [0, '#f7fcf5'],
    [15, '#e5f5e0'],
    [30, '#c7e9c0'],
    [45, '#a1d99b'],
    [60, '#74c476'],
    [80, '#238b45'],
  ],
};

// Legend labels for each color scale
const COLOR_SCALE_LABELS: Record<string, { label: string; unit: string; lowLabel: string; highLabel: string }> = {
  none: { label: '', unit: '', lowLabel: '', highLabel: '' },
  audience: { label: 'Audience', unit: '%', lowLabel: '0%', highLabel: '100%' },
  income: { label: 'Income', unit: 'k', lowLabel: '$0', highLabel: '$300k+' },
  language: { label: 'Limited English', unit: '%', lowLabel: '0%', highLabel: '80%+' },
  coverage: { label: 'Publishers', unit: '', lowLabel: '0', highLabel: '20+' },
  evictions: { label: 'Evictions', unit: '/1k', lowLabel: '0', highLabel: '30+' },
};

// =============================================================================
// TYPES
// =============================================================================

// Specific keys that can be visualized
type LanguageKey = 'spanish' | 'chinese' | 'tagalog' | 'vietnamese' | 'korean' | 'russian';
type EthnicityKey = 'white' | 'asian' | 'hispanic' | 'black' | 'pacificIslander' | 'multiracial';
type AgeKey = 'under18' | 'age18To24' | 'age25To34' | 'age35To44' | 'age45To54' | 'age55To64' | 'seniors';
type IncomeKey = 'extremelyLow' | 'veryLow' | 'low' | 'moderate' | 'aboveModerate';

export interface SFNeighborhoodMapProps {
  mode: 'publisher' | 'department';
  audienceDistribution?: {
    neighborhood: SFNeighborhood;
    percentage: number;
  }[];
  publisherCoverage?: {
    neighborhood: SFNeighborhood;
    publisherCount: number;
    totalReach: number;
  }[];
  evictionData?: {
    neighborhood: SFNeighborhood;
    rate: number;
  }[];
  evictionStats?: CityEvictionStats;
  selectedNeighborhoods?: SFNeighborhood[];
  onNeighborhoodSelect?: (neighborhoods: SFNeighborhood[]) => void;
  onNeighborhoodClick?: (neighborhood: SFNeighborhood) => void;
  onNeighborhoodHover?: (neighborhood: SFNeighborhood | null) => void;
  showLegend?: boolean;
  showDistrictBoundaries?: boolean;
  colorBy?: 'none' | 'audience' | 'income' | 'language' | 'coverage' | 'evictions' | 'ethnicity' | 'age';
  // When colorBy='language', specify which language to show
  selectedLanguage?: LanguageKey | null;
  // When colorBy='ethnicity', specify which ethnicity to show
  selectedEthnicity?: EthnicityKey | null;
  // When colorBy='age', specify which age group to show
  selectedAge?: AgeKey | null;
  // When colorBy='income', specify which income bracket to show (or null for median income)
  selectedIncome?: IncomeKey | null;
  height?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  // Time range for evictions data
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

interface PopupInfo {
  neighborhood: SFNeighborhood;
  name: string;
  longitude: number;
  latitude: number;
  primaryValue?: number;
  primaryLabel?: string;
  secondaryValues?: { label: string; value: string }[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SFNeighborhoodMap({
  mode,
  audienceDistribution,
  publisherCoverage,
  evictionData,
  evictionStats,
  selectedNeighborhoods = [],
  onNeighborhoodSelect,
  onNeighborhoodClick,
  onNeighborhoodHover,
  showLegend = true,
  showDistrictBoundaries = false,
  colorBy = mode === 'publisher' ? 'audience' : 'coverage',
  selectedLanguage,
  selectedEthnicity,
  selectedAge,
  selectedIncome,
  height = '600px',
  initialViewState,
  timeRange = '12mo',
  onTimeRangeChange,
}: SFNeighborhoodMapProps) {
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<SFNeighborhood | null>(null);
  const [clickedNeighborhood, setClickedNeighborhood] = useState<SFNeighborhood | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const censusData = useMemo(() => getSFCensusData(), []);

  // Build GeoJSON with data properties for styling
  const geojsonWithData = useMemo(() => {
    const baseGeoJSON = getSFNeighborhoodsGeoJSON();

    // Add data properties to each feature
    const features = baseGeoJSON.features.map((feature) => {
      const id = feature.properties.id;
      const census = censusData[id];

      let dataValue = 0;

      if (colorBy === 'audience' && audienceDistribution) {
        const dist = audienceDistribution.find((d) => d.neighborhood === id);
        dataValue = dist?.percentage || 0;
      } else if (colorBy === 'coverage' && publisherCoverage) {
        const cov = publisherCoverage.find((d) => d.neighborhood === id);
        dataValue = cov?.publisherCount || 0;
      } else if (colorBy === 'income' && census) {
        // If a specific income bracket is selected, use that bracket's percentage
        // Otherwise fall back to median household income
        if (selectedIncome && census.economic.amiDistribution[selectedIncome] !== undefined) {
          dataValue = census.economic.amiDistribution[selectedIncome];
        } else {
          dataValue = census.economic.medianHouseholdIncome;
        }
      } else if (colorBy === 'language' && census) {
        // If a specific language is selected, use that language's percentage
        // Otherwise fall back to overall LEP rate
        if (selectedLanguage && census.language.languagesSpoken[selectedLanguage] !== undefined) {
          dataValue = census.language.languagesSpoken[selectedLanguage];
        } else {
          dataValue = census.language.limitedEnglishProficiency;
        }
      } else if (colorBy === 'ethnicity' && census) {
        // If a specific ethnicity is selected, use that ethnicity's percentage
        if (selectedEthnicity && census.ethnicity.distribution[selectedEthnicity] !== undefined) {
          dataValue = census.ethnicity.distribution[selectedEthnicity];
        }
      } else if (colorBy === 'age' && census) {
        // If a specific age group is selected, use that age group's percentage
        if (selectedAge) {
          if (selectedAge === 'under18') {
            dataValue = census.age.under18;
          } else if (selectedAge === 'seniors') {
            dataValue = census.age.seniors;
          } else if (census.age.distribution[selectedAge] !== undefined) {
            dataValue = census.age.distribution[selectedAge];
          }
        }
      } else if (colorBy === 'evictions' && evictionData) {
        const eviction = evictionData.find((d) => d.neighborhood === id);
        dataValue = eviction?.rate || 0;
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          dataValue,
          isSelected: selectedNeighborhoods.includes(id) || clickedNeighborhood === id,
          isHovered: hoveredNeighborhood === id,
        },
      };
    });

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [audienceDistribution, publisherCoverage, evictionData, colorBy, selectedLanguage, selectedEthnicity, selectedAge, selectedIncome, selectedNeighborhoods, hoveredNeighborhood, clickedNeighborhood, censusData]);

  // Build color interpolation expression for Mapbox
  const fillColorExpression = useMemo(() => {
    // For 'none' mode, return a solid neutral color
    if (colorBy === 'none') {
      return '#f1f5f9'; // slate-100
    }

    // For 'language' mode without a selected language, show neutral
    if (colorBy === 'language' && !selectedLanguage) {
      return '#f1f5f9'; // slate-100
    }

    // For 'ethnicity' mode without a selected ethnicity, show neutral
    if (colorBy === 'ethnicity' && !selectedEthnicity) {
      return '#f1f5f9'; // slate-100
    }

    // For 'age' mode without a selected age group, show neutral
    if (colorBy === 'age' && !selectedAge) {
      return '#f1f5f9'; // slate-100
    }

    // For 'income' mode without a selected income bracket, show neutral
    if (colorBy === 'income' && !selectedIncome) {
      return '#f1f5f9'; // slate-100
    }

    // Use specific scales based on colorBy and selection
    let scale: [number, string][] | undefined;

    if (colorBy === 'language' && selectedLanguage && LANGUAGE_COLOR_SCALES[selectedLanguage]) {
      scale = LANGUAGE_COLOR_SCALES[selectedLanguage];
    } else if (colorBy === 'ethnicity' && selectedEthnicity && ETHNICITY_COLOR_SCALES[selectedEthnicity]) {
      scale = ETHNICITY_COLOR_SCALES[selectedEthnicity];
    } else if (colorBy === 'age' && selectedAge && AGE_COLOR_SCALES[selectedAge]) {
      scale = AGE_COLOR_SCALES[selectedAge];
    } else if (colorBy === 'income' && selectedIncome && INCOME_BRACKET_SCALES[selectedIncome]) {
      scale = INCOME_BRACKET_SCALES[selectedIncome];
    } else {
      scale = COLOR_SCALES[colorBy];
    }

    if (!scale || scale.length < 2) {
      return '#f1f5f9'; // fallback
    }

    const stops: (string | number)[] = [];
    for (const [value, color] of scale) {
      stops.push(value, color);
    }

    return [
      'interpolate',
      ['linear'],
      ['get', 'dataValue'],
      ...stops,
    ];
  }, [colorBy, selectedLanguage, selectedEthnicity, selectedAge, selectedIncome]);

  // Layer styles - using 'as any' for Mapbox expressions that are valid but hard to type
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

  // Handle mouse events
  const onMouseEnter = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const id = feature.properties?.id as SFNeighborhood;
      const name = feature.properties?.name as string;
      const dataValue = feature.properties?.dataValue as number;

      setHoveredNeighborhood(id);
      onNeighborhoodHover?.(id);

      // Get center for popup
      const info = SF_NEIGHBORHOODS[id];
      const census = censusData[id];

      // For evictions mode, skip secondary census values - legend shows details
      const secondaryValues: { label: string; value: string }[] = [];
      if (census && colorBy !== 'evictions') {
        secondaryValues.push({ label: 'Population', value: census.population.total.toLocaleString() });
        secondaryValues.push({ label: 'Median Income', value: `$${(census.economic.medianHouseholdIncome / 1000).toFixed(0)}k` });
        secondaryValues.push({ label: 'Renters', value: `${census.housing.renterOccupied}%` });
        secondaryValues.push({ label: 'LEP Rate', value: `${census.language.limitedEnglishProficiency}%` });
      }

      setPopupInfo({
        neighborhood: id,
        name,
        longitude: info.center.lng,
        latitude: info.center.lat,
        primaryValue: dataValue,
        primaryLabel: colorBy === 'audience' ? 'Audience %' :
          colorBy === 'coverage' ? 'Publishers' :
            colorBy === 'income' ? 'Median Income' :
              colorBy === 'evictions' ? 'per 1k units' : 'LEP Rate',
        secondaryValues,
      });
    }
  }, [colorBy, censusData, onNeighborhoodHover]);

  const onMouseLeave = useCallback(() => {
    setHoveredNeighborhood(null);
    setPopupInfo(null);
    onNeighborhoodHover?.(null);
  }, [onNeighborhoodHover]);

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const id = e.features[0].properties?.id as SFNeighborhood;

      // Toggle clicked neighborhood for legend expansion
      setClickedNeighborhood(prev => prev === id ? null : id);

      onNeighborhoodClick?.(id);

      if (onNeighborhoodSelect) {
        const newSelection = selectedNeighborhoods.includes(id)
          ? selectedNeighborhoods.filter((n) => n !== id)
          : [...selectedNeighborhoods, id];
        onNeighborhoodSelect(newSelection);
      }
    }
  }, [selectedNeighborhoods, onNeighborhoodClick, onNeighborhoodSelect]);

  return (
    <div className="relative rounded-xl" style={{ height, overflow: 'visible' }}>
      <Map
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

        <Source id="neighborhoods" type="geojson" data={geojsonWithData} generateId>
          <Layer {...fillLayer} />
          <Layer {...lineLayer} />
        </Source>

        {/* Popup - hidden for evictions mode (legend shows details instead) */}
        {popupInfo && colorBy !== 'evictions' && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor={popupInfo.latitude > 37.78 ? 'top' : 'bottom'}
            closeButton={false}
            closeOnClick={false}
            offset={15}
            style={{ zIndex: 100 }}
          >
            <div className="p-2 min-w-36">
              <h3 className="font-semibold text-slate-900 mb-1">{popupInfo.name}</h3>

              {popupInfo.primaryValue !== undefined && (
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-lg font-bold text-slate-900">
                    {popupInfo.primaryLabel === 'Median Income'
                      ? `$${(popupInfo.primaryValue / 1000).toFixed(0)}k`
                      : popupInfo.primaryLabel === 'Audience %'
                        ? `${popupInfo.primaryValue.toFixed(1)}%`
                        : popupInfo.primaryLabel === 'LEP Rate'
                          ? `${popupInfo.primaryValue}%`
                          : popupInfo.primaryValue.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">{popupInfo.primaryLabel}</span>
                </div>
              )}

              {popupInfo.secondaryValues && popupInfo.secondaryValues.length > 0 && (
                <div className="space-y-1 border-t border-slate-100 pt-1.5 mt-1.5">
                  {popupInfo.secondaryValues.map((sv, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">{sv.label}</span>
                      <span className="text-slate-900 font-medium">{sv.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1.5 text-[11px] text-blue-600">Click for details</div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Expandable Legend */}
      {showLegend && colorBy !== 'none' &&
        !(colorBy === 'language' && !selectedLanguage) &&
        !(colorBy === 'ethnicity' && !selectedEthnicity) &&
        !(colorBy === 'age' && !selectedAge) &&
        !(colorBy === 'income' && !selectedIncome) && (() => {
        // Show hovered neighborhood OR pinned (clicked) neighborhood for all modes
        const activeNeighborhood = hoveredNeighborhood || clickedNeighborhood;

        // Get value functions for each data type
        const getLanguageValue = (data: typeof censusData[SFNeighborhood]) => {
          if (selectedLanguage && data.language.languagesSpoken[selectedLanguage] !== undefined) {
            return data.language.languagesSpoken[selectedLanguage];
          }
          return data.language.limitedEnglishProficiency;
        };

        const getEthnicityValue = (data: typeof censusData[SFNeighborhood]) => {
          if (selectedEthnicity && data.ethnicity.distribution[selectedEthnicity] !== undefined) {
            return data.ethnicity.distribution[selectedEthnicity];
          }
          return 0;
        };

        const getAgeValue = (data: typeof censusData[SFNeighborhood]) => {
          if (selectedAge) {
            if (selectedAge === 'under18') return data.age.under18;
            if (selectedAge === 'seniors') return data.age.seniors;
            if (data.age.distribution[selectedAge] !== undefined) {
              return data.age.distribution[selectedAge];
            }
          }
          return 0;
        };

        const getIncomeValue = (data: typeof censusData[SFNeighborhood]) => {
          if (selectedIncome && data.economic.amiDistribution[selectedIncome] !== undefined) {
            return data.economic.amiDistribution[selectedIncome];
          }
          return 0;
        };

        // Calculate city average and rankings based on colorBy
        const censusValues = Object.entries(censusData).map(([id, data]) => ({
          neighborhood: id as SFNeighborhood,
          value: colorBy === 'income'
            ? getIncomeValue(data)
            : colorBy === 'language'
              ? getLanguageValue(data)
              : colorBy === 'ethnicity'
                ? getEthnicityValue(data)
                : colorBy === 'age'
                  ? getAgeValue(data)
                  : 0,
        }));

        const cityAverage = colorBy === 'evictions' && evictionStats
          ? evictionStats.averageRate
          : censusValues.length > 0
            ? censusValues.reduce((sum, v) => sum + v.value, 0) / censusValues.length
            : undefined;

        // Sort for rankings (higher = higher rank for visibility)
        const sortedValues = colorBy === 'income'
          ? [...censusValues].sort((a, b) => b.value - a.value)
          : [...censusValues].sort((a, b) => b.value - a.value);

        const rank = colorBy === 'evictions' && activeNeighborhood && evictionStats
          ? evictionStats.rankings.find(r => r.neighborhood === activeNeighborhood)?.rank
          : activeNeighborhood
            ? sortedValues.findIndex(v => v.neighborhood === activeNeighborhood) + 1
            : undefined;

        const totalNeighborhoods = colorBy === 'evictions' && evictionStats
          ? evictionStats.rankings.length
          : sortedValues.length;

        // Labels for each data type
        const languageLabels: Record<LanguageKey, string> = {
          spanish: 'Spanish Speakers',
          chinese: 'Chinese Speakers',
          tagalog: 'Tagalog Speakers',
          vietnamese: 'Vietnamese Speakers',
          korean: 'Korean Speakers',
          russian: 'Russian Speakers',
        };

        const ethnicityLabels: Record<EthnicityKey, string> = {
          white: 'White Population',
          asian: 'Asian Population',
          hispanic: 'Hispanic/Latino Population',
          black: 'Black Population',
          pacificIslander: 'Pacific Islander Population',
          multiracial: 'Multiracial Population',
        };

        const ageLabels: Record<AgeKey, string> = {
          under18: 'Under 18',
          age18To24: 'Age 18-24',
          age25To34: 'Age 25-34',
          age35To44: 'Age 35-44',
          age45To54: 'Age 45-54',
          age55To64: 'Age 55-64',
          seniors: 'Seniors (65+)',
        };

        const incomeLabels: Record<IncomeKey, string> = {
          extremelyLow: 'Extremely Low Income (≤30% AMI)',
          veryLow: 'Very Low Income (31-50% AMI)',
          low: 'Low Income (51-80% AMI)',
          moderate: 'Moderate Income (81-120% AMI)',
          aboveModerate: 'Above Moderate Income (>120% AMI)',
        };

        // Convert color scale array to legend scale format
        const getScaleFromArray = (colorScale: [number, string][], fallbackScale: typeof LEGEND_CONFIGS.language.scale) => {
          if (!colorScale) return fallbackScale;
          const step = Math.max(1, Math.floor(colorScale.length / 5));
          return colorScale
            .filter((_, i) => i % step === 0 || i === colorScale.length - 1)
            .slice(0, 5)
            .map(([value, color]) => ({ value, color }));
        };

        // Build legend config based on colorBy
        let legendConfig: typeof LEGEND_CONFIGS.language;
        if (colorBy === 'language' && selectedLanguage) {
          legendConfig = {
            ...LEGEND_CONFIGS.language,
            label: languageLabels[selectedLanguage] || 'Language Speakers',
            scale: getScaleFromArray(LANGUAGE_COLOR_SCALES[selectedLanguage], LEGEND_CONFIGS.language.scale),
          };
        } else if (colorBy === 'ethnicity' && selectedEthnicity) {
          legendConfig = {
            colorBy: 'ethnicity' as LegendColorBy,
            label: ethnicityLabels[selectedEthnicity] || 'Population',
            unit: '%',
            scale: getScaleFromArray(ETHNICITY_COLOR_SCALES[selectedEthnicity], LEGEND_CONFIGS.language.scale),
            formatValue: (v) => `${v.toFixed(1)}%`,
            sourceLabel: 'Census ACS 5-Year',
            sourceUrl: 'https://data.census.gov/',
          };
        } else if (colorBy === 'age' && selectedAge) {
          legendConfig = {
            colorBy: 'age' as LegendColorBy,
            label: ageLabels[selectedAge] || 'Age Group',
            unit: '%',
            scale: getScaleFromArray(AGE_COLOR_SCALES[selectedAge], LEGEND_CONFIGS.language.scale),
            formatValue: (v) => `${v.toFixed(1)}%`,
            sourceLabel: 'Census ACS 5-Year',
            sourceUrl: 'https://data.census.gov/',
          };
        } else if (colorBy === 'income' && selectedIncome) {
          legendConfig = {
            colorBy: 'income' as LegendColorBy,
            label: incomeLabels[selectedIncome] || 'Income Bracket',
            unit: '%',
            scale: getScaleFromArray(INCOME_BRACKET_SCALES[selectedIncome], LEGEND_CONFIGS.language.scale),
            formatValue: (v) => `${v.toFixed(1)}%`,
            sourceLabel: 'Census ACS 5-Year',
            sourceUrl: 'https://data.census.gov/',
          };
        } else {
          legendConfig = LEGEND_CONFIGS[colorBy as LegendColorBy] || LEGEND_CONFIGS.coverage;
        }

        return (
          <ExpandableLegend
            config={legendConfig}
            selectedNeighborhood={activeNeighborhood ? {
              id: activeNeighborhood,
              name: SF_NEIGHBORHOODS[activeNeighborhood]?.name || activeNeighborhood,
              value: (() => {
                if (colorBy === 'evictions' && evictionData) {
                  return evictionData.find(d => d.neighborhood === activeNeighborhood)?.rate || 0;
                }
                if (colorBy === 'income' && censusData[activeNeighborhood]) {
                  return getIncomeValue(censusData[activeNeighborhood]);
                }
                if (colorBy === 'language' && censusData[activeNeighborhood]) {
                  return getLanguageValue(censusData[activeNeighborhood]);
                }
                if (colorBy === 'ethnicity' && censusData[activeNeighborhood]) {
                  return getEthnicityValue(censusData[activeNeighborhood]);
                }
                if (colorBy === 'age' && censusData[activeNeighborhood]) {
                  return getAgeValue(censusData[activeNeighborhood]);
                }
                return 0;
              })(),
            } : null}
            neighborhoodData={
              colorBy === 'evictions' && activeNeighborhood && evictionStats
                ? evictionStats.byNeighborhood[activeNeighborhood]
                : null
            }
            cityAverage={cityAverage}
            rank={rank}
            totalNeighborhoods={totalNeighborhoods}
            timeRange={timeRange}
            onTimeRangeChange={onTimeRangeChange}
            showTimeToggle={colorBy === 'evictions'}
            isPinned={!!clickedNeighborhood && clickedNeighborhood === activeNeighborhood}
          />
        );
      })()}

      {/* Selection info */}
      {selectedNeighborhoods.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10 border border-slate-200">
          <div className="text-sm text-slate-700">
            <span className="font-medium">{selectedNeighborhoods.length}</span> neighborhoods selected
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-slate-500">Loading map...</div>
        </div>
      )}

      {/* Inline color legend bar - shows when not using expandable legend */}
      {!showLegend && colorBy && colorBy !== 'none' && (
        <div className="absolute bottom-8 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <div className="text-[10px] text-slate-500 mb-1">
            {COLOR_SCALE_LABELS[colorBy]?.label}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400 w-8">
              {COLOR_SCALE_LABELS[colorBy]?.lowLabel}
            </span>
            <div className="flex h-2 w-24 rounded overflow-hidden">
              {COLOR_SCALES[colorBy]?.slice(0, 5).map(([, color], i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-400 w-8 text-right">
              {COLOR_SCALE_LABELS[colorBy]?.highLabel}
            </span>
          </div>
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
