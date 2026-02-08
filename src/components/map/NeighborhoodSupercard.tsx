'use client';

/**
 * NeighborhoodSupercard - Rich demographic profile card
 *
 * A comprehensive "trading card" showing all demographic data for a neighborhood.
 * Designed to be visually striking, data-dense yet scannable, with clear
 * visual hierarchy and actionable publisher connections.
 *
 * Design: Premium data visualization with editorial polish
 */

import { useMemo } from 'react';
import type { SFNeighborhood, Publisher } from '@/types';
import type { NeighborhoodEvictionData, Neighborhood311Data, NeighborhoodSafetyData } from '@/lib/datasf/types';
import { SERVICE_CATEGORY_LABELS, SAFETY_CATEGORY_LABELS } from '@/lib/datasf/types';
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

export interface NeighborhoodSupercardProps {
  /** The neighborhood being displayed */
  neighborhood: SFNeighborhood;
  /** Screen position for the card (pixels) */
  position: { x: number; y: number };
  /** Census data for this neighborhood */
  censusData: SimpleCensusData;
  /** Eviction data */
  evictionData?: NeighborhoodEvictionData;
  /** 311 data */
  three11Data?: Neighborhood311Data;
  /** Safety data */
  safetyData?: NeighborhoodSafetyData;
  /** Publishers serving this area */
  publishersInArea: Publisher[];
  /** Callbacks */
  onDismiss: () => void;
  onPublisherClick?: (publisher: Publisher) => void;
}

// =============================================================================
// BAR CHART COMPONENT
// =============================================================================

interface BarRowProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  suffix?: string;
}

function BarRow({ label, value, maxValue = 100, color, suffix = '%' }: BarRowProps) {
  const width = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[11px] text-slate-600 truncate">{label}</div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-12 text-right text-[11px] font-medium text-slate-700">
        {value.toFixed(1)}{suffix}
      </div>
    </div>
  );
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps {
  title: string;
  color: string;
  children: React.ReactNode;
}

function Section({ title, color, children }: SectionProps) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h4>
      </div>
      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NeighborhoodSupercard({
  neighborhood,
  position,
  censusData,
  evictionData,
  three11Data,
  safetyData,
  publishersInArea,
  onDismiss,
  onPublisherClick,
}: NeighborhoodSupercardProps) {
  const neighborhoodInfo = SF_NEIGHBORHOODS[neighborhood];
  const name = neighborhoodInfo?.name || neighborhood;

  // Get top languages (excluding English, sorted by percentage)
  const topLanguages = useMemo(() => {
    const langs = censusData.language?.languagesSpoken;
    if (!langs) return [];
    return [
      { key: 'spanish', label: 'Spanish', value: langs.spanish ?? 0 },
      { key: 'chinese', label: 'Chinese', value: langs.chinese ?? 0 },
      { key: 'tagalog', label: 'Tagalog', value: langs.tagalog ?? 0 },
      { key: 'vietnamese', label: 'Vietnamese', value: langs.vietnamese ?? 0 },
      { key: 'korean', label: 'Korean', value: langs.korean ?? 0 },
      { key: 'russian', label: 'Russian', value: langs.russian ?? 0 },
    ]
      .filter(l => l.value > 0.5)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [censusData.language?.languagesSpoken]);

  // Get ethnicity distribution sorted
  const ethnicityRows = useMemo(() => {
    const dist = censusData.ethnicity?.distribution;
    if (!dist) return [];
    const labels: Record<string, string> = {
      white: 'White',
      asian: 'Asian',
      hispanic: 'Hispanic/Latino',
      black: 'Black',
      pacificIslander: 'Pacific Islander',
      pacific: 'Pacific Islander',
      multiracial: 'Multiracial',
      nativeAmerican: 'Native American',
      other: 'Other',
    };
    return (Object.entries(dist) as [string, number][])
      .filter(([, v]) => v > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => ({ label: labels[k] || k, value: v }));
  }, [censusData.ethnicity?.distribution]);

  // Income distribution
  const incomeRows = useMemo(() => {
    const ami = censusData.economic?.amiDistribution;
    if (!ami) return [];
    return [
      { label: 'Extremely Low (≤30%)', value: ami.extremelyLow ?? 0 },
      { label: 'Very Low (31-50%)', value: ami.veryLow ?? 0 },
      { label: 'Low (51-80%)', value: ami.low ?? 0 },
      { label: 'Moderate (81-120%)', value: ami.moderate ?? 0 },
      { label: 'Above Moderate', value: ami.aboveModerate ?? 0 },
    ].filter(r => r.value > 2);
  }, [censusData.economic?.amiDistribution]);

  // Age distribution
  const ageRows = useMemo(() => {
    const age = censusData.age;
    if (!age) return [];
    const dist = age.distribution ?? {};
    return [
      { label: 'Under 18', value: age.under18 ?? 0 },
      { label: '18-24', value: dist['18-24'] ?? 0 },
      { label: '25-34', value: dist['25-34'] ?? 0 },
      { label: '35-44', value: dist['35-44'] ?? 0 },
      { label: '45-54', value: dist['45-54'] ?? 0 },
      { label: '55-64', value: dist['55-64'] ?? 0 },
      { label: '65+', value: age.seniors ?? 0 },
    ].filter(r => r.value > 3);
  }, [censusData.age]);

  // Position the card on screen, ensuring it stays visible
  const cardStyle = useMemo(() => {
    const cardWidth = 340;
    const cardHeight = 600;
    const padding = 20;

    let left = position.x - cardWidth / 2;
    let top = position.y - cardHeight - 20;

    // Keep on screen horizontally
    if (left < padding) left = padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }

    // If would go above viewport, show below instead
    if (top < padding) {
      top = position.y + 20;
    }

    return { left: `${left}px`, top: `${top}px` };
  }, [position]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onDismiss}
      />

      {/* Supercard */}
      <div
        className="fixed z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={cardStyle}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
          style={{
            width: '340px',
            maxHeight: 'calc(100vh - 80px)',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5">
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold tracking-tight mb-1 pr-8">
              {name}
            </h2>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span>{(censusData.population?.total ?? 0).toLocaleString()} residents</span>
              <span className="text-white/30">·</span>
              <span>{censusData.economic?.medianHouseholdIncome ? `$${(censusData.economic.medianHouseholdIncome / 1000).toFixed(0)}k median` : ''}</span>
            </div>

            {/* Key metrics row */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-bold">
                  ${((censusData.economic?.medianHouseholdIncome ?? 0) / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide">
                  Median Income
                </div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-bold">
                  {censusData.housing?.renterOccupied ?? 0}%
                </div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide">
                  Renters
                </div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-lg font-bold">
                  {censusData.language?.limitedEnglishProficiency ?? 0}%
                </div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide">
                  LEP Rate
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <div className="px-5 divide-y divide-slate-100">
              {/* Languages */}
              {topLanguages.length > 0 && (
                <Section title="Languages" color="#ea580c">
                  {topLanguages.map(lang => (
                    <BarRow
                      key={lang.key}
                      label={lang.label}
                      value={lang.value}
                      maxValue={50}
                      color="#ea580c"
                    />
                  ))}
                </Section>
              )}

              {/* Communities / Ethnicity */}
              <Section title="Communities" color="#7c3aed">
                {ethnicityRows.map(row => (
                  <BarRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    maxValue={80}
                    color="#7c3aed"
                  />
                ))}
              </Section>

              {/* Income */}
              <Section title="Income Distribution" color="#16a34a">
                {incomeRows.map(row => (
                  <BarRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    maxValue={50}
                    color="#16a34a"
                  />
                ))}
              </Section>

              {/* Age */}
              <Section title="Age Distribution" color="#0d9488">
                {ageRows.map(row => (
                  <BarRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    maxValue={30}
                    color="#0d9488"
                  />
                ))}
              </Section>

              {/* Housing */}
              <Section title="Housing" color="#dc2626">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="font-semibold text-slate-900">
                      {censusData.housing?.renterOccupied ?? 0}%
                    </div>
                    <div className="text-[10px] text-slate-500">Renters</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="font-semibold text-slate-900">
                      {100 - (censusData.housing?.renterOccupied ?? 0)}%
                    </div>
                    <div className="text-[10px] text-slate-500">Owners</div>
                  </div>
                </div>

                {evictionData && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-red-700">
                        {evictionData.total}
                      </span>
                      <span className="text-sm text-red-600">evictions</span>
                    </div>
                    <div className="text-xs text-red-500 mt-1">
                      {evictionData.rate.toFixed(1)} per 1,000 rental units (12 months)
                    </div>
                    {evictionData.topCauses && evictionData.topCauses.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-100">
                        <div className="text-[10px] text-red-500 mb-1">Top causes:</div>
                        <div className="flex flex-wrap gap-1">
                          {evictionData.topCauses.slice(0, 3).map(c => (
                            <span
                              key={c.cause}
                              className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded"
                            >
                              {c.cause} ({c.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* 311 Community Needs */}
              {three11Data && (
                <Section title="Community Needs (311)" color="#2563eb">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-700">
                        {three11Data.total.toLocaleString()}
                      </span>
                      <span className="text-sm text-blue-600">requests</span>
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      {three11Data.rate.toFixed(1)} per 1,000 residents
                    </div>
                    {three11Data.topCategories && three11Data.topCategories.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-100">
                        <div className="text-[10px] text-blue-500 mb-1">Top categories:</div>
                        <div className="flex flex-wrap gap-1">
                          {three11Data.topCategories.slice(0, 4).map(c => (
                            <span
                              key={c.category}
                              className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
                            >
                              {SERVICE_CATEGORY_LABELS[c.category]} ({c.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Public Safety */}
              {safetyData && (
                <Section title="Public Safety" color="#dc2626">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-700">
                        {safetyData.total.toLocaleString()}
                      </span>
                      <span className="text-sm text-amber-600">incidents</span>
                    </div>
                    <div className="text-xs text-amber-500 mt-1">
                      {safetyData.rate.toFixed(1)} per 1,000 residents
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-amber-600">
                        {safetyData.policeCount.toLocaleString()} SFPD
                      </span>
                      <span className="text-amber-400">·</span>
                      <span className="text-amber-600">
                        {safetyData.fireCount.toLocaleString()} SFFD
                      </span>
                    </div>
                    {safetyData.topCategories && safetyData.topCategories.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-100">
                        <div className="text-[10px] text-amber-500 mb-1">Top categories:</div>
                        <div className="flex flex-wrap gap-1">
                          {safetyData.topCategories.slice(0, 4).map(c => (
                            <span
                              key={c.category}
                              className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded"
                            >
                              {SAFETY_CATEGORY_LABELS[c.category]} ({c.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Publishers */}
              {publishersInArea.length > 0 && (
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Publishers Serving This Area ({publishersInArea.length})
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {publishersInArea.slice(0, 6).map(pub => (
                      <button
                        key={pub.id}
                        onClick={() => onPublisherClick?.(pub)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors group"
                      >
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                          {pub.name}
                        </span>
                        <svg
                          className="w-3 h-3 text-slate-400 group-hover:text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                    {publishersInArea.length > 6 && (
                      <div className="flex items-center px-3 py-2 text-xs text-slate-500">
                        +{publishersInArea.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Source: Census ACS 5-Year Estimates</span>
              <span>Data year: 2022</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NeighborhoodSupercard;
