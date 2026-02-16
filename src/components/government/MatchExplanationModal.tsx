'use client';

/**
 * Match Explanation Modal
 *
 * Shows a 5-dimension breakdown of why a publisher scored the way it did.
 * Displays matched vs. unmatched targets for each dimension so government
 * users can make informed selection decisions.
 */

import { useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

export interface MatchBreakdown {
  geographic: number;
  demographic: number;
  economic: number;
  cultural: number;
  reach: number;
}

export interface MatchDetails {
  geographic?: {
    matchedNeighborhoods: string[];
    matchedDistricts: number[];
    coverageStrength: 'strong' | 'moderate' | 'weak';
  };
  demographic?: {
    matchedLanguages: string[];
    matchedAgeRanges: string[];
    otherMatches: string[];
  };
  economic?: {
    matchedIncomeLevel: boolean;
    matchedHousingStatus: boolean;
    matchedBenefitPrograms: string[];
  };
  cultural?: {
    matchedEthnicities: string[];
    matchedAffiliations: string[];
    matchedIdentityFactors: string[];
  };
}

export interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherName: string;
  overallScore: number;
  breakdown: MatchBreakdown;
  matchDetails?: MatchDetails;
  matchReasons?: string[];
  confidenceLevel?: 'high' | 'medium' | 'low';
  estimatedCost?: { low: number; high: number };
  estimatedReach?: { impressions?: { low: number; high: number }; engagements?: { low: number; high: number } };
  // Campaign targets for showing gaps
  targetNeighborhoods?: string[];
  targetLanguages?: string[];
}

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-teal-600';
  return 'text-slate-400';
}

function scoreBgColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-teal-500';
  return 'bg-slate-300';
}

function formatName(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const CONFIDENCE_STYLES = {
  high: { label: 'High Confidence', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { label: 'Medium Confidence', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Low Confidence', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const STRENGTH_LABEL: Record<string, string> = {
  strong: 'Strong coverage',
  moderate: 'Moderate coverage',
  weak: 'Limited coverage',
};

// ─────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────

export function MatchExplanationModal({
  isOpen,
  onClose,
  publisherName,
  overallScore,
  breakdown,
  matchDetails,
  matchReasons,
  confidenceLevel,
  estimatedCost,
  estimatedReach,
  targetNeighborhoods,
  targetLanguages,
}: MatchExplanationModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const geo = matchDetails?.geographic;
  const demo = matchDetails?.demographic;
  const econ = matchDetails?.economic;
  const cult = matchDetails?.cultural;

  // Compute unmatched targets
  const unmatchedNeighborhoods = (targetNeighborhoods || []).filter(
    n => !(geo?.matchedNeighborhoods || []).includes(n)
  );
  const unmatchedLanguages = (targetLanguages || []).filter(
    l => !(demo?.matchedLanguages || []).includes(l)
  );

  const conf = confidenceLevel ? CONFIDENCE_STYLES[confidenceLevel] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Match details for ${publisherName}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-[family-name:var(--font-fraunces)] ${
                overallScore >= 80 ? 'bg-emerald-50 text-emerald-600' :
                overallScore >= 60 ? 'bg-teal-50 text-teal-600' :
                'bg-slate-50 text-slate-500'
              }`}>
                {overallScore}
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[var(--color-charcoal)]">
                  {publisherName}
                </h2>
                <p className="text-sm text-slate-500">Match Score Breakdown</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Match reasons bar */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {matchReasons.map((reason, i) => (
                <span key={i} className="text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full font-medium">
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* ── Geographic ─────────────────────── */}
          <DimensionSection
            label="Geographic"
            score={breakdown.geographic}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {geo?.matchedNeighborhoods && geo.matchedNeighborhoods.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Matched neighborhoods</p>
                <div className="flex flex-wrap gap-1.5">
                  {geo.matchedNeighborhoods.map(n => (
                    <span key={n} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">{formatName(n)}</span>
                  ))}
                </div>
              </div>
            )}
            {unmatchedNeighborhoods.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Target neighborhoods not covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {unmatchedNeighborhoods.map(n => (
                    <span key={n} className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full">{formatName(n)}</span>
                  ))}
                </div>
              </div>
            )}
            {geo?.coverageStrength && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                geo.coverageStrength === 'strong' ? 'bg-emerald-50 text-emerald-600' :
                geo.coverageStrength === 'moderate' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {STRENGTH_LABEL[geo.coverageStrength]}
              </span>
            )}
            {(!geo?.matchedNeighborhoods || geo.matchedNeighborhoods.length === 0) && unmatchedNeighborhoods.length === 0 && (
              <p className="text-sm text-slate-400 italic">No geographic targeting data available</p>
            )}
          </DimensionSection>

          {/* ── Demographic ────────────────────── */}
          <DimensionSection
            label="Demographic"
            score={breakdown.demographic}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            {demo?.matchedLanguages && demo.matchedLanguages.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Matched languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {demo.matchedLanguages.map(l => (
                    <span key={l} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">{formatName(l)}</span>
                  ))}
                </div>
              </div>
            )}
            {unmatchedLanguages.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Target languages not covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {unmatchedLanguages.map(l => (
                    <span key={l} className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full">{formatName(l)}</span>
                  ))}
                </div>
              </div>
            )}
            {demo?.matchedAgeRanges && demo.matchedAgeRanges.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Matched age ranges</p>
                <div className="flex flex-wrap gap-1.5">
                  {demo.matchedAgeRanges.map(a => (
                    <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {demo?.otherMatches && demo.otherMatches.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {demo.otherMatches.map((m, i) => (
                  <span key={i} className="text-xs text-slate-500">{m}</span>
                ))}
              </div>
            )}
            {!demo && (
              <p className="text-sm text-slate-400 italic">No demographic match data available</p>
            )}
          </DimensionSection>

          {/* ── Economic ───────────────────────── */}
          <DimensionSection
            label="Economic"
            score={breakdown.economic}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="flex flex-wrap gap-3">
              {econ?.matchedIncomeLevel !== undefined && (
                <IndicatorBadge
                  label="Income match"
                  matched={econ.matchedIncomeLevel}
                />
              )}
              {econ?.matchedHousingStatus !== undefined && (
                <IndicatorBadge
                  label="Housing match"
                  matched={econ.matchedHousingStatus}
                />
              )}
            </div>
            {econ?.matchedBenefitPrograms && econ.matchedBenefitPrograms.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Benefit program alignment</p>
                <div className="flex flex-wrap gap-1.5">
                  {econ.matchedBenefitPrograms.map(b => (
                    <span key={b} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">{formatName(b)}</span>
                  ))}
                </div>
              </div>
            )}
            {!econ && (
              <p className="text-sm text-slate-400 italic">No economic match data available</p>
            )}
          </DimensionSection>

          {/* ── Cultural ───────────────────────── */}
          <DimensionSection
            label="Cultural"
            score={breakdown.cultural}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {cult?.matchedEthnicities && cult.matchedEthnicities.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Matched communities</p>
                <div className="flex flex-wrap gap-1.5">
                  {cult.matchedEthnicities.map(e => (
                    <span key={e} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">{formatName(e)}</span>
                  ))}
                </div>
              </div>
            )}
            {cult?.matchedAffiliations && cult.matchedAffiliations.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 font-medium mb-1.5">Community affiliations</p>
                <div className="flex flex-wrap gap-1.5">
                  {cult.matchedAffiliations.map(a => (
                    <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{formatName(a)}</span>
                  ))}
                </div>
              </div>
            )}
            {cult?.matchedIdentityFactors && cult.matchedIdentityFactors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cult.matchedIdentityFactors.map(f => (
                  <span key={f} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{formatName(f)}</span>
                ))}
              </div>
            )}
            {!cult && (
              <p className="text-sm text-slate-400 italic">No cultural match data available</p>
            )}
          </DimensionSection>

          {/* ── Reach ──────────────────────────── */}
          <DimensionSection
            label="Reach & Engagement"
            score={breakdown.reach}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          >
            {estimatedReach && (
              <div className="grid grid-cols-2 gap-3">
                {estimatedReach.impressions && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-medium">Est. Impressions</p>
                    <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-0.5">
                      {formatNumber(estimatedReach.impressions.low)} – {formatNumber(estimatedReach.impressions.high)}
                    </p>
                  </div>
                )}
                {estimatedReach.engagements && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-medium">Est. Engagements</p>
                    <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-0.5">
                      {formatNumber(estimatedReach.engagements.low)} – {formatNumber(estimatedReach.engagements.high)}
                    </p>
                  </div>
                )}
              </div>
            )}
            {!estimatedReach && (
              <p className="text-sm text-slate-400 italic">Reach estimates not available</p>
            )}
          </DimensionSection>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {estimatedCost && (
                <div>
                  <p className="text-xs text-slate-400 font-medium">Est. Cost Range</p>
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    {formatCurrency(estimatedCost.low)} – {formatCurrency(estimatedCost.high)}
                  </p>
                </div>
              )}
              {conf && (
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${conf.bg} ${conf.text} ${conf.border}`}>
                  {conf.label}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────

function DimensionSection({
  label,
  score,
  icon,
  children,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-sm font-semibold text-[var(--color-charcoal)]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${scoreBgColor(score)}`} style={{ width: `${score}%` }} />
          </div>
          <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function IndicatorBadge({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
      matched ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'
    }`}>
      {matched ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label}
    </span>
  );
}
