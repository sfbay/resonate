'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';
import { PublisherCard, PublisherCardData } from '@/components/advertise/PublisherCard';
import { StepProgress } from '@/components/advertise/StepProgress';
import { useCityOptional } from '@/lib/geo/city-context';
import { useRecordVisit } from '@/lib/navigation/use-record-visit';
import { getSupabaseClient } from '@/lib/db/supabase';

// Seeded publisher UUID prefixes by city
const CITY_ID_PREFIX: Record<string, string> = {
  sf: '11111111-',
  chicago: '22222222-',
};

export default function SelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-page"><Nav variant="advertise" /><main className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main></div>}>
      <SelectPageInner />
    </Suspense>
  );
}

function SelectPageInner() {
  useRecordVisit();
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const searchParams = useSearchParams();

  const [publishers, setPublishers] = useState<PublisherCardData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const param = searchParams.get('publishers');
    return param ? new Set(param.split(',')) : new Set();
  });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    const cityPrefix = cityCtx ? CITY_ID_PREFIX[cityCtx.slug] : null;
    let query = supabase
      .from('publishers')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    if (cityPrefix) {
      query = query.like('id', `${cityPrefix}%`);
    }
    query.then(async ({ data: pubData }) => {
        if (!pubData) return;

        const { data: profiles } = await (supabase as any)
          .from('audience_profiles')
          .select('publisher_id, neighborhoods, languages');

        const profileMap = new Map<string, { neighborhoods: string[]; languages: string[] }>();
        if (profiles) {
          for (const p of profiles) {
            profileMap.set(p.publisher_id, {
              neighborhoods: p.neighborhoods || [],
              languages: p.languages || ['english'],
            });
          }
        }

        setPublishers(
          pubData.map((p: any) => {
            const profile = profileMap.get(p.id);
            return {
              id: p.id,
              name: p.name,
              neighborhoods: profile?.neighborhoods || [],
              reach: 0,
              languages: profile?.languages || ['english'],
              startingPrice: 1900,
            };
          })
        );
      });
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return publishers;
    const q = filter.toLowerCase();
    return publishers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhoods.some((n) => n.toLowerCase().includes(q))
    );
  }, [publishers, filter]);

  function togglePublisher(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const url = new URL(window.location.href);
      if (next.size > 0) url.searchParams.set('publishers', [...next].join(','));
      else url.searchParams.delete('publishers');
      window.history.replaceState({}, '', url.toString());
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-warm-page">
      <Nav variant="advertise" />

      {/* Page header */}
      <div className="relative bg-radiance hero-texture overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-16 text-white">
          <StepProgress current="select" />
          <h1 className="display-md mb-3">Choose Your Channels</h1>
          <p className="text-gray-400 text-lg max-w-lg">
            Browse publishers by neighborhood, language, and reach. Select the ones that fit your audience.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Search bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Filter by name or neighborhood..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Publisher list */}
        <div className="flex flex-col gap-3">
          {filtered.map((pub, i) => (
            <div key={pub.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s`, opacity: 0 }}>
              <PublisherCard
                publisher={pub}
                selected={selected.has(pub.id)}
                onToggle={togglePublisher}
              />
            </div>
          ))}
          {filtered.length === 0 && publishers.length > 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </div>
              <p className="text-gray-400">No publishers match your filter.</p>
            </div>
          )}
        </div>
      </main>

      {/* Sticky checkout bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-3.5 shadow-2xl">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-sm font-bold">
                  {selected.size}
                </span>
                <span className="font-medium text-sm">
                  publisher{selected.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <a
                href={`${prefix}/advertise/amplify?publishers=${[...selected].join(',')}`}
                className="bg-white text-teal-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-all hover:shadow-md"
              >
                Continue to Checkout
                <svg className="w-4 h-4 inline-block ml-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
