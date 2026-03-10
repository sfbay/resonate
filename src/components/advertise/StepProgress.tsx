'use client';

import { useCityOptional } from '@/lib/geo/city-context';

const STEPS = [
  { key: 'create', label: 'Create', path: '/advertise/create' },
  { key: 'select', label: 'Select', path: '/advertise/select' },
  { key: 'amplify', label: 'Amplify', path: '/advertise/amplify' },
  { key: 'validate', label: 'Validate', path: '/advertise/validate' },
];

interface StepProgressProps {
  current: 'create' | 'select' | 'amplify' | 'validate';
}

export function StepProgress({ current }: StepProgressProps) {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1 mb-5">
      {STEPS.map((step, i) => {
        const isCurrent = step.key === current;
        const isPast = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div className={`w-6 h-px mx-0.5 ${isPast ? 'bg-white/40' : 'bg-white/10'}`} />
            )}
            <a
              href={`${prefix}${step.path}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-white/20 text-white'
                  : isPast
                    ? 'text-white/60 hover:text-white/80'
                    : 'text-white/30'
              }`}
            >
              <span className={`w-4.5 h-4.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                isCurrent
                  ? 'bg-white text-charcoal'
                  : isPast
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/40'
              }`}>
                {isPast ? (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : (
                  i + 1
                )}
              </span>
              {step.label}
            </a>
          </div>
        );
      })}
    </div>
  );
}
