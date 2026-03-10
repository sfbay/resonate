'use client';

import { Button } from '@/components/shared';
import { useCityOptional } from '@/lib/geo/city-context';

interface ModulePreviewProps {
  id: string;
  number: string;
  label: string;
  title: React.ReactNode;
  body: string;
  ctaLabel: string;
  ctaPath: string;
  variant: 'light' | 'dark';
  reverse?: boolean;
  children: React.ReactNode;
}

export function ModulePreview({
  id, number, label, title, body, ctaLabel, ctaPath, variant, reverse, children,
}: ModulePreviewProps) {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const isDark = variant === 'dark';

  return (
    <section
      id={id}
      className={`py-24 px-4 ${isDark ? 'bg-charcoal text-white' : 'bg-cream text-charcoal'}`}
    >
      <div className={`max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:[direction:rtl] [&>*]:[direction:ltr]' : ''}`}>
        <div>
          <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            {number} — {label}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-4">
            {title}
          </h2>
          <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            {body}
          </p>
          <Button variant="marigold" href={`${prefix}${ctaPath}`}>
            {ctaLabel}
          </Button>
        </div>
        <div className={`rounded-2xl overflow-hidden shadow-xl border ${isDark ? 'bg-charcoal-light border-white/10' : 'bg-white border-gray-100'}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
