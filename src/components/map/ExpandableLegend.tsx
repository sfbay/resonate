'use client';

import { useState, useMemo } from 'react';
import type { SFNeighborhood } from '@/types';
import type { TimeRange, NeighborhoodEvictionData } from '@/lib/datasf/types';
import { EVICTION_CAUSE_LABELS } from '@/lib/datasf/types';

// =============================================================================
// TYPES
// =============================================================================

export type LegendColorBy = 'none' | 'audience' | 'income' | 'language' | 'coverage' | 'evictions' | 'ethnicity' | 'age';

export interface LegendConfig {
  colorBy: LegendColorBy;
  label: string;
  unit?: string;
  scale: { value: number; color: string }[];
  formatValue?: (value: number) => string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ExpandableLegendProps {
  config: LegendConfig;
  selectedNeighborhood?: {
    id: SFNeighborhood;
    name: string;
    value: number;
  } | null;
  neighborhoodData?: NeighborhoodEvictionData | null;
  cityAverage?: number;
  rank?: number;
  totalNeighborhoods?: number;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeToggle?: boolean;
  isPinned?: boolean; // True when showing clicked (pinned) neighborhood vs hovered
}

// =============================================================================
// LEGEND CONFIGURATIONS
// =============================================================================

export const LEGEND_CONFIGS: Record<LegendColorBy, LegendConfig> = {
  none: {
    colorBy: 'none',
    label: '',
    scale: [{ value: 0, color: '#f1f5f9' }],
    sourceLabel: '',
    sourceUrl: '#',
  },
  audience: {
    colorBy: 'audience',
    label: 'Audience Distribution',
    unit: '%',
    scale: [
      { value: 0, color: '#f7fbff' },
      { value: 25, color: '#c6dbef' },
      { value: 50, color: '#6baed6' },
      { value: 75, color: '#2171b5' },
      { value: 100, color: '#084594' },
    ],
    formatValue: (v) => `${v.toFixed(1)}%`,
    sourceLabel: 'Publisher Data',
    sourceUrl: '#',
  },
  income: {
    colorBy: 'income',
    label: 'Median Household Income',
    unit: 'k',
    scale: [
      { value: 0, color: '#f7fcf5' },
      { value: 75, color: '#c7e9c0' },
      { value: 125, color: '#74c476' },
      { value: 200, color: '#238b45' },
      { value: 300, color: '#005a32' },
    ],
    formatValue: (v) => `$${(v / 1000).toFixed(0)}k`,
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  language: {
    colorBy: 'language',
    label: 'Limited English Proficiency',
    unit: '%',
    scale: [
      { value: 0, color: '#fff5eb' },
      { value: 20, color: '#fdd0a2' },
      { value: 40, color: '#fd8d3c' },
      { value: 60, color: '#d94801' },
      { value: 80, color: '#8c2d04' },
    ],
    formatValue: (v) => `${v}%`,
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  coverage: {
    colorBy: 'coverage',
    label: 'Publisher Coverage',
    unit: ' publishers',
    scale: [
      { value: 0, color: '#f7fcfd' },
      { value: 3, color: '#ccece6' },
      { value: 6, color: '#66c2a4' },
      { value: 12, color: '#238b45' },
      { value: 20, color: '#005824' },
    ],
    formatValue: (v) => `${v} publishers`,
    sourceLabel: 'Resonate Platform',
    sourceUrl: '#',
  },
  evictions: {
    colorBy: 'evictions',
    label: 'Eviction Rate',
    unit: ' per 1k units',
    scale: [
      { value: 0, color: '#fef0d9' },
      { value: 5, color: '#fdcc8a' },
      { value: 10, color: '#fc8d59' },
      { value: 20, color: '#e34a33' },
      { value: 30, color: '#b30000' },
    ],
    formatValue: (v) => `${v.toFixed(1)}/1k`,
    sourceLabel: 'DataSF Eviction Notices',
    sourceUrl: 'https://data.sfgov.org/Housing-and-Buildings/Eviction-Notices/5cei-gny5',
  },
  ethnicity: {
    colorBy: 'ethnicity',
    label: 'Population by Ethnicity',
    unit: '%',
    scale: [
      { value: 0, color: '#f2f0f7' },
      { value: 20, color: '#cbc9e2' },
      { value: 40, color: '#9e9ac8' },
      { value: 60, color: '#756bb1' },
      { value: 80, color: '#54278f' },
    ],
    formatValue: (v) => `${v.toFixed(1)}%`,
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  age: {
    colorBy: 'age',
    label: 'Population by Age',
    unit: '%',
    scale: [
      { value: 0, color: '#e0f3db' },
      { value: 10, color: '#a8ddb5' },
      { value: 20, color: '#4eb3d3' },
      { value: 30, color: '#2b8cbe' },
      { value: 40, color: '#08589e' },
    ],
    formatValue: (v) => `${v.toFixed(1)}%`,
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ExpandableLegend({
  config,
  selectedNeighborhood,
  neighborhoodData,
  cityAverage,
  rank,
  totalNeighborhoods,
  timeRange = '12mo',
  onTimeRangeChange,
  showTimeToggle = false,
  isPinned = false,
}: ExpandableLegendProps) {
  const isExpanded = !!selectedNeighborhood;

  // Calculate comparison multiplier
  const comparisonMultiplier = useMemo(() => {
    if (!selectedNeighborhood || !cityAverage || cityAverage === 0) return null;
    return selectedNeighborhood.value / cityAverage;
  }, [selectedNeighborhood, cityAverage]);

  // Format comparison text
  const comparisonText = useMemo(() => {
    if (!comparisonMultiplier) return null;
    if (comparisonMultiplier >= 1.05) {
      return `${comparisonMultiplier.toFixed(1)}x city average`;
    } else if (comparisonMultiplier <= 0.95) {
      return `${(1 / comparisonMultiplier).toFixed(1)}x below average`;
    } else {
      return 'Near city average';
    }
  }, [comparisonMultiplier]);

  return (
    <div
      className={`
        absolute bottom-4 left-4 bg-white rounded-lg shadow-lg z-10
        border border-slate-200 transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-72' : 'w-auto'}
      `}
    >
      {/* Header with title and time toggle */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-slate-700">
            {config.label}
          </div>

          {showTimeToggle && onTimeRangeChange && (
            <div className="flex items-center bg-slate-100 rounded-md p-0.5">
              <button
                onClick={() => onTimeRangeChange('30d')}
                className={`
                  px-2 py-0.5 text-[10px] font-medium rounded transition-colors
                  ${timeRange === '30d'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                30d
              </button>
              <button
                onClick={() => onTimeRangeChange('12mo')}
                className={`
                  px-2 py-0.5 text-[10px] font-medium rounded transition-colors
                  ${timeRange === '12mo'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                12mo
              </button>
            </div>
          )}
        </div>

        {/* Color scale with values */}
        <div className="mt-2">
          <div className="flex items-center gap-0">
            {config.scale.map(({ color }, i) => (
              <div
                key={i}
                className="flex-1 h-2.5 first:rounded-l last:rounded-r"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {config.scale.map(({ value }, i) => {
              // Format value based on unit type
              const isLast = i === config.scale.length - 1;
              const suffix = isLast ? '+' : '';

              let displayValue: string;
              if (config.unit === '%') {
                displayValue = `${value}%${suffix}`;
              } else if (config.unit === 'k') {
                // Income in thousands
                displayValue = `$${value}k${suffix}`;
              } else if (config.unit === ' per 1k units' || config.unit === '/1k') {
                // Eviction rate
                displayValue = `${value}${suffix}`;
              } else if (config.unit === ' publishers') {
                displayValue = `${value}${suffix}`;
              } else {
                displayValue = `${value}${suffix}`;
              }

              return (
                <span
                  key={i}
                  className="text-[9px] text-slate-400"
                  style={{
                    flex: 1,
                    textAlign: i === 0 ? 'left' : isLast ? 'right' : 'center',
                  }}
                >
                  {displayValue}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded content: neighborhood details */}
      {isExpanded && selectedNeighborhood && (
        <div className="p-3 space-y-3">
          {/* Neighborhood name and primary metric */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {isPinned ? 'Pinned' : 'Hover'}
              </span>
              {isPinned && (
                <span className="text-[10px] text-slate-400">
                  📌
                </span>
              )}
            </div>
            <div className="font-semibold text-slate-900">
              {selectedNeighborhood.name}
            </div>

            {/* Big number: raw count for evictions, formatted value for others */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {neighborhoodData?.total !== undefined
                  ? neighborhoodData.total
                  : config.formatValue
                    ? config.formatValue(selectedNeighborhood.value)
                    : selectedNeighborhood.value}
              </span>
              <span className="text-sm text-slate-500">
                {neighborhoodData?.total !== undefined ? 'evictions' : ''}
              </span>
            </div>

            {/* Subordinate: rate and ranking */}
            {neighborhoodData?.total !== undefined && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span>{selectedNeighborhood.value.toFixed(1)}/1k units</span>
                {rank && totalNeighborhoods && (
                  <span className="text-slate-400">
                    #{rank} of {totalNeighborhoods}
                  </span>
                )}
              </div>
            )}

            {/* For non-eviction data, show ranking inline */}
            {!neighborhoodData && rank && totalNeighborhoods && (
              <div className="text-xs text-slate-500 mt-1">
                #{rank} of {totalNeighborhoods}
              </div>
            )}
          </div>

          {/* Comparison to city average */}
          {comparisonText && (
            <div
              className={`
                text-xs px-2 py-1 rounded-full inline-block
                ${config.colorBy === 'evictions'
                  ? comparisonMultiplier && comparisonMultiplier > 1.5
                    ? 'bg-red-100 text-red-700'
                    : comparisonMultiplier && comparisonMultiplier > 1
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600' // Neutral for income/language
                }
              `}
            >
              {comparisonText}
            </div>
          )}

          {/* Cause breakdown (for evictions) */}
          {neighborhoodData?.topCauses && neighborhoodData.topCauses.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                Top Causes
              </div>
              <div className="space-y-1.5">
                {neighborhoodData.topCauses.slice(0, 3).map(({ cause, percentage }) => (
                  <div key={cause} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-coral)] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-600 w-20 truncate">
                      {EVICTION_CAUSE_LABELS[cause]}
                    </span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Click to pin hint */}
          {!isPinned && (
            <div className="text-[10px] text-blue-500 text-center pt-1">
              Click to pin selection
            </div>
          )}
        </div>
      )}

      {/* Source attribution */}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
        <a
          href={config.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline"
        >
          Source: {config.sourceLabel}
        </a>
      </div>
    </div>
  );
}

export default ExpandableLegend;
