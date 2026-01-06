'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Publisher, SFNeighborhood, Language, Ethnicity, IncomeLevel, AgeRange } from '@/types';
import { SFNeighborhoodMap } from '../map/SFNeighborhoodMap';
import { SF_NEIGHBORHOODS } from '@/lib/geo/sf-geography';
import { getEvictionStats, getEvictionMapData } from '@/lib/datasf/evictions';
import type { TimeRange, CityEvictionStats } from '@/lib/datasf/types';

// =============================================================================
// TYPES
// =============================================================================

interface PublisherDiscoveryMapProps {
  publishers: Publisher[];
  onPublisherSelect?: (publisher: Publisher) => void;
}

interface FilterState {
  languages: Language[];
  ethnicities: Ethnicity[];
  incomelevels: IncomeLevel[];
  ageRanges: AgeRange[];
  neighborhoods: SFNeighborhood[];
}

type DemoFilterTab = 'languages' | 'communities' | 'income' | 'age' | 'housing';
type PublisherTab = 'neighborhood' | 'citywide';

// =============================================================================
// CONSTANTS
// =============================================================================

const TERRITORY_COLORS = [
  '#c45a3b', '#2d8a8a', '#d4a03c', '#7c6b9e', '#4a9e7d',
  '#c47a5a', '#5a8fc4', '#9e7c4a', '#6b9e9e', '#9e5a7c',
];

// Language options for single-select (maps to census data keys)
type CensusLanguageKey = 'spanish' | 'chinese' | 'tagalog' | 'vietnamese' | 'korean' | 'russian';

const LANGUAGE_MAP_OPTIONS: { value: CensusLanguageKey; label: string; filterValues: Language[] }[] = [
  { value: 'spanish', label: 'Spanish', filterValues: ['spanish'] },
  { value: 'chinese', label: 'Chinese', filterValues: ['chinese_cantonese', 'chinese_mandarin'] },
  { value: 'tagalog', label: 'Tagalog', filterValues: ['tagalog'] },
  { value: 'vietnamese', label: 'Vietnamese', filterValues: ['vietnamese'] },
  { value: 'korean', label: 'Korean', filterValues: ['korean'] },
  { value: 'russian', label: 'Russian', filterValues: ['russian'] },
];

// Ethnicity options for single-select (maps to census ethnicity.distribution keys)
type CensusEthnicityKey = 'white' | 'asian' | 'hispanic' | 'black' | 'pacificIslander' | 'multiracial';

const ETHNICITY_MAP_OPTIONS: { value: CensusEthnicityKey; label: string; filterValues: Ethnicity[] }[] = [
  { value: 'hispanic', label: 'Hispanic/Latino', filterValues: ['latino_mexican', 'latino_central_american'] },
  { value: 'asian', label: 'Asian', filterValues: ['chinese', 'filipino', 'vietnamese', 'south_asian'] },
  { value: 'black', label: 'Black', filterValues: ['black_african_american'] },
  { value: 'white', label: 'White', filterValues: ['white_european'] },
  { value: 'pacificIslander', label: 'Pacific Islander', filterValues: ['pacific_islander'] },
  { value: 'multiracial', label: 'Multiracial', filterValues: [] },
];

// Age options for single-select (maps to census age keys)
type CensusAgeKey = 'under18' | 'age18To24' | 'age25To34' | 'age35To44' | 'age45To54' | 'age55To64' | 'seniors';

const AGE_MAP_OPTIONS: { value: CensusAgeKey; label: string; filterValues: AgeRange[] }[] = [
  { value: 'under18', label: 'Under 18', filterValues: [] },
  { value: 'age18To24', label: '18-24', filterValues: ['18-24'] },
  { value: 'age25To34', label: '25-34', filterValues: ['25-34'] },
  { value: 'age35To44', label: '35-44', filterValues: ['35-44'] },
  { value: 'age45To54', label: '45-54', filterValues: ['45-54'] },
  { value: 'age55To64', label: '55-64', filterValues: ['55-64'] },
  { value: 'seniors', label: '65+', filterValues: ['65-74'] },
];

// Income options for single-select (maps to census amiDistribution keys)
type CensusIncomeKey = 'extremelyLow' | 'veryLow' | 'low' | 'moderate' | 'aboveModerate';

const INCOME_MAP_OPTIONS: { value: CensusIncomeKey; label: string; filterValues: IncomeLevel[] }[] = [
  { value: 'extremelyLow', label: 'Extremely Low (≤30% AMI)', filterValues: ['extremely_low'] },
  { value: 'veryLow', label: 'Very Low (31-50% AMI)', filterValues: ['very_low'] },
  { value: 'low', label: 'Low (51-80% AMI)', filterValues: ['low'] },
  { value: 'moderate', label: 'Moderate (81-120% AMI)', filterValues: ['moderate'] },
  { value: 'aboveModerate', label: 'Above Moderate (>120% AMI)', filterValues: ['above_moderate'] },
];

// Keep original for publisher filtering compatibility
const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'chinese_cantonese', label: 'Cantonese' },
  { value: 'chinese_mandarin', label: 'Mandarin' },
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'korean', label: 'Korean' },
  { value: 'russian', label: 'Russian' },
];

const ETHNICITY_OPTIONS: { value: Ethnicity; label: string }[] = [
  { value: 'latino_mexican', label: 'Latino/Mexican' },
  { value: 'latino_central_american', label: 'Central American' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'filipino', label: 'Filipino' },
  { value: 'black_african_american', label: 'Black/African American' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'white_european', label: 'White/European' },
  { value: 'pacific_islander', label: 'Pacific Islander' },
  { value: 'south_asian', label: 'South Asian' },
];

const INCOME_OPTIONS: { value: IncomeLevel; label: string }[] = [
  { value: 'extremely_low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'above_moderate', label: 'Above Moderate' },
];

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65-74', label: '65+' },
];

type EvictionPercentile = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

const EVICTION_PERCENTILE_OPTIONS: { value: EvictionPercentile; label: string; range: string }[] = [
  { value: 'very_low', label: 'Very Low', range: '0-20%' },
  { value: 'low', label: 'Low', range: '20-40%' },
  { value: 'moderate', label: 'Moderate', range: '40-60%' },
  { value: 'high', label: 'High', range: '60-80%' },
  { value: 'very_high', label: 'Very High', range: '80-100%' },
];

const DEMO_TABS: { id: DemoFilterTab; label: string }[] = [
  { id: 'languages', label: 'Languages' },
  { id: 'communities', label: 'Communities' },
  { id: 'income', label: 'Income' },
  { id: 'age', label: 'Age' },
  { id: 'housing', label: 'Housing' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PublisherDiscoveryMap({
  publishers,
  onPublisherSelect,
}: PublisherDiscoveryMapProps) {
  const [filters, setFilters] = useState<FilterState>({
    languages: [],
    ethnicities: [],
    incomelevels: [],
    ageRanges: [],
    neighborhoods: [],
  });
  const [activeDemoTab, setActiveDemoTab] = useState<DemoFilterTab>('languages');
  const [activePublisherTab, setActivePublisherTab] = useState<PublisherTab>('neighborhood');
  const [hoveredPublisher, setHoveredPublisher] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

  // Eviction data state
  const [evictionTimeRange, setEvictionTimeRange] = useState<TimeRange>('12mo');
  const [evictionData, setEvictionData] = useState<{ neighborhood: SFNeighborhood; rate: number }[]>([]);
  const [evictionStats, setEvictionStats] = useState<CityEvictionStats | null>(null);
  const [evictionLoading, setEvictionLoading] = useState(false);
  const [selectedEvictionPercentiles, setSelectedEvictionPercentiles] = useState<EvictionPercentile[]>([]);

  // Map choropleth state (single-select for each demographic)
  const [selectedMapLanguage, setSelectedMapLanguage] = useState<CensusLanguageKey | null>(null);
  const [selectedMapEthnicity, setSelectedMapEthnicity] = useState<CensusEthnicityKey | null>(null);
  const [selectedMapAge, setSelectedMapAge] = useState<CensusAgeKey | null>(null);
  const [selectedMapIncome, setSelectedMapIncome] = useState<CensusIncomeKey | null>(null);

  // Calculate neighborhoods by eviction percentile
  const neighborhoodsByPercentile = useMemo(() => {
    if (!evictionData.length) return {} as Record<EvictionPercentile, SFNeighborhood[]>;

    // Sort neighborhoods by eviction rate
    const sorted = [...evictionData].sort((a, b) => a.rate - b.rate);
    const total = sorted.length;

    // Calculate percentile thresholds
    const getPercentileIndex = (percentile: number) => Math.floor((percentile / 100) * total);

    const result: Record<EvictionPercentile, SFNeighborhood[]> = {
      very_low: sorted.slice(0, getPercentileIndex(20)).map(d => d.neighborhood),
      low: sorted.slice(getPercentileIndex(20), getPercentileIndex(40)).map(d => d.neighborhood),
      moderate: sorted.slice(getPercentileIndex(40), getPercentileIndex(60)).map(d => d.neighborhood),
      high: sorted.slice(getPercentileIndex(60), getPercentileIndex(80)).map(d => d.neighborhood),
      very_high: sorted.slice(getPercentileIndex(80)).map(d => d.neighborhood),
    };

    return result;
  }, [evictionData]);

  // Get neighborhoods matching selected percentiles
  const evictionFilteredNeighborhoods = useMemo(() => {
    if (!selectedEvictionPercentiles.length) return [];
    return selectedEvictionPercentiles.flatMap(p => neighborhoodsByPercentile[p] || []);
  }, [selectedEvictionPercentiles, neighborhoodsByPercentile]);

  // Toggle eviction percentile filter
  const toggleEvictionPercentile = (percentile: EvictionPercentile) => {
    setSelectedEvictionPercentiles(prev =>
      prev.includes(percentile)
        ? prev.filter(p => p !== percentile)
        : [...prev, percentile]
    );
  };

  // Fetch eviction data when housing tab is active
  useEffect(() => {
    if (activeDemoTab === 'housing') {
      setEvictionLoading(true);
      Promise.all([
        getEvictionMapData({ timeRange: evictionTimeRange }),
        getEvictionStats({ timeRange: evictionTimeRange }),
      ])
        .then(([mapData, stats]) => {
          setEvictionData(mapData);
          setEvictionStats(stats);
        })
        .catch((error) => {
          console.error('Failed to fetch eviction data:', error);
        })
        .finally(() => {
          setEvictionLoading(false);
        });
    }
  }, [activeDemoTab, evictionTimeRange]);

  // Toggle filter
  const toggleFilter = <K extends keyof FilterState>(key: K, value: FilterState[K][number]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ languages: [], ethnicities: [], incomelevels: [], ageRanges: [], neighborhoods: [] });
    setSelectedEvictionPercentiles([]);
    setSelectedMapLanguage(null);
    setSelectedMapEthnicity(null);
    setSelectedMapAge(null);
    setSelectedMapIncome(null);
  };

  // Count active filters
  const activeFilterCount =
    (selectedMapLanguage ? 1 : 0) + // Single-select language for map
    (selectedMapEthnicity ? 1 : 0) + // Single-select ethnicity for map
    (selectedMapAge ? 1 : 0) + // Single-select age for map
    (selectedMapIncome ? 1 : 0) + // Single-select income for map
    filters.neighborhoods.length +
    selectedEvictionPercentiles.length;

  // Get demo tab filter count
  const getDemoTabCount = (tab: DemoFilterTab) => {
    const counts: Record<DemoFilterTab, number> = {
      languages: selectedMapLanguage ? 1 : 0, // Single-select
      communities: selectedMapEthnicity ? 1 : 0, // Single-select
      income: selectedMapIncome ? 1 : 0, // Single-select
      age: selectedMapAge ? 1 : 0, // Single-select
      housing: selectedEvictionPercentiles.length,
    };
    return counts[tab];
  };

  // Filter publishers
  const filteredPublishers = useMemo(() => {
    return publishers.filter((pub) => {
      if (filters.languages.length > 0) {
        if (!filters.languages.some((l) => pub.audienceProfile.demographic.languages.includes(l))) return false;
      }
      if (filters.ethnicities.length > 0) {
        if (!filters.ethnicities.some((e) => pub.audienceProfile.cultural.ethnicities?.includes(e))) return false;
      }
      if (filters.incomelevels.length > 0) {
        if (!filters.incomelevels.some((i) => pub.audienceProfile.economic.incomeLevel?.includes(i))) return false;
      }
      if (filters.ageRanges.length > 0) {
        if (!filters.ageRanges.some((a) => pub.audienceProfile.demographic.ageRanges.includes(a))) return false;
      }
      if (filters.neighborhoods.length > 0) {
        if (pub.audienceProfile.geographic.citywide) return true;
        if (!filters.neighborhoods.some((n) => pub.audienceProfile.geographic.neighborhoods.includes(n))) return false;
      }
      // Filter by eviction percentile neighborhoods
      if (evictionFilteredNeighborhoods.length > 0) {
        if (pub.audienceProfile.geographic.citywide) return true;
        if (!evictionFilteredNeighborhoods.some((n) => pub.audienceProfile.geographic.neighborhoods.includes(n))) return false;
      }
      return true;
    });
  }, [publishers, filters, evictionFilteredNeighborhoods]);

  // Separate citywide vs geographic publishers
  const { geographicPublishers, citywidePublishers } = useMemo(() => {
    const geo: Publisher[] = [];
    const city: Publisher[] = [];
    filteredPublishers.forEach((pub) => {
      if (pub.audienceProfile.geographic.citywide || pub.audienceProfile.geographic.neighborhoods.length === 0) {
        city.push(pub);
      } else {
        geo.push(pub);
      }
    });
    return { geographicPublishers: geo, citywidePublishers: city };
  }, [filteredPublishers]);

  // Assign colors
  const publisherColors = useMemo(() => {
    const colors: Record<string, string> = {};
    filteredPublishers.forEach((pub, i) => {
      colors[pub.id] = TERRITORY_COLORS[i % TERRITORY_COLORS.length];
    });
    return colors;
  }, [filteredPublishers]);

  // Map highlight neighborhoods
  const mapHighlightedNeighborhoods = useMemo(() => {
    // When hovering a publisher, show their coverage
    if (hoveredPublisher) {
      const pub = filteredPublishers.find((p) => p.id === hoveredPublisher);
      if (pub) {
        if (pub.audienceProfile.geographic.citywide || pub.audienceProfile.geographic.neighborhoods.length === 0) {
          return Object.keys(SF_NEIGHBORHOODS) as SFNeighborhood[];
        }
        return pub.audienceProfile.geographic.neighborhoods;
      }
    }
    // When in housing mode with percentile filters, highlight those neighborhoods
    if (activeDemoTab === 'housing' && evictionFilteredNeighborhoods.length > 0) {
      return evictionFilteredNeighborhoods;
    }
    return filters.neighborhoods;
  }, [hoveredPublisher, filteredPublishers, filters.neighborhoods, activeDemoTab, evictionFilteredNeighborhoods]);

  // Publisher coverage for map
  const publisherCoverage = useMemo(() => {
    const coverage: Record<SFNeighborhood, { count: number; color: string }> = {} as Record<SFNeighborhood, { count: number; color: string }>;

    geographicPublishers.forEach((pub) => {
      const color = publisherColors[pub.id];
      pub.audienceProfile.geographic.neighborhoods.forEach((n) => {
        if (!coverage[n]) coverage[n] = { count: 0, color };
        coverage[n].count++;
        if (hoveredPublisher === pub.id) coverage[n].color = color;
      });
    });

    return Object.entries(coverage).map(([neighborhood, data]) => ({
      neighborhood: neighborhood as SFNeighborhood,
      publisherCount: data.count,
      totalReach: data.count * 10000,
      color: data.color,
    }));
  }, [geographicPublishers, publisherColors, hoveredPublisher]);

  // Check if hovering a citywide publisher
  const isHoveringCitywide = useMemo(() => {
    if (!hoveredPublisher) return false;
    const pub = filteredPublishers.find((p) => p.id === hoveredPublisher);
    return pub?.audienceProfile.geographic.citywide || pub?.audienceProfile.geographic.neighborhoods.length === 0;
  }, [hoveredPublisher, filteredPublishers]);

  const handlePublisherClick = (pub: Publisher) => {
    setSelectedPublisher(selectedPublisher === pub.id ? null : pub.id);
    onPublisherSelect?.(pub);
  };

  // Sorted neighborhoods
  const sortedNeighborhoods = useMemo(() => {
    return Object.entries(SF_NEIGHBORHOODS)
      .map(([id, info]) => ({ id: id as SFNeighborhood, name: info.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Current tab publishers
  const currentTabPublishers = activePublisherTab === 'neighborhood' ? geographicPublishers : citywidePublishers;

  return (
    <div className="bg-[var(--color-cream)] rounded-2xl border border-[var(--color-mist)] shadow-lg" style={{ overflow: 'visible' }}>
      {/* Top Bar: Two rows - Tabs then Content */}
      <div className="border-b border-[var(--color-mist)] bg-white rounded-t-2xl overflow-hidden">
        {/* Row 1: Tabs */}
        <div className="flex items-center border-b border-[var(--color-mist)]">
          <div className="px-4 py-2.5 border-r border-[var(--color-mist)]">
            <span className="text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider">
              Demographics
            </span>
          </div>
          {DEMO_TABS.map((tab) => {
            const count = getDemoTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
                  activeDemoTab === tab.id
                    ? 'text-[var(--color-teal)]'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-teal)] text-white">
                    {count}
                  </span>
                )}
                {activeDemoTab === tab.id && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--color-teal)]" />
                )}
              </button>
            );
          })}
          <div className="flex-1" />
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-xs text-[var(--color-coral)] hover:text-[var(--color-coral)]/80 font-medium"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Row 2: Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-slate-50/50">
          {activeDemoTab === 'languages' && (
            <>
              {/* Single-select language pills for map choropleth */}
              {LANGUAGE_MAP_OPTIONS.map((opt) => {
                const isSelected = selectedMapLanguage === opt.value;
                return (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    isActive={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        // Deselect
                        setSelectedMapLanguage(null);
                        setFilters(prev => ({ ...prev, languages: [] }));
                      } else {
                        // Select this language
                        setSelectedMapLanguage(opt.value);
                        setFilters(prev => ({ ...prev, languages: opt.filterValues }));
                      }
                    }}
                    activeColor="var(--color-teal)"
                  />
                );
              })}
            </>
          )}
          {activeDemoTab === 'communities' && (
            <>
              {/* Single-select ethnicity pills for map choropleth */}
              {ETHNICITY_MAP_OPTIONS.map((opt) => {
                const isSelected = selectedMapEthnicity === opt.value;
                return (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    isActive={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMapEthnicity(null);
                        setFilters(prev => ({ ...prev, ethnicities: [] }));
                      } else {
                        setSelectedMapEthnicity(opt.value);
                        setFilters(prev => ({ ...prev, ethnicities: opt.filterValues }));
                      }
                    }}
                    activeColor="var(--color-coral)"
                  />
                );
              })}
            </>
          )}
          {activeDemoTab === 'income' && (
            <>
              {/* Single-select income pills for map choropleth */}
              {INCOME_MAP_OPTIONS.map((opt) => {
                const isSelected = selectedMapIncome === opt.value;
                return (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    isActive={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMapIncome(null);
                        setFilters(prev => ({ ...prev, incomelevels: [] }));
                      } else {
                        setSelectedMapIncome(opt.value);
                        setFilters(prev => ({ ...prev, incomelevels: opt.filterValues }));
                      }
                    }}
                    activeColor="var(--color-marigold)"
                  />
                );
              })}
            </>
          )}
          {activeDemoTab === 'age' && (
            <>
              {/* Single-select age pills for map choropleth */}
              {AGE_MAP_OPTIONS.map((opt) => {
                const isSelected = selectedMapAge === opt.value;
                return (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    isActive={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMapAge(null);
                        setFilters(prev => ({ ...prev, ageRanges: [] }));
                      } else {
                        setSelectedMapAge(opt.value);
                        setFilters(prev => ({ ...prev, ageRanges: opt.filterValues }));
                      }
                    }}
                    activeColor="var(--color-teal)"
                  />
                );
              })}
            </>
          )}
          {activeDemoTab === 'housing' && (
            <>
              {/* Percentile filter pills */}
              {EVICTION_PERCENTILE_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  label={opt.label}
                  isActive={selectedEvictionPercentiles.includes(opt.value)}
                  onClick={() => toggleEvictionPercentile(opt.value)}
                  activeColor="var(--color-coral)"
                />
              ))}

              {/* Divider */}
              <div className="w-px h-5 bg-[var(--color-mist)] mx-1" />

              {/* Time range toggle */}
              <div className="flex items-center bg-white rounded-md border border-[var(--color-mist)] p-0.5">
                <button
                  onClick={() => setEvictionTimeRange('30d')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    evictionTimeRange === '30d'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={() => setEvictionTimeRange('12mo')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    evictionTimeRange === '12mo'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
                  }`}
                >
                  12mo
                </button>
              </div>

              {/* Status */}
              {evictionLoading && (
                <span className="text-xs text-[var(--color-slate)] animate-pulse">Loading...</span>
              )}
              {!evictionLoading && evictionStats && (
                <span className="text-xs text-[var(--color-slate)]">
                  {evictionStats.totalEvictions.toLocaleString()} total
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content: 3-column layout */}
      <div className="flex" style={{ height: '680px' }}>
        {/* Left: Neighborhoods */}
        <div className="w-44 flex-shrink-0 border-r border-[var(--color-mist)] bg-slate-50 flex flex-col rounded-bl-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--color-mist)] bg-white">
            <span className="text-xs font-semibold text-[var(--color-charcoal)] uppercase tracking-wide">
              Neighborhoods
            </span>
            {filters.neighborhoods.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, neighborhoods: [] }))}
                className="ml-2 text-[10px] text-[var(--color-slate)] hover:text-[var(--color-charcoal)]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {sortedNeighborhoods.map(({ id, name }) => {
              const isActive = filters.neighborhoods.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleFilter('neighborhoods', id)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'bg-[var(--color-charcoal)] text-white font-medium'
                      : 'text-[var(--color-slate)] hover:bg-white hover:text-[var(--color-charcoal)]'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative bg-white">
          <SFNeighborhoodMap
            mode="department"
            publisherCoverage={activeDemoTab !== 'housing' ? publisherCoverage : undefined}
            evictionData={activeDemoTab === 'housing' ? evictionData : undefined}
            evictionStats={activeDemoTab === 'housing' ? evictionStats ?? undefined : undefined}
            selectedNeighborhoods={mapHighlightedNeighborhoods}
            colorBy={
              activeDemoTab === 'housing'
                ? 'evictions'
                : activeDemoTab === 'languages'
                  ? 'language'
                  : activeDemoTab === 'communities'
                    ? 'ethnicity'
                    : activeDemoTab === 'age'
                      ? 'age'
                      : activeDemoTab === 'income'
                        ? 'income'
                        : 'none'
            }
            selectedLanguage={activeDemoTab === 'languages' ? selectedMapLanguage : undefined}
            selectedEthnicity={activeDemoTab === 'communities' ? selectedMapEthnicity : undefined}
            selectedAge={activeDemoTab === 'age' ? selectedMapAge : undefined}
            selectedIncome={activeDemoTab === 'income' ? selectedMapIncome : undefined}
            height="100%"
            showLegend={true}
            timeRange={evictionTimeRange}
            onTimeRangeChange={setEvictionTimeRange}
            initialViewState={{
              longitude: -122.4394,
              latitude: 37.7595,
              zoom: 11.3,
            }}
          />

          {/* Citywide overlay indicator */}
          {isHoveringCitywide && (
            <div className="absolute inset-4 border-4 border-dashed border-[var(--color-teal)]/40 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-medium text-[var(--color-teal)]">
                  Citywide Coverage
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Publisher List */}
        <div className="w-80 flex-shrink-0 flex flex-col border-l border-[var(--color-mist)] bg-white rounded-br-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 border-b border-[var(--color-mist)] bg-slate-50">
            <span className="text-xs font-semibold text-[var(--color-charcoal)] uppercase tracking-wide">
              Publications ({filteredPublishers.length})
            </span>
          </div>
          {/* Publisher Tabs */}
          <div className="flex border-b border-[var(--color-mist)]">
            <button
              onClick={() => setActivePublisherTab('neighborhood')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors relative ${
                activePublisherTab === 'neighborhood'
                  ? 'text-[var(--color-charcoal)]'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
              }`}
            >
              Neighborhood
              <span className="ml-1.5 text-xs font-normal text-[var(--color-slate)]">
                ({geographicPublishers.length})
              </span>
              {activePublisherTab === 'neighborhood' && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--color-coral)]" />
              )}
            </button>
            <button
              onClick={() => setActivePublisherTab('citywide')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors relative ${
                activePublisherTab === 'citywide'
                  ? 'text-[var(--color-charcoal)]'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
              }`}
            >
              Citywide
              <span className="ml-1.5 text-xs font-normal text-[var(--color-slate)]">
                ({citywidePublishers.length})
              </span>
              {activePublisherTab === 'citywide' && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--color-teal)]" />
              )}
            </button>
          </div>

          {/* Publisher Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentTabPublishers.length > 0 ? (
              currentTabPublishers.map((pub) => (
                <PublisherCard
                  key={pub.id}
                  publisher={pub}
                  color={publisherColors[pub.id]}
                  isHovered={hoveredPublisher === pub.id}
                  isSelected={selectedPublisher === pub.id}
                  onHover={(h) => setHoveredPublisher(h ? pub.id : null)}
                  onClick={() => handlePublisherClick(pub)}
                  isCitywide={activePublisherTab === 'citywide'}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 h-full">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--color-mist)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--color-slate)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-slate)]">No publishers match</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="mt-1 text-xs text-[var(--color-teal)] hover:underline">
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FILTER PILL
// =============================================================================

function FilterPill({
  label,
  isActive,
  onClick,
  activeColor,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  activeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
        isActive
          ? 'text-white shadow-sm'
          : 'bg-[var(--color-mist)] text-[var(--color-slate)] hover:bg-slate-200'
      }`}
      style={isActive ? { backgroundColor: activeColor } : undefined}
    >
      {label}
    </button>
  );
}

// =============================================================================
// PUBLISHER CARD
// =============================================================================

function PublisherCard({
  publisher,
  color,
  isHovered,
  isSelected,
  onHover,
  onClick,
  isCitywide,
}: {
  publisher: Publisher;
  color: string;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  isCitywide: boolean;
}) {
  const reach = publisher.platforms.reduce((sum, p) => sum + p.followerCount, 0);
  const logoPath = (publisher as Publisher & { logo?: string }).logo;

  const neighborhoods = publisher.audienceProfile.geographic.citywide
    ? []
    : publisher.audienceProfile.geographic.neighborhoods.slice(0, 3).map(formatNeighborhood);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`rounded-xl border transition-all duration-150 overflow-hidden cursor-pointer ${
        isSelected
          ? 'ring-2 ring-offset-1 shadow-lg'
          : isHovered
          ? 'shadow-lg border-slate-300'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      style={{
        borderColor: isSelected ? color : undefined,
        ringColor: isSelected ? color : undefined,
        backgroundColor: isHovered ? `${color}06` : 'white',
      }}
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-3">
        {/* Logo or Name - larger */}
        <div className="mb-2">
          {logoPath ? (
            <img
              src={logoPath}
              alt={publisher.name}
              className="h-7 max-w-[160px] object-contain object-left"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span
            className={`text-base font-semibold text-[var(--color-charcoal)] leading-tight ${logoPath ? 'hidden' : ''}`}
          >
            {publisher.name}
          </span>
        </div>

        {/* Reach and Tags Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {isCitywide && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)] font-medium">
                Citywide
              </span>
            )}
            {neighborhoods.map((n) => (
              <span key={n} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {n}
              </span>
            ))}
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-sm font-bold text-[var(--color-charcoal)]">{formatReach(reach)}</div>
            <div className="text-[10px] text-[var(--color-slate)]">reach</div>
          </div>
        </div>

        {/* Expanded */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{publisher.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {publisher.platforms.slice(0, 4).map((p) => (
                <span key={p.platform} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {p.platform}
                </span>
              ))}
            </div>
            <button
              className="w-full text-sm font-semibold py-2 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: color }}
              onClick={(e) => e.stopPropagation()}
            >
              Add to Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatReach(reach: number): string {
  if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
  if (reach >= 1000) return `${(reach / 1000).toFixed(0)}K`;
  return reach.toString();
}

function formatNeighborhood(n: SFNeighborhood): string {
  const names: Record<string, string> = {
    bayview_hunters_point: 'Bayview', bernal_heights: 'Bernal Heights', castro: 'Castro',
    chinatown: 'Chinatown', civic_center: 'Civic Center', cole_valley: 'Cole Valley',
    diamond_heights: 'Diamond Hts', dogpatch: 'Dogpatch', downtown: 'Downtown',
    excelsior: 'Excelsior', financial_district: 'FiDi', glen_park: 'Glen Park',
    haight_ashbury: 'Haight', hayes_valley: 'Hayes Valley', ingleside: 'Ingleside',
    inner_richmond: 'Inner Richmond', inner_sunset: 'Inner Sunset', japantown: 'Japantown',
    lakeshore: 'Lakeshore', laurel_heights: 'Laurel Hts', marina: 'Marina',
    mission: 'Mission', mission_bay: 'Mission Bay', nob_hill: 'Nob Hill',
    noe_valley: 'Noe Valley', north_beach: 'North Beach', oceanview: 'Oceanview',
    outer_mission: 'Outer Mission', outer_richmond: 'Outer Richmond', outer_sunset: 'Outer Sunset',
    pacific_heights: 'Pac Heights', parkside: 'Parkside', portola: 'Portola',
    potrero_hill: 'Potrero Hill', presidio: 'Presidio', russian_hill: 'Russian Hill',
    sea_cliff: 'Sea Cliff', soma: 'SoMa', south_beach: 'South Beach',
    stonestown: 'Stonestown', tenderloin: 'Tenderloin', treasure_island: 'Treasure Is',
    twin_peaks: 'Twin Peaks', visitacion_valley: 'Visitacion', west_portal: 'West Portal',
    western_addition: 'W Addition',
  };
  return names[n] || n;
}

export default PublisherDiscoveryMap;
