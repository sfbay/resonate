'use client';

/**
 * Budget Optimizer Panel
 *
 * Budget slider + priority selector → recommended publisher mix.
 * Shows total cost vs budget, alternative mixes, and "Apply" button.
 */

import { useState, useMemo } from 'react';
import { generateOptimizationAlternatives } from '@/lib/matching/budget-optimizer';
import type { OptimizationResult } from '@/lib/matching/budget-optimizer';
import type { MatchPublisherData, TargetAudienceData } from '@/lib/matching/mix-analysis';

interface BudgetOptimizerPanelProps {
  allMatches: MatchPublisherData[];
  target: TargetAudienceData;
  budgetRange?: { min: number; max: number };  // in cents
  onApply: (publisherIds: string[]) => void;
}

function formatCurrency(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function BudgetOptimizerPanel({
  allMatches,
  target,
  budgetRange,
  onApply,
}: BudgetOptimizerPanelProps) {
  const defaultBudget = budgetRange ? budgetRange.max : 1000000; // $10K default
  const [budget, setBudget] = useState(defaultBudget);
  const [selectedAlternative, setSelectedAlternative] = useState(0);

  const alternatives: OptimizationResult[] = useMemo(
    () => generateOptimizationAlternatives(allMatches, target, budget),
    [allMatches, target, budget]
  );

  const active = alternatives[selectedAlternative] || alternatives[0];

  if (allMatches.length === 0) return null;

  const minBudget = budgetRange ? budgetRange.min : 10000;
  const maxBudget = budgetRange ? Math.max(budgetRange.max, budgetRange.max * 2) : 5000000;

  // Publisher name lookup
  const nameMap = new Map(allMatches.map(m => [m.publisherId, m.publisherName]));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[var(--color-charcoal)] text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Budget Optimizer
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Find the best publisher mix for your budget</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Budget Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">Campaign Budget</label>
            <span className="text-sm font-bold text-[var(--color-charcoal)]">{formatCurrency(budget)}</span>
          </div>
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step={10000}
            value={budget}
            onChange={e => { setBudget(Number(e.target.value)); setSelectedAlternative(0); }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{formatCurrency(minBudget)}</span>
            <span>{formatCurrency(maxBudget)}</span>
          </div>
        </div>

        {/* Alternative Mix Cards */}
        {alternatives.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => setSelectedAlternative(i)}
                className={`text-left p-3 rounded-lg border text-xs transition-all ${
                  i === selectedAlternative
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-200'
                }`}
              >
                <p className={`font-semibold mb-0.5 ${i === selectedAlternative ? 'text-teal-700' : 'text-[var(--color-charcoal)]'}`}>
                  {alt.label || `Option ${i + 1}`}
                </p>
                <p className="text-slate-500">{alt.selectedPublishers.length} publishers</p>
                <p className="text-slate-400">{formatCurrency(alt.totalEstimatedCost.low)} – {formatCurrency(alt.totalEstimatedCost.high)}</p>
              </button>
            ))}
          </div>
        )}

        {/* Active Result */}
        {active && active.selectedPublishers.length > 0 && (
          <div className="space-y-3">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">Coverage</p>
                <p className={`text-lg font-bold ${active.coverageScore >= 80 ? 'text-emerald-600' : active.coverageScore >= 50 ? 'text-teal-600' : 'text-amber-600'}`}>
                  {active.coverageScore}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">Avg Match</p>
                <p className={`text-lg font-bold ${active.matchQualityScore >= 70 ? 'text-emerald-600' : active.matchQualityScore >= 50 ? 'text-teal-600' : 'text-slate-500'}`}>
                  {active.matchQualityScore}
                </p>
              </div>
            </div>

            {/* Cost bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Estimated cost</span>
                <span className="font-medium text-[var(--color-charcoal)]">
                  {formatCurrency(active.totalEstimatedCost.low)} – {formatCurrency(active.totalEstimatedCost.high)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    active.totalEstimatedCost.high <= budget ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (active.totalEstimatedCost.high / budget) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 text-right">Budget: {formatCurrency(budget)}</p>
            </div>

            {/* Selected publishers */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Suggested Mix</p>
              <div className="flex flex-wrap gap-1.5">
                {active.selectedPublishers.map(id => (
                  <span key={id} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                    {nameMap.get(id) || id.slice(0, 8)}
                  </span>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-0.5">
              {active.explanation.map((e, i) => (
                <p key={i} className="text-xs text-slate-500">{e}</p>
              ))}
            </div>

            {/* Apply button */}
            <button
              onClick={() => onApply(active.selectedPublishers)}
              className="w-full btn bg-[var(--color-teal)] text-white text-sm py-2.5 hover:bg-[var(--color-teal-dark)] transition-colors rounded-lg font-medium"
            >
              Apply Suggestion
            </button>
          </div>
        )}

        {active && active.selectedPublishers.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-amber-600 font-medium">Increase budget to see recommendations</p>
            <p className="text-xs text-slate-400 mt-1">Current budget is too low for any publisher</p>
          </div>
        )}
      </div>
    </div>
  );
}
