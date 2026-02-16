'use client';

/**
 * Mix Coverage Summary (Compact Version)
 *
 * Light coverage bar row + gap count indicator for the onboarding wizard.
 * Shows geographic + language coverage inline without taking up much space.
 */

import { useMemo } from 'react';
import { analyzeMix } from '@/lib/matching/mix-analysis';
import type { MatchPublisherData, TargetAudienceData } from '@/lib/matching/mix-analysis';

interface MixCoverageSummaryProps {
  selectedPublishers: Set<string>;
  allMatches: MatchPublisherData[];
  target: TargetAudienceData;
}

export function MixCoverageSummary({
  selectedPublishers,
  allMatches,
  target,
}: MixCoverageSummaryProps) {
  const analysis = useMemo(
    () => analyzeMix(selectedPublishers, allMatches, target),
    [selectedPublishers, allMatches, target]
  );

  if (selectedPublishers.size === 0) return null;

  const gapCount = analysis.gapNeighborhoods.length + analysis.gapLanguages.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Mix Coverage
        </span>
        {gapCount > 0 ? (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {gapCount} gap{gapCount !== 1 ? 's' : ''} remaining
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Full coverage
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CompactBar label="Geographic" value={analysis.geographicCoverage} />
        <CompactBar label="Language" value={analysis.languageCoverage} />
      </div>
    </div>
  );
}

function CompactBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className={`text-[10px] font-bold tabular-nums ${
          value >= 100 ? 'text-emerald-600' : value >= 50 ? 'text-teal-600' : 'text-amber-600'
        }`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
