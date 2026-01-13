'use client';

/**
 * NeighborhoodPopover - Compact info card on neighborhood click
 *
 * Shows one key metric based on the active demographic tab, with context
 * (ranking, comparison) and a path to the full Supercard profile.
 *
 * Design: Premium data visualization - confident, minimal, data-forward
 */

import { useMemo } from 'react';
import type { SFNeighborhood } from '@/types';
import { SF_NEIGHBORHOODS } from '@/lib/geo/sf-geography';

// Simplified census data type matching actual data structure
interface SimpleCensusData {
  population?: { total: number };
  economic?: {
    medianHouseholdIncome?: number;
    amiDistribution?: Record<string, number>;
  };
  housing?: { renterOccupied?: number };
  language?: {
    limitedEnglishProficiency?: number;
    languagesSpoken?: Record<string, number>;
  };
  ethnicity?: {
    distribution?: Record<string, number>;
  };
  age?: {
    under18?: number;
    seniors?: number;
    distribution?: Record<string, number>;
  };
}

// =============================================================================
// TYPES
// =============================================================================

export type DemoTabType = 'languages' | 'communities' | 'income' | 'age' | 'housing';

export interface NeighborhoodPopoverProps {
  /** The neighborhood being displayed */
  neighborhood: SFNeighborhood;
  /** Screen position for the popover (pixels) */
  position: { x: number; y: number };
  /** Which demographic tab is active */
  activeDemoTab: DemoTabType;
  /** Selected sub-filter within the tab (e.g., 'spanish', 'asian', 'extremelyLow') */
  selectedDemographic: string | null;
  /** Census data for this neighborhood */
  censusData: SimpleCensusData;
  /** Eviction data if in housing tab */
  evictionData?: { rate: number; total: number };
  /** Ranking info */
  rank?: number;
  totalNeighborhoods?: number;
  /** Callbacks */
  onExpand: () => void;
  onDismiss: () => void;
}

// =============================================================================
// METRIC CONFIGURATION
// =============================================================================

interface MetricDisplay {
  value: string;
  label: string;
  subtext?: string;
  accentColor: string;
}

const TAB_COLORS: Record<DemoTabType, string> = {
  languages: '#ea580c',    // orange-600
  communities: '#7c3aed',  // violet-600
  income: '#16a34a',       // green-600
  age: '#0d9488',          // teal-600
  housing: '#dc2626',      // red-600
};

// =============================================================================
// COMPONENT
// =============================================================================

export function NeighborhoodPopover({
  neighborhood,
  position,
  activeDemoTab,
  selectedDemographic,
  censusData,
  evictionData,
  rank,
  totalNeighborhoods,
  onExpand,
  onDismiss,
}: NeighborhoodPopoverProps) {
  const neighborhoodInfo = SF_NEIGHBORHOODS[neighborhood];
  const name = neighborhoodInfo?.name || neighborhood;

  // Calculate the metric to display based on active tab
  const metric = useMemo((): MetricDisplay => {
    const accentColor = TAB_COLORS[activeDemoTab];

    switch (activeDemoTab) {
      case 'languages': {
        if (selectedDemographic && censusData.language?.languagesSpoken) {
          const langKey = selectedDemographic as keyof typeof censusData.language.languagesSpoken;
          const value = censusData.language.languagesSpoken[langKey] || 0;
          const langLabels: Record<string, string> = {
            spanish: 'Spanish',
            chinese: 'Chinese',
            tagalog: 'Tagalog',
            vietnamese: 'Vietnamese',
            korean: 'Korean',
            russian: 'Russian',
          };
          return {
            value: `${value.toFixed(1)}%`,
            label: `${langLabels[selectedDemographic] || selectedDemographic} speakers`,
            accentColor,
          };
        }
        return {
          value: `${censusData.language?.limitedEnglishProficiency ?? 0}%`,
          label: 'Limited English Proficiency',
          accentColor,
        };
      }

      case 'communities': {
        if (selectedDemographic && censusData.ethnicity?.distribution) {
          const ethKey = selectedDemographic as keyof typeof censusData.ethnicity.distribution;
          const value = censusData.ethnicity.distribution[ethKey] || 0;
          const ethLabels: Record<string, string> = {
            white: 'White',
            asian: 'Asian',
            hispanic: 'Hispanic/Latino',
            black: 'Black',
            pacific: 'Pacific Islander',
            pacificIslander: 'Pacific Islander',
            multiracial: 'Multiracial',
          };
          return {
            value: `${value.toFixed(1)}%`,
            label: `${ethLabels[selectedDemographic] || selectedDemographic} population`,
            accentColor,
          };
        }
        // Default: show largest ethnic group
        const dist = censusData.ethnicity?.distribution;
        if (dist) {
          const entries = Object.entries(dist) as [string, number][];
          const largest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
          return {
            value: `${largest[1].toFixed(1)}%`,
            label: `${largest[0].charAt(0).toUpperCase() + largest[0].slice(1)} (largest group)`,
            accentColor,
          };
        }
        return { value: 'N/A', label: 'No data', accentColor };
      }

      case 'income': {
        if (selectedDemographic && censusData.economic?.amiDistribution) {
          const incKey = selectedDemographic as keyof typeof censusData.economic.amiDistribution;
          const value = censusData.economic.amiDistribution[incKey] || 0;
          const incLabels: Record<string, string> = {
            extremelyLow: 'Extremely Low Income (≤30% AMI)',
            veryLow: 'Very Low Income (31-50% AMI)',
            low: 'Low Income (51-80% AMI)',
            moderate: 'Moderate Income (81-120% AMI)',
            aboveModerate: 'Above Moderate (>120% AMI)',
          };
          return {
            value: `${value.toFixed(1)}%`,
            label: incLabels[selectedDemographic] || selectedDemographic,
            accentColor,
          };
        }
        return {
          value: `$${((censusData.economic?.medianHouseholdIncome ?? 0) / 1000).toFixed(0)}k`,
          label: 'Median household income',
          accentColor,
        };
      }

      case 'age': {
        if (selectedDemographic) {
          let value = 0;
          let label = '';

          if (selectedDemographic === 'under18') {
            value = censusData.age?.under18 ?? 0;
            label = 'Under 18';
          } else if (selectedDemographic === 'seniors') {
            value = censusData.age?.seniors ?? 0;
            label = 'Seniors (65+)';
          } else {
            // Map to distribution keys
            const ageKeyMap: Record<string, string> = {
              '18-24': '18-24',
              '25-34': '25-34',
              '35-44': '35-44',
              '45-54': '45-54',
              '55-64': '55-64',
            };
            const distKey = ageKeyMap[selectedDemographic];
            if (distKey && censusData.age?.distribution?.[distKey] !== undefined) {
              value = censusData.age.distribution[distKey];
              label = `Age ${selectedDemographic}`;
            }
          }

          return {
            value: `${value.toFixed(1)}%`,
            label,
            accentColor,
          };
        }
        return {
          value: 'N/A',
          label: 'Age data',
          accentColor,
        };
      }

      case 'housing': {
        if (evictionData) {
          return {
            value: evictionData.total.toString(),
            label: 'evictions',
            subtext: `${evictionData.rate.toFixed(1)} per 1,000 units`,
            accentColor,
          };
        }
        return {
          value: `${censusData.housing?.renterOccupied ?? 0}%`,
          label: 'Renters',
          accentColor,
        };
      }

      default:
        return {
          value: censusData.population.total.toLocaleString(),
          label: 'Population',
          accentColor: '#64748b',
        };
    }
  }, [activeDemoTab, selectedDemographic, censusData, evictionData]);

  // Calculate popover position (ensure it stays on screen)
  const popoverStyle = useMemo(() => {
    const offsetY = -10; // Appear above click point
    return {
      left: `${position.x}px`,
      top: `${position.y + offsetY}px`,
      transform: 'translate(-50%, -100%)',
    };
  }, [position]);

  return (
    <>
      {/* Backdrop for dismissal */}
      <div
        className="fixed inset-0 z-40"
        onClick={onDismiss}
      />

      {/* Popover */}
      <div
        className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={popoverStyle}
      >
        <div
          className="bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden"
          style={{
            minWidth: '200px',
            maxWidth: '260px',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Accent bar */}
          <div
            className="h-1"
            style={{ backgroundColor: metric.accentColor }}
          />

          {/* Content */}
          <div className="p-4">
            {/* Neighborhood name */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                {name}
              </h3>
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 transition-colors -mt-1 -mr-1 p-1"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Big metric */}
            <div className="mb-3">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: metric.accentColor }}
                >
                  {metric.value}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {metric.label}
              </div>
              {metric.subtext && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {metric.subtext}
                </div>
              )}
            </div>

            {/* Ranking */}
            {rank && totalNeighborhoods && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <span className="font-medium">#{rank}</span>
                <span className="text-slate-300">of</span>
                <span>{totalNeighborhoods} neighborhoods</span>
              </div>
            )}

            {/* Population context */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>{censusData.population.total.toLocaleString()} residents</span>
              <span className="text-slate-300">·</span>
              <span>{censusData.housing.renterOccupied}% renters</span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={onExpand}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 transition-colors group"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                View full profile
              </span>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Pointer triangle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
          }}
        />
      </div>
    </>
  );
}

export default NeighborhoodPopover;
