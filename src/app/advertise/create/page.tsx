'use client';

import { useState } from 'react';
import { Nav, Footer } from '@/components/shared';
import { TemplatePicker } from '@/components/advertise/TemplatePicker';
import { useCityOptional } from '@/lib/geo/city-context';

const FORMAT_LABELS: Record<string, string> = {
  'social-post': 'Social Post Preview',
  newsletter: 'Newsletter Ad Preview',
  display: 'Display Banner Preview',
  blank: 'Custom Preview',
};

export default function CreatePage() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const [template, setTemplate] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');

  const hasContent = headline.trim() || body.trim();

  return (
    <div className="min-h-screen bg-warm-page">
      <Nav variant="advertise" />

      {/* Page header */}
      <div className="relative bg-radiance hero-texture overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16 text-white">
          <p className="label text-marigold-400 mb-3">Step 01</p>
          <h1 className="display-md mb-3">Create Your Message</h1>
          <p className="text-gray-400 text-lg max-w-lg">
            Pick a template to get started, or build from scratch.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left — builder */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-marigold-500/10 text-marigold-600 text-xs font-bold">1</span>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Choose a format</h2>
            </div>
            <TemplatePicker selected={template} onSelect={setTemplate} />

            {template && (
              <div className="mt-10 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-marigold-500/10 text-marigold-600 text-xs font-bold">2</span>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Write your message</h2>
                </div>
                <input
                  type="text"
                  placeholder="Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white mb-3 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-marigold-500/30 focus:border-marigold-500/50 transition-all"
                />
                <textarea
                  placeholder="Body text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-marigold-500/30 focus:border-marigold-500/50 transition-all"
                />
              </div>
            )}
          </div>

          {/* Right — preview */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Preview</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden border-glow sticky top-24">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
                <div className="w-2 h-2 rounded-full bg-red-300" />
                <div className="w-2 h-2 rounded-full bg-yellow-300" />
                <div className="w-2 h-2 rounded-full bg-green-300" />
                <div className="ml-3 flex-1 h-4 rounded-full bg-gray-100" />
              </div>
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400">
                  {template ? FORMAT_LABELS[template] || 'Preview' : 'Select a template to preview'}
                </span>
              </div>
              <div className="p-6 min-h-[200px] flex items-center justify-center">
                {template && (headline || body) ? (
                  <div className="w-full animate-fade-in-up">
                    {headline && (
                      <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">{headline}</h3>
                    )}
                    {body && <p className="text-gray-600 text-sm leading-relaxed">{body}</p>}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {template ? 'Start typing to see your preview' : 'Choose a format to begin'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {hasContent && (
              <a
                href={`${prefix}/advertise/select?template=${template}`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-marigold-500 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-marigold-600 transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up"
              >
                Next: Choose Publishers
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
