'use client';

/**
 * WizardHeader
 *
 * Publisher name, close button, and category tab navigation.
 */

import type { WizardCategory } from '@/lib/recommendations/wizard-types';
import { WIZARD_CATEGORIES } from '@/lib/recommendations/wizard-types';

interface WizardHeaderProps {
  publisherName: string;
  activeCategory: WizardCategory;
  onCategoryChange: (category: WizardCategory) => void;
  onClose: () => void;
  categoryCounts: Record<WizardCategory, number>;
}

const CATEGORY_ORDER: WizardCategory[] = [
  'audience_growth',
  'social_strategy',
  'platform_expansion',
  'community_landscape',
];

export function WizardHeader({
  publisherName,
  activeCategory,
  onCategoryChange,
  onClose,
  categoryCounts,
}: WizardHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      {/* Top bar */}
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Growth Opportunities</h1>
          <p className="text-sm text-slate-500 mt-0.5">{publisherName}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          aria-label="Close wizard"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Category tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Growth categories">
          {CATEGORY_ORDER.map((category) => {
            const config = WIZARD_CATEGORIES[category];
            const count = categoryCounts[category];
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-coral-500 text-coral-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-coral-100 text-coral-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
