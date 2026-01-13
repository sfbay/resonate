'use client';

/**
 * ColorScaleLegend - Static color scale for map choropleth
 *
 * A simple, always-visible legend that shows what the map colors mean.
 * Does NOT expand or show neighborhood details - that's handled by
 * NeighborhoodPopover and NeighborhoodSupercard.
 */

import type { TimeRange } from '@/lib/datasf/types';

// =============================================================================
// TYPES
// =============================================================================

export interface ColorScaleStop {
  value: number;
  color: string;
}

export interface ColorScaleLegendProps {
  /** Title shown above the scale (e.g., "Spanish Speakers", "Eviction Rate") */
  label: string;
  /** Color stops from low to high */
  scale: ColorScaleStop[];
  /** Unit for display (e.g., "%", "/1k", "k") */
  unit: string;
  /** Data source name */
  sourceLabel: string;
  /** Link to data source */
  sourceUrl: string;
  /** Optional time range toggle (for evictions) */
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeToggle?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ColorScaleLegend({
  label,
  scale,
  unit,
  sourceLabel,
  sourceUrl,
  timeRange = '12mo',
  onTimeRangeChange,
  showTimeToggle = false,
}: ColorScaleLegendProps) {
  /**
   * Format the scale value for display based on unit type
   */
  const formatScaleValue = (value: number, isLast: boolean): string => {
    const suffix = isLast ? '+' : '';

    if (unit === '%') {
      return `${value}%${suffix}`;
    }
    if (unit === 'k' || unit === '$k') {
      return `$${value}k${suffix}`;
    }
    if (unit === '/1k' || unit === ' per 1k units') {
      return `${value}${suffix}`;
    }
    return `${value}${suffix}`;
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-slate-200 z-10 w-56">
      {/* Header with title and optional time toggle */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-slate-700">{label}</div>

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

        {/* Color scale bar */}
        <div className="mt-2">
          <div className="flex items-center gap-0">
            {scale.map(({ color }, i) => (
              <div
                key={i}
                className="flex-1 h-2.5 first:rounded-l last:rounded-r"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Scale values */}
          <div className="flex justify-between mt-1">
            {scale.map(({ value }, i) => {
              const isLast = i === scale.length - 1;
              return (
                <span
                  key={i}
                  className="text-[9px] text-slate-400"
                  style={{
                    flex: 1,
                    textAlign: i === 0 ? 'left' : isLast ? 'right' : 'center',
                  }}
                >
                  {formatScaleValue(value, isLast)}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source attribution */}
      <div className="px-3 py-1.5 bg-slate-50/50 rounded-b-lg">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline"
        >
          Source: {sourceLabel}
        </a>
      </div>
    </div>
  );
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/** Pre-configured legend settings for each demographic type */
export const LEGEND_PRESETS = {
  language: {
    label: 'Limited English Proficiency',
    scale: [
      { value: 0, color: '#fff5eb' },
      { value: 20, color: '#fdd0a2' },
      { value: 40, color: '#fd8d3c' },
      { value: 60, color: '#d94801' },
      { value: 80, color: '#8c2d04' },
    ],
    unit: '%',
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  ethnicity: {
    label: 'Population by Ethnicity',
    scale: [
      { value: 0, color: '#f5f0ff' },
      { value: 20, color: '#e0d4f7' },
      { value: 40, color: '#c4b5eb' },
      { value: 60, color: '#a896de' },
      { value: 80, color: '#6b46c1' },
    ],
    unit: '%',
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  income: {
    label: 'Income Distribution',
    scale: [
      { value: 0, color: '#f7fcf5' },
      { value: 20, color: '#c7e9c0' },
      { value: 40, color: '#74c476' },
      { value: 60, color: '#238b45' },
      { value: 80, color: '#005a32' },
    ],
    unit: '%',
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  age: {
    label: 'Population by Age',
    scale: [
      { value: 0, color: '#f0fdfa' },
      { value: 10, color: '#99f6e4' },
      { value: 20, color: '#2dd4bf' },
      { value: 30, color: '#14b8a6' },
      { value: 40, color: '#0f766e' },
    ],
    unit: '%',
    sourceLabel: 'Census ACS 5-Year',
    sourceUrl: 'https://data.census.gov/',
  },
  evictions: {
    label: 'Eviction Rate',
    scale: [
      { value: 0, color: '#fef0d9' },
      { value: 5, color: '#fdcc8a' },
      { value: 10, color: '#fc8d59' },
      { value: 20, color: '#e34a33' },
      { value: 30, color: '#b30000' },
    ],
    unit: '/1k',
    sourceLabel: 'DataSF Eviction Notices',
    sourceUrl: 'https://data.sfgov.org/Housing-and-Buildings/Eviction-Notices/5cei-gny5',
  },
  coverage: {
    label: 'Publisher Coverage',
    scale: [
      { value: 0, color: '#f7fcfd' },
      { value: 3, color: '#ccece6' },
      { value: 6, color: '#66c2a4' },
      { value: 12, color: '#238b45' },
      { value: 20, color: '#005824' },
    ],
    unit: '',
    sourceLabel: 'Resonate Platform',
    sourceUrl: '#',
  },
} as const;

export type LegendPresetKey = keyof typeof LEGEND_PRESETS;

export default ColorScaleLegend;
