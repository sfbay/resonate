'use client';

/**
 * Mix Coverage Panel (Full Version)
 *
 * Shows coverage dashboard with progress bars, gap alerts, selected publisher
 * contributions, and recommended additions. Used on campaign detail page.
 */

import { useMemo } from 'react';
import {
  analyzeMix,
  getPublisherAddValue,
} from '@/lib/matching/mix-analysis';
import type { MatchPublisherData, TargetAudienceData } from '@/lib/matching/mix-analysis';

interface MixCoveragePanelProps {
  selectedPublishers: Set<string>;
  allMatches: MatchPublisherData[];
  target: TargetAudienceData;
  onTogglePublisher?: (id: string) => void;
}

function formatName(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function MixCoveragePanel({
  selectedPublishers,
  allMatches,
  target,
  onTogglePublisher,
}: MixCoveragePanelProps) {
  const analysis = useMemo(
    () => analyzeMix(selectedPublishers, allMatches, target),
    [selectedPublishers, allMatches, target]
  );

  // Recommended additions: unselected publishers sorted by gaps filled
  const recommendations = useMemo(() => {
    const unselected = allMatches.filter(m => !selectedPublishers.has(m.publisherId));
    return unselected
      .map(m => ({
        ...m,
        addValue: getPublisherAddValue(m.publisherId, selectedPublishers, allMatches, target),
      }))
      .filter(r => !r.addValue.isRedundant)
      .sort((a, b) => {
        const aGaps = a.addValue.uniqueNeighborhoods.length + a.addValue.uniqueLanguages.length;
        const bGaps = b.addValue.uniqueNeighborhoods.length + b.addValue.uniqueLanguages.length;
        return bGaps - aGaps;
      })
      .slice(0, 3);
  }, [selectedPublishers, allMatches, target]);

  if (selectedPublishers.size === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm text-slate-400 text-center">Select publishers to see coverage analysis</p>
      </div>
    );
  }

  const hasGaps = analysis.gapNeighborhoods.length > 0 || analysis.gapLanguages.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[var(--color-charcoal)] text-sm">
          Publisher Mix Coverage
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {selectedPublishers.size} publisher{selectedPublishers.size !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Coverage Progress Bars */}
        <div className="grid grid-cols-3 gap-4">
          <CoverageBar label="Geographic" value={analysis.geographicCoverage} />
          <CoverageBar label="Language" value={analysis.languageCoverage} />
          <CoverageBar label="Demographic" value={analysis.demographicCoverage} />
        </div>

        {/* Gap Alerts */}
        {hasGaps && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1.5">Coverage Gaps</p>
            <div className="space-y-1">
              {analysis.gapNeighborhoods.length > 0 && (
                <p className="text-xs text-amber-600">
                  Missing neighborhoods: {analysis.gapNeighborhoods.map(formatName).join(', ')}
                </p>
              )}
              {analysis.gapLanguages.length > 0 && (
                <p className="text-xs text-amber-600">
                  No {analysis.gapLanguages.map(formatName).join(', ')} publisher{analysis.gapLanguages.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Selected Publishers — Contributions */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Selected Publishers
          </p>
          <div className="space-y-2">
            {Array.from(analysis.publisherContributions.entries()).map(([id, contrib]) => (
              <div key={id} className="flex items-center justify-between py-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">
                    {contrib.publisherName}
                  </p>
                  {contrib.gapsFilled.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {contrib.gapsFilled.map((g, i) => (
                        <span key={i} className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  ) : contrib.isRedundant ? (
                    <p className="text-[10px] text-slate-400">Coverage overlaps with other selections</p>
                  ) : null}
                </div>
                {onTogglePublisher && (
                  <button
                    onClick={() => onTogglePublisher(id)}
                    className="text-xs text-slate-400 hover:text-red-500 ml-2 flex-shrink-0"
                    title="Remove from selection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Additions */}
        {hasGaps && recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Recommended Additions
            </p>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <div key={rec.publisherId} className="flex items-center justify-between bg-teal-50/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">{rec.publisherName}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {rec.addValue.gapsFilled.map((g, i) => (
                        <span key={i} className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  {onTogglePublisher && (
                    <button
                      onClick={() => onTogglePublisher(rec.publisherId)}
                      className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 ml-2 flex-shrink-0 bg-white px-2.5 py-1.5 rounded-full border border-teal-200 hover:border-teal-300 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasGaps && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
            <p className="text-xs font-semibold text-emerald-700">Full coverage achieved</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Your publisher mix covers all target neighborhoods and languages</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────

function CoverageBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${
          value >= 100 ? 'text-emerald-600' : value >= 50 ? 'text-teal-600' : 'text-amber-600'
        }`}>{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            value >= 100 ? 'bg-emerald-500' : value >= 50 ? 'bg-teal-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
