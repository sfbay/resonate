'use client';

import { useState } from 'react';
import { Nav, Footer } from '@/components/shared';
import { TemplatePicker } from '@/components/advertise/TemplatePicker';
import { useCityOptional } from '@/lib/geo/city-context';

export default function CreatePage() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const [template, setTemplate] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');

  const hasContent = headline.trim() || body.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav variant="advertise" />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Create Your Message
        </h1>
        <p className="text-gray-500 mb-8">
          Pick a template to get started, or build from scratch.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              1. Choose a format
            </h2>
            <TemplatePicker selected={template} onSelect={setTemplate} />

            {template && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  2. Write your message
                </h2>
                <input
                  type="text"
                  placeholder="Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white mb-3 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-marigold-500/30"
                />
                <textarea
                  placeholder="Body text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-marigold-500/30"
                />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              Preview
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-400">
                {template === 'social-post' && 'Social Post Preview'}
                {template === 'newsletter' && 'Newsletter Ad Preview'}
                {template === 'display' && 'Display Banner Preview'}
                {template === 'blank' && 'Custom Preview'}
                {!template && 'Select a template to preview'}
              </div>
              <div className="p-6">
                {template && (headline || body) ? (
                  <>
                    {headline && (
                      <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                        {headline}
                      </h3>
                    )}
                    {body && <p className="text-gray-600 text-sm leading-relaxed">{body}</p>}
                  </>
                ) : (
                  <p className="text-gray-300 text-center py-8">
                    {template ? 'Start typing to see your preview' : 'Choose a format to begin'}
                  </p>
                )}
              </div>
            </div>

            {hasContent && (
              <a
                href={`${prefix}/advertise/select?template=${template}`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-marigold-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-marigold-600 transition-colors"
              >
                Next: Choose Publishers &rarr;
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
