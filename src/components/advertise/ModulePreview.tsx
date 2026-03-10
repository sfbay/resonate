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
      className={`relative py-28 px-4 overflow-hidden ${isDark ? 'bg-radiance text-white' : 'bg-warm-page text-charcoal'}`}
    >
      {/* Subtle decorative element */}
      {isDark && (
        <div className="absolute inset-0 bg-noise pointer-events-none opacity-40" />
      )}

      <div className={`relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center ${reverse ? 'md:[direction:rtl] [&>*]:[direction:ltr]' : ''}`}>
        {/* Text column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-charcoal/5 text-charcoal/70'}`}>
              {number}
            </span>
            <span className={`label ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-5">
            {title}
          </h2>
          <p className={`body-md leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            {body}
          </p>
          <Button variant="marigold" href={`${prefix}${ctaPath}`}>
            {ctaLabel}
          </Button>
        </div>

        {/* Mock panel */}
        <div className={`rounded-2xl overflow-hidden border-glow ${isDark ? 'shadow-2xl' : 'shadow-xl'}`}>
          <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
            {/* Browser chrome */}
            <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <div className={`ml-3 flex-1 h-5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-50'}`} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
